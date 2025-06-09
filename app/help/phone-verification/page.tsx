"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PhoneVerificationHelpPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setLoading(false)
    setSubmitted(true)
    setEmail("")
    setMessage("")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center z-10 border-b">
        <Link href="/help" className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-xl font-semibold ml-2 text-foreground">Phone Verification Help</h1>
      </header>

      <div className="container max-w-4xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Phone Verification Troubleshooting</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>I'm not receiving the verification code</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Make sure you entered the correct phone number with country code</li>
                    <li>Check if your phone can receive SMS messages</li>
                    <li>Check if you have signal or network connectivity</li>
                    <li>Try requesting a new code after waiting 1 minute</li>
                    <li>Some carriers may delay message delivery during high traffic periods</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>The verification code doesn't work</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Make sure you're entering the most recent code you received</li>
                    <li>Verification codes expire after 10 minutes</li>
                    <li>Enter the code exactly as received, without spaces</li>
                    <li>Try requesting a new code if the current one isn't working</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>I'm getting an "already registered" error</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    This means an account already exists with this phone number. You have a few options:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Sign in to your existing account</li>
                    <li>Use a different phone number for registration</li>
                    <li>If you don't remember creating an account, try the password recovery option</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>I'm getting "too many attempts" error</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">For security reasons, we limit the number of verification attempts:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Wait 30 minutes before trying again</li>
                    <li>Make sure you're entering the correct code</li>
                    <li>If you continue to have issues, contact support</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Still having trouble?</CardTitle>
                <CardDescription>Contact our support team and we'll help you resolve the issue.</CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium">Support request submitted</h3>
                    <p className="text-muted-foreground mt-2">
                      We've received your request and will get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Your Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Describe the issue
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Please describe the problem you're experiencing..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Submit Support Request"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">Response time: Usually within 24 hours</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
