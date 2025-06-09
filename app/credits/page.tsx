"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, AlertCircle, DollarSign } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"

export default function CreditsPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [credits, setCredits] = useState(5)
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  })

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Redirect hirers to home page
    if (storedUserType === "hirer") {
      window.location.href = "/home/hirer"
    }
  }, [])

  const creditPackages = [
    { id: 1, credits: 10, price: 19.99, popular: false },
    { id: 2, credits: 25, price: 39.99, popular: true },
    { id: 3, credits: 50, price: 69.99, popular: false },
    { id: 4, credits: 100, price: 119.99, popular: false },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCardDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handlePurchase = () => {
    // Validate card details
    if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
      alert("Please fill in all card details")
      return
    }

    // In a real app, this would process the payment
    setPaymentSuccess(true)

    // Add credits
    const packageInfo = creditPackages.find((pkg) => pkg.id === selectedPackage)
    if (packageInfo) {
      setCredits((prev) => prev + packageInfo.credits)
    }

    // Reset form
    setTimeout(() => {
      setPaymentSuccess(false)
      setShowPaymentForm(false)
      setSelectedPackage(null)
      setCardDetails({
        number: "",
        name: "",
        expiry: "",
        cvc: "",
      })
    }, 3000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4 flex items-center bg-white shadow-soft z-10">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Lead Credits</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Credits Card */}
        <Card className="border-0 rounded-xl overflow-hidden bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Credits</h2>
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold mb-2">{credits}</div>
            <p className="text-sm opacity-80">Use credits to apply for jobs and access leads</p>
          </CardContent>
        </Card>

        {/* How Credits Work */}
        <Card className="border border-gray-100 rounded-xl overflow-hidden shadow-card">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">How Credits Work</h2>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <p className="text-sm text-gray-600">Purchase credits to apply for jobs and access leads</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <p className="text-sm text-gray-600">Each lead or job application costs 1 credit</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <p className="text-sm text-gray-600">When you get hired, you earn back 1 credit as a bonus</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        {!showPaymentForm ? (
          <div className="space-y-3">
            <h2 className="font-semibold">Buy Credits</h2>
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedPackage === pkg.id
                    ? "border-secondary-500 bg-secondary-50 shadow-medium"
                    : "shadow-card hover:shadow-medium"
                } ${pkg.popular ? "relative" : ""}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium shadow-sm">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{pkg.credits} Credits</h3>
                      <p className="text-sm text-gray-600">${(pkg.price / pkg.credits).toFixed(2)} per credit</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${pkg.price}</p>
                      {pkg.popular && <p className="text-xs text-green-600">Best Value</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              onClick={() => setShowPaymentForm(true)}
              disabled={selectedPackage === null}
              className={`w-full rounded-lg transition-all duration-200 shadow-button ${
                selectedPackage !== null
                  ? "bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue to Payment
            </Button>
          </div>
        ) : (
          <Card className="border rounded-lg overflow-hidden">
            <CardContent className="p-4">
              {paymentSuccess ? (
                <div className="text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="font-semibold text-lg mb-2">Payment Successful!</h2>
                  <p className="text-sm text-gray-600 mb-4">Your credits have been added to your account.</p>
                  <Button
                    onClick={() => {
                      setPaymentSuccess(false)
                      setShowPaymentForm(false)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-semibold mb-4">Payment Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                        Card Number
                      </label>
                      <Input
                        id="cardNumber"
                        name="number"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium mb-1">
                        Cardholder Name
                      </label>
                      <Input
                        id="cardName"
                        name="name"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium mb-1">
                          Expiry Date
                        </label>
                        <Input
                          id="cardExpiry"
                          name="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="cardCvc" className="block text-sm font-medium mb-1">
                          CVC
                        </label>
                        <Input
                          id="cardCvc"
                          name="cvc"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-sm text-blue-600">
                        You will be charged $
                        {creditPackages.find((pkg) => pkg.id === selectedPackage)?.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowPaymentForm(false)
                          setSelectedPackage(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handlePurchase}>
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <div>
          <h2 className="font-semibold mb-3">Transaction History</h2>
          <Card className="border rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Purchased 25 Credits</p>
                    <p className="text-xs text-gray-500">Dec 10, 2023</p>
                  </div>
                  <p className="font-medium">$39.99</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Purchased 10 Credits</p>
                    <p className="text-xs text-gray-500">Nov 25, 2023</p>
                  </div>
                  <p className="font-medium">$19.99</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Welcome Bonus</p>
                    <p className="text-xs text-gray-500">Nov 15, 2023</p>
                  </div>
                  <p className="font-medium text-green-600">+5 Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
