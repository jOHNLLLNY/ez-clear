"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/context/language-context"
import { Home, User, MessageSquare, Plus, Search, Briefcase, Bell, Snowflake, Leaf, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function LanguagePreviewPage() {
  const { language, setLanguage, t, availableLanguages } = useLanguage()
  const [selectedTab, setSelectedTab] = useState("navigation")

  // Mock data for testing
  const mockPendingCount = 3
  const mockUnreadCount = 5

  // Simulate different user types
  const [userType, setUserType] = useState<"worker" | "hirer">("worker")

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Language Preview Tool</h1>
          <p className="text-muted-foreground">
            Preview how UI elements look in different languages to identify potential layout issues.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-64">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">User Type</label>
                  <Select value={userType} onValueChange={(value) => setUserType(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="hirer">Hirer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/debug")}>
                    Back to Debug
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <Card>
              <CardHeader className="border-b">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="navigation">Navigation</TabsTrigger>
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="pages">Pages</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsContent value="navigation" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Bottom Navigation</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="p-4 bg-background">
                            {userType === "worker" ? (
                              <div className="border-t border-border bg-card shadow-sm">
                                <div className="grid grid-cols-5 h-16">
                                  <div className="flex flex-col items-center justify-center text-primary">
                                    <Home className="h-6 w-6 text-primary" />
                                    <span className="text-xs mt-1 font-medium">{t("home")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <Search className="h-6 w-6" />
                                    <span className="text-xs mt-1 font-medium">{t("findJobs")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <div className="relative">
                                      <Briefcase className="h-6 w-6" />
                                      {mockPendingCount > 0 && (
                                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-red-500 text-white text-[0.6rem] flex items-center justify-center">
                                          {mockPendingCount}
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs mt-1 font-medium">{t("myJobs")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <MessageSquare className="h-6 w-6" />
                                    <span className="text-xs mt-1 font-medium">{t("messages")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <User className="h-6 w-6" />
                                    <span className="text-xs mt-1 font-medium">{t("profile")}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="border-t border-border bg-card shadow-sm">
                                <div className="grid grid-cols-5 h-16">
                                  <div className="flex flex-col items-center justify-center text-primary">
                                    <Home className="h-6 w-6 text-primary" />
                                    <span className="text-xs mt-1 font-medium">{t("home")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <div className="relative">
                                      <Briefcase className="h-6 w-6" />
                                      {mockUnreadCount > 0 && (
                                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-red-500 text-white text-[0.6rem] flex items-center justify-center">
                                          {mockUnreadCount}
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs mt-1 font-medium">{t("myJobs")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-md">
                                      <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xs mt-1 font-medium text-muted-foreground">{t("post")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <MessageSquare className="h-6 w-6" />
                                    <span className="text-xs mt-1 font-medium">{t("messages")}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <User className="h-6 w-6" />
                                    <span className="text-xs mt-1 font-medium">{t("profile")}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Header Navigation</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="p-4 bg-card shadow-sm">
                            <div className="flex items-center justify-between">
                              <h1 className="text-xl font-bold">{t("findJobs")}</h1>
                              <div className="flex items-center gap-4">
                                <Bell className="h-5 w-5" />
                                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="components" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Service Cards</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <Card className="border rounded-2xl overflow-hidden">
                            <CardContent className="p-3 flex flex-col items-center justify-center">
                              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Wrench className="h-5 w-5 text-primary" />
                              </div>
                              <span className="text-xs font-medium text-center">{t("renovation")}</span>
                            </CardContent>
                          </Card>

                          <Card className="border rounded-2xl overflow-hidden">
                            <CardContent className="p-3 flex flex-col items-center justify-center">
                              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Snowflake className="h-5 w-5 text-primary" />
                              </div>
                              <span className="text-xs font-medium text-center">{t("snowRemoval")}</span>
                            </CardContent>
                          </Card>

                          <Card className="border rounded-2xl overflow-hidden">
                            <CardContent className="p-3 flex flex-col items-center justify-center">
                              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Leaf className="h-5 w-5 text-primary" />
                              </div>
                              <span className="text-xs font-medium text-center">{t("outdoor")}</span>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                          <Button>{t("apply")}</Button>
                          <Button variant="outline">{t("details")}</Button>
                          <Button variant="secondary">{t("viewAll")}</Button>
                          <Button variant="destructive">{t("cancel")}</Button>
                          <Button variant="ghost">{t("saveChanges")}</Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Section Headers</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">{t("services")}</h2>
                            <Link href="#" className="text-primary text-sm font-medium">
                              {t("viewAll")}
                            </Link>
                          </div>
                          <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">{t("availableJobs")}</h2>
                            <Link href="#" className="text-primary text-sm font-medium">
                              {t("viewAll")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pages" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Settings Page</h3>
                        <div className="border rounded-lg overflow-hidden p-4">
                          <h1 className="text-xl font-bold mb-4">{t("settings")}</h1>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b">
                              <span>{t("language")}</span>
                              <span className="text-muted-foreground">
                                {availableLanguages.find((l) => l.code === language)?.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                              <span>{t("notifications")}</span>
                              <span className="text-muted-foreground">On</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                              <span>{t("account")}</span>
                              <span className="text-muted-foreground">user@example.com</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Profile Page</h3>
                        <div className="border rounded-lg overflow-hidden p-4">
                          <h1 className="text-xl font-bold mb-4">{t("profile")}</h1>
                          <div className="flex flex-col items-center gap-3 mb-4">
                            <div className="h-20 w-20 rounded-full bg-gray-200"></div>
                            <h2 className="text-lg font-medium">John Doe</h2>
                          </div>
                          <div className="space-y-3">
                            <Button className="w-full">{t("editProfile")}</Button>
                            <Button variant="outline" className="w-full">
                              {t("changePassword")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Translation Length Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Key</th>
                    <th className="text-left py-2 px-4">English</th>
                    <th className="text-left py-2 px-4">
                      Current ({availableLanguages.find((l) => l.code === language)?.name})
                    </th>
                    <th className="text-left py-2 px-4">Length Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "home",
                    "findJobs",
                    "myJobs",
                    "messages",
                    "profile",
                    "settings",
                    "services",
                    "renovation",
                    "snowRemoval",
                    "outdoor",
                    "availableJobs",
                    "details",
                    "apply",
                    "viewAll",
                  ].map((key) => {
                    const enText = t(key)
                    const currentText = t(key)
                    const lengthDiff = currentText.length - enText.length
                    let diffClass = "text-gray-500"

                    if (lengthDiff > 5) {
                      diffClass = "text-amber-500 font-medium"
                    }
                    if (lengthDiff > 10) {
                      diffClass = "text-red-500 font-medium"
                    }

                    return (
                      <tr key={key} className="border-b">
                        <td className="py-2 px-4 font-mono text-sm">{key}</td>
                        <td className="py-2 px-4">{enText}</td>
                        <td className="py-2 px-4">{currentText}</td>
                        <td className={`py-2 px-4 ${diffClass}`}>{lengthDiff > 0 ? `+${lengthDiff}` : lengthDiff}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
