"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, HelpCircle, MessageCircle, Mail, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"

interface FAQ {
  id: number
  question: string
  answer: string
  isOpen: boolean
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question: "How do I create an account?",
      answer:
        "To create an account, click on the 'Sign Up' button on the login page. Fill in your details including name, email, and password. You'll receive a verification email to confirm your account.",
      isOpen: false,
    },
    {
      id: 2,
      question: "How do I post a job?",
      answer:
        "To post a job, navigate to the 'Post Job' section from the bottom navigation. Fill in the job details including title, description, location, and payment information. Click 'Post' to publish your job.",
      isOpen: false,
    },
    {
      id: 3,
      question: "How do I apply for a job?",
      answer:
        "Browse available jobs in the 'Find Jobs' section. When you find a job you're interested in, click on it to view details. Click the 'Apply' button and follow the prompts to submit your application.",
      isOpen: false,
    },
    {
      id: 4,
      question: "How do payments work?",
      answer:
        "Payments are processed securely through our platform. Hirers can pay using credit/debit cards or other supported payment methods. Workers receive payments directly to their linked bank accounts after job completion.",
      isOpen: false,
    },
    {
      id: 5,
      question: "How do I contact support?",
      answer:
        "You can contact our support team through the 'Contact Us' section below. We offer email support, live chat, and phone support during business hours.",
      isOpen: false,
    },
  ])

  const toggleFAQ = (id: number) => {
    setFaqs(
      faqs.map((faq) => {
        if (faq.id === id) {
          return { ...faq, isOpen: !faq.isOpen }
        }
        return faq
      }),
    )
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center bg-card shadow-soft z-10">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Help & Support</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>

        {/* FAQs */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <Card key={faq.id} className="border border-border bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      className="w-full p-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                      onClick={() => toggleFAQ(faq.id)}
                    >
                      <span className="font-medium">{faq.question}</span>
                      {faq.isOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {faq.isOpen && (
                      <div className="p-4 pt-0 text-sm text-muted-foreground border-t border-border">{faq.answer}</div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-card rounded-lg">
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm mt-2">Try different keywords or browse the categories below</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Us */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-primary" />
            Contact Us
          </h2>
          <div className="grid grid-cols-1">
            <Card className="border border-border bg-card hover:shadow-medium transition-all duration-200">
              <CardContent className="p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-muted-foreground">24/7 response</p>
                  <p className="text-sm font-medium mt-1">support@ez-clear.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
