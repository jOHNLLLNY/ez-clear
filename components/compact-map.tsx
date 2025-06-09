"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    google: any
    initCompactMap: () => void
  }
}

export default function CompactMap() {
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.initCompactMap = () => {
        try {
          setMapLoaded(true)
          console.log("Google Maps API loaded for compact map")
        } catch (error) {
          console.error("Error in initCompactMap:", error)
        }
      }
    }
  }, [])

  // Initialize map when API is loaded
  useEffect(() => {
    if (typeof window !== "undefined" && mapLoaded && mapRef.current) {
      try {
        // Default location (Toronto)
        const defaultLocation = { lat: 43.65107, lng: -79.347015 }

        // Dark mode map styling
        const darkMapStyle = [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ]

        const mapOptions = {
          center: defaultLocation,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: darkMapStyle,
        }

        const map = new window.google.maps.Map(mapRef.current, mapOptions)

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }

              // Center map on user location
              map.setCenter(userLocation)

              // Add marker for user location
              new window.google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                },
              })
            },
            (error) => {
              console.log("Geolocation error:", error.message)
              // Fallback to default location if geolocation fails

              // Add marker for default location
              new window.google.maps.Marker({
                position: defaultLocation,
                map: map,
                title: "Default Location",
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                },
              })
            },
          )
        }
      } catch (error) {
        console.error("Error initializing compact map:", error)
      }
    }
  }, [mapLoaded])

  return (
    <>
      {typeof window !== "undefined" && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAokgtc6yWNaUFaN7oXYArlFv5-XlfI7yw&callback=initCompactMap`}
          strategy="afterInteractive"
          onError={(e) => {
            console.error("Google Maps loading error:", e)
          }}
        />
      )}
      <div
        ref={mapRef}
        className="w-full h-[150px] rounded-lg overflow-hidden"
        aria-label="Map showing job locations"
      ></div>
    </>
  )
}
