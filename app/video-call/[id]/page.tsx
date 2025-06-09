"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, User } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function VideoCallPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState("connecting") // connecting, active, ended
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const params = useParams()
  const callId = params.id

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Simulate connecting and then active call
    const timer = setTimeout(() => {
      setCallStatus("active")

      // Request camera and microphone access
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          // Display local video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }

          // In a real app, this would connect to the other user
          // For demo, we'll just show a placeholder for remote video
        })
        .catch((err) => {
          console.error("Error accessing media devices:", err)
        })
    }, 2000)

    // Start call duration timer when call is active
    let durationTimer: NodeJS.Timeout
    if (callStatus === "active") {
      durationTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      clearTimeout(timer)
      if (durationTimer) clearInterval(durationTimer)

      // Clean up media streams
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)

    // In a real app, this would mute the actual audio track
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted // Toggle mute state
      })
    }
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)

    // In a real app, this would disable the actual video track
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff // Toggle video state
      })
    }
  }

  const endCall = () => {
    setCallStatus("ended")

    // In a real app, this would disconnect from the call
    setTimeout(() => {
      window.location.href = "/messages"
    }, 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Call Status Bar */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/messages" className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-semibold">Call with John Smith</h1>
            <p className="text-xs text-gray-400">
              {callStatus === "connecting"
                ? "Connecting..."
                : callStatus === "active"
                  ? formatDuration(callDuration)
                  : "Call ended"}
            </p>
          </div>
        </div>
        {callStatus === "active" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={() => (window.location.href = `/messages/${callId}`)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (Full Screen) */}
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          {callStatus === "connecting" ? (
            <div className="text-white text-center">
              <div className="animate-pulse mb-2">Connecting...</div>
              <div className="text-sm text-gray-400">Please wait while we connect your call</div>
            </div>
          ) : callStatus === "ended" ? (
            <div className="text-white text-center">
              <div className="mb-2">Call Ended</div>
              <div className="text-sm text-gray-400">Redirecting to messages...</div>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              poster="/placeholder.svg?height=600&width=400"
              autoPlay
              playsInline
            />
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {callStatus === "active" && (
          <div className="absolute bottom-20 right-4 w-1/3 max-w-[150px] aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted // Always mute local video to prevent feedback
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Call Controls */}
      {callStatus === "active" && (
        <div className="bg-gray-900 text-white p-4 flex items-center justify-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-12 w-12 ${isMuted ? "bg-red-500 text-white" : "bg-gray-700"}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-12 w-12 ${isVideoOff ? "bg-red-500 text-white" : "bg-gray-700"}`}
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 bg-red-600 text-white"
            onClick={endCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
