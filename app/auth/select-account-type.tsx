"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Briefcase, UserCircle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"

export default function SelectAccountType() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const { t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{t("welcome")}</h1>
            <p className="text-muted-foreground">{t("selectAppUse")}</p>
          </div>

          <div className="space-y-4">
            <Card
              className={`cursor-pointer transition-all ${
                selectedType === "worker" ? "border-[#5B2EFF] bg-[#5B2EFF]/5" : ""
              }`}
              onClick={() => setSelectedType("worker")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5B2EFF]/10">
                    <Briefcase className="h-6 w-6 text-[#5B2EFF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{t("wantToWork")}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{t("findJobs")}</p>
                  </div>
                  {selectedType === "worker" && (
                    <div className="h-6 w-6 rounded-full bg-[#5B2EFF] flex items-center justify-center">
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1 4L4.5 7.5L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedType === "hirer" ? "border-[#5B2EFF] bg-[#5B2EFF]/5" : ""
              }`}
              onClick={() => setSelectedType("hirer")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5B2EFF]/10">
                    <UserCircle className="h-6 w-6 text-[#5B2EFF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{t("wantToHire")}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{t("postJobs")}</p>
                  </div>
                  {selectedType === "hirer" && (
                    <div className="h-6 w-6 rounded-full bg-[#5B2EFF] flex items-center justify-center">
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1 4L4.5 7.5L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90" disabled={!selectedType} asChild>
            <Link href="/auth/create-account">
              {t("continue")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
