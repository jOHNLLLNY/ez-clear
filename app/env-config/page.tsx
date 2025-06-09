"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function EnvConfigPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  // Load values from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("NEXT_PUBLIC_SUPABASE_URL")
      const savedKey = localStorage.getItem("NEXT_PUBLIC_SUPABASE_ANON_KEY")

      if (savedUrl) setSupabaseUrl(savedUrl)
      if (savedKey) setSupabaseAnonKey(savedKey)
    }
  }, [])

  const handleSave = () => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        setStatus("error")
        setMessage("Both fields are required")
        return
      }

      // Save to localStorage
      localStorage.setItem("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl)
      localStorage.setItem("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey)

      // Set global variables for immediate use
      if (typeof window !== "undefined") {
        // @ts-ignore - Adding to window for immediate use
        window.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl
        // @ts-ignore - Adding to window for immediate use
        window.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey
      }

      setStatus("success")
      setMessage("Environment variables saved successfully! You can now use the app.")
    } catch (error) {
      setStatus("error")
      setMessage(`Failed to save: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const copyVercelCommand = () => {
    const command = `vercel env add NEXT_PUBLIC_SUPABASE_URL ${supabaseUrl} && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY ${supabaseAnonKey}`
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Environment Configuration</CardTitle>
          <CardDescription>
            Enter your Supabase credentials to use the app. These will be stored in your browser for this session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="supabase-url">Supabase URL</Label>
            <Input
              id="supabase-url"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabase-key">Supabase Anon Key</Label>
            <Input
              id="supabase-key"
              placeholder="your-anon-key"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              type="password"
            />
          </div>

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <h3 className="text-amber-800 font-medium mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
              Important: For permanent configuration
            </h3>
            <p className="text-amber-700 text-sm mb-3">
              This temporary solution only works for the current browser session. For a permanent solution, add these
              environment variables to your Vercel project:
            </p>
            <div className="bg-amber-100 p-3 rounded text-xs font-mono text-amber-900 relative mb-2">
              <div>NEXT_PUBLIC_SUPABASE_URL={supabaseUrl || "your-supabase-url"}</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY={supabaseAnonKey || "your-supabase-anon-key"}</div>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 bg-amber-50"
                onClick={copyVercelCommand}
              >
                {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <Link
              href="https://vercel.com/docs/projects/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 text-sm flex items-center hover:underline"
            >
              How to add environment variables to Vercel
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </CardFooter>
      </Card>

      {status === "success" && (
        <div className="max-w-2xl mx-auto mt-6 text-center">
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
