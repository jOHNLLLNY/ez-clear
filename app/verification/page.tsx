"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, Shield, AlertCircle, Camera } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"

export default function VerificationPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState("pending") // pending, in_progress, verified
  const [documents, setDocuments] = useState([
    { id: 1, type: "ID", status: "uploaded", file: null },
    { id: 2, type: "Insurance", status: "not_uploaded", file: null },
    { id: 3, type: "Business License", status: "not_uploaded", file: null },
  ])

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Redirect hirers to home page
    if (storedUserType === "hirer") {
      window.location.href = "/home/hirer"
    }
  }, [])

  const handleFileChange = (e, documentId) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === documentId ? { ...doc, status: "uploaded", file: e.target.result } : doc)),
        )
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmitVerification = () => {
    const allUploaded = documents.every((doc) => doc.status === "uploaded")

    if (!allUploaded) {
      alert("Please upload all required documents")
      return
    }

    setVerificationStatus("in_progress")

    // In a real app, this would send the documents to the server
    setTimeout(() => {
      setVerificationStatus("verified")
    }, 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center bg-card shadow-soft z-10">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Verification</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Status Card */}
        <Card
          className={`border border-border rounded-lg overflow-hidden ${
            verificationStatus === "verified"
              ? "bg-green-900/20"
              : verificationStatus === "in_progress"
                ? "bg-blue-900/20"
                : "bg-amber-900/20"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center">
              {verificationStatus === "verified" ? (
                <div className="h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
              ) : verificationStatus === "in_progress" ? (
                <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-amber-900/30 flex items-center justify-center mr-3">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
              )}
              <div>
                <h2 className="font-semibold">
                  {verificationStatus === "verified"
                    ? "Verified Account"
                    : verificationStatus === "in_progress"
                      ? "Verification In Progress"
                      : "Verification Required"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {verificationStatus === "verified"
                    ? "Your account is fully verified. Enjoy all platform benefits!"
                    : verificationStatus === "in_progress"
                      ? "We're reviewing your documents. This usually takes 1-2 business days."
                      : "Please upload the required documents to verify your account."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="space-y-2">
          <h2 className="font-semibold">Benefits of Verification</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm">Verified badge on your profile</p>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm">Higher ranking in search results</p>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm">Increased visibility to potential clients</p>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm">Increased trust from customers</p>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        {verificationStatus !== "verified" && (
          <div className="space-y-4">
            <h2 className="font-semibold">Required Documents</h2>

            {documents.map((document) => (
              <Card key={document.id} className="border border-border rounded-lg overflow-hidden bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{document.type}</h3>
                    {document.status === "uploaded" ? (
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">Uploaded</span>
                    ) : (
                      <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded-full">Required</span>
                    )}
                  </div>

                  {document.file ? (
                    <div className="relative">
                      <img
                        src={document.file || "/placeholder.svg"}
                        alt={`${document.type} Preview`}
                        className="h-32 w-full object-cover rounded-lg mb-2"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setDocuments((prev) =>
                            prev.map((doc) =>
                              doc.id === document.id ? { ...doc, status: "not_uploaded", file: null } : doc,
                            ),
                          )
                        }}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted">
                      <input
                        type="file"
                        id={`document-${document.id}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, document.id)}
                      />
                      <label htmlFor={`document-${document.id}`} className="cursor-pointer flex flex-col items-center">
                        <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload {document.type}</span>
                        <span className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF, max 5MB</span>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={handleSubmitVerification}
              disabled={verificationStatus === "in_progress" || !documents.every((doc) => doc.status === "uploaded")}
              className={`w-full ${
                verificationStatus === "in_progress" || !documents.every((doc) => doc.status === "uploaded")
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {verificationStatus === "in_progress" ? "Processing..." : "Submit for Verification"}
            </Button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
