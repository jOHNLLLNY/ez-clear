"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Maximize, Minimize, MapPin, X, Briefcase } from "lucide-react"
import Script from "next/script"
import BottomNavigation from "@/components/bottom-navigation"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface Job {
  id: number
  title: string
  description: string
  location: string
  service_type: string
  created_at: string
  status: string
  lat?: number
  lng?: number
}

export default function Map() {
  const router = useRouter()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showJobModal, setShowJobModal] = useState(false)

  // Fetch jobs from the database
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        const response = await fetch("/api/jobs?status=open")

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const data = await response.json()

        // For jobs without coordinates, generate them near Toronto
        const jobsWithCoordinates = data.map((job: Job) => {
          if (job.lat && job.lng) {
            return job
          }
          return {
            ...job,
            lat: 43.65107 + (Math.random() - 0.5) * 0.05,
            lng: -79.347015 + (Math.random() - 0.5) * 0.05,
          }
        })

        setJobs(jobsWithCoordinates)
      } catch (err: any) {
        console.error("Error fetching jobs:", err)
        setError(err.message || "Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Initialize Google Maps
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.initMap = () => {
        try {
          setMapLoaded(true)
          console.log("Google Maps API loaded successfully")
        } catch (error) {
          console.error("Error in initMap:", error)
        }
      }
    }
  }, [])

  // Setup map and markers when map is loaded and jobs are fetched
  useEffect(() => {
    if (typeof window !== "undefined" && mapLoaded && mapRef.current && !map && jobs.length > 0) {
      try {
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
          center: { lat: 43.65107, lng: -79.347015 }, // Toronto as default
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: darkMapStyle,
        }

        const newMap = new window.google.maps.Map(mapRef.current, mapOptions)
        setMap(newMap)

        // Create custom marker icon for jobs (briefcase icon)
        const briefcaseIcon = {
          path: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z",
          fillColor: "#00e6cf", // Primary teal color from your theme
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
          scale: 1.2,
          anchor: new window.google.maps.Point(12, 12),
        }

        // Add markers for each job
        const newMarkers = jobs
          .map((job) => {
            if (!job.lat || !job.lng) return null

            const marker = new window.google.maps.Marker({
              position: { lat: job.lat, lng: job.lng },
              map: newMap,
              title: job.title,
              icon: briefcaseIcon,
              animation: window.google.maps.Animation.DROP,
            })

            // Add click event to marker
            marker.addListener("click", () => {
              setSelectedJob(job)
              setShowJobModal(true)
            })

            return marker
          })
          .filter(Boolean)

        setMarkers(newMarkers)

        // Add current location marker if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }

              new window.google.maps.Marker({
                position: userLocation,
                map: newMap,
                title: "Your Location",
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                },
              })

              // Center map on user location
              newMap.setCenter(userLocation)
            },
            (error) => {
              console.error("Geolocation error:", error.message)
              // Silently fall back to default location
            },
          )
        }
      } catch (error) {
        console.error("Error initializing Google Maps:", error)
      }
    }
  }, [mapLoaded, map, jobs])

  // Handle fullscreen mode changes
  useEffect(() => {
    if (map) {
      // Trigger resize event to ensure map fills container
      setTimeout(() => {
        window.google.maps.event.trigger(map, "resize")
      }, 100)
    }
  }, [isFullscreen, map])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Google Maps Script */}
      {typeof window !== "undefined" && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAokgtc6yWNaUFaN7oXYArlFv5-XlfI7yw&libraries=places&callback=initMap`}
          strategy="afterInteractive"
          onError={(e) => {
            console.error("Google Maps loading error:", e)
          }}
        />
      )}

      <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-background" : "flex-1 bg-background"}`}>
        <div
          id="google-map"
          ref={mapRef}
          className={`${isFullscreen ? "absolute inset-0" : "absolute inset-0"}`}
          style={{ width: "100%", height: isFullscreen ? "100vh" : "100%" }}
        ></div>

        {/* Fullscreen button - Always visible in the top right */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90 text-white shadow-lg"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>

        {/* Close fullscreen button - Only visible in fullscreen mode */}
        {isFullscreen && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="secondary"
              className="bg-card shadow-lg flex items-center gap-2"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4" />
              <span>Close Map</span>
            </Button>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4 text-primary" />
              {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">{selectedJob?.description}</p>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={() => setShowJobModal(false)}>
              Close
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (selectedJob) {
                  router.push(`/job-details/${selectedJob.id}?apply=true`)
                }
              }}
            >
              Apply Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nearby Jobs Panel - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="bg-card p-4 border-t border-border">
          <h2 className="font-semibold mb-3">Nearby Jobs</h2>
          {loading ? (
            <div className="text-center py-2">Loading jobs...</div>
          ) : error ? (
            <div className="text-center py-2 text-red-500">Error: {error}</div>
          ) : jobs.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className={`border rounded-lg min-w-[250px] ${selectedJob?.id === job.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => {
                    setSelectedJob(job)
                    setShowJobModal(true)
                    // Center map on selected job
                    if (map && job.lat && job.lng) {
                      map.setCenter({ lat: job.lat, lng: job.lng })
                      map.setZoom(15)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-xs text-muted-foreground">{job.location}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/job-details/${job.id}?apply=true`)
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No jobs available in this area</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation - Only show when not in fullscreen */}
      {!isFullscreen && <BottomNavigation />}
    </div>
  )
}
