"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Gift, Share2, Copy, Check, Award } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"

export default function LoyaltyPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [points, setPoints] = useState(350)
  const [referralCode, setReferralCode] = useState("EZCLEAR123")
  const [copied, setCopied] = useState(false)
  const [referralEmail, setReferralEmail] = useState("")

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  const rewards = [
    {
      id: 1,
      title: "Featured Profile",
      points: 100,
      description: "Get your profile featured at the top of search results for 1 week",
      forUserType: "worker",
    },
    {
      id: 2,
      title: "Premium Listing",
      points: 250,
      description: "Get your profile highlighted in search results for 1 month",
      forUserType: "worker",
    },
    {
      id: 3,
      title: "Verified Badge",
      points: 500,
      description: "Get a verified badge on your profile",
      forUserType: "worker",
    },
    {
      id: 4,
      title: "Priority Support",
      points: 200,
      description: "Get priority customer support for 1 month",
      forUserType: "hirer",
    },
    {
      id: 5,
      title: "Featured Job Posts",
      points: 300,
      description: "Get your job posts highlighted for better visibility for 1 month",
      forUserType: "hirer",
    },
    {
      id: 6,
      title: "Early Access",
      points: 500,
      description: "Get early access to new features",
      forUserType: "both",
    },
  ]

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendReferral = () => {
    if (!referralEmail) {
      alert("Please enter an email address")
      return
    }

    // In a real app, this would send an API request
    alert(`Referral invitation sent to ${referralEmail}`)
    setReferralEmail("")
  }

  const handleRedeemReward = (rewardId) => {
    const reward = rewards.find((r) => r.id === rewardId)
    if (!reward) return

    if (points >= reward.points) {
      setPoints(points - reward.points)
      alert(`You've redeemed: ${reward.title}`)
    } else {
      alert("Not enough points to redeem this reward")
    }
  }

  // Filter rewards based on user type
  const filteredRewards = rewards.filter((reward) => reward.forUserType === userType || reward.forUserType === "both")

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center bg-card shadow-soft z-10">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Loyalty Program</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Points Card */}
        <Card className="border-0 rounded-xl overflow-hidden mb-6 bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Points</h2>
              <Award className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold mb-2">{points}</div>
            <p className="text-sm opacity-80">
              {userType === "worker"
                ? "Earn points by completing jobs and getting good reviews"
                : "Earn points by booking services and referring friends"}
            </p>
          </CardContent>
        </Card>

        {/* Referral Section */}
        <Card className="border border-border rounded-xl overflow-hidden mb-6 shadow-card bg-card">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <Share2 className="h-5 w-5 text-primary mr-2" />
              <h2 className="font-semibold">Refer & Earn</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Invite friends to EZ Clear and earn 100 points for each successful referral
            </p>

            <div className="flex items-center mb-4">
              <div className="flex-1 bg-muted p-2 rounded-l-lg font-mono text-sm">{referralCode}</div>
              <Button onClick={handleCopyReferralCode} className="rounded-l-none bg-primary hover:bg-primary/90">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Friend's email"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                className="bg-muted border-border"
              />
              <Button onClick={handleSendReferral} className="bg-primary hover:bg-primary/90">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Section */}
        <div>
          <h2 className="font-semibold mb-3">Available Rewards</h2>
          <div className="grid grid-cols-1 gap-3">
            {filteredRewards.map((reward) => (
              <Card
                key={reward.id}
                className="border border-border rounded-xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-200 bg-card"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Gift className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-medium">{reward.title}</h3>
                    </div>
                    <div className="text-sm font-semibold">{reward.points} pts</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                  <Button
                    onClick={() => handleRedeemReward(reward.id)}
                    disabled={points < reward.points}
                    className={`w-full rounded-lg transition-all duration-200 shadow-button ${
                      points >= reward.points
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {points >= reward.points ? "Redeem" : "Not Enough Points"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
