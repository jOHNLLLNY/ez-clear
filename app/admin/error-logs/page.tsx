"use client"

import { useState } from "react"
import { useApiWithRetry } from "@/hooks/use-api-with-retry"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

interface ErrorLog {
  id: number
  error_message: string
  component_stack: string
  url: string
  user_agent: string
  timestamp: string
  resolved: boolean
}

export default function ErrorLogsPage() {
  const [activeTab, setActiveTab] = useState("all")

  const {
    data: errorLogs,
    loading,
    error,
    retry,
  } = useApiWithRetry<ErrorLog[]>(async () => {
    const response = await fetch("/api/error-logs")
    if (!response.ok) {
      throw new Error("Failed to fetch error logs")
    }
    return response.json()
  })

  const markAsResolved = async (id: number) => {
    try {
      const response = await fetch(`/api/error-logs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to update error log")
      }

      retry()
    } catch (error) {
      console.error("Error updating error log:", error)
    }
  }

  const filteredLogs = errorLogs?.filter((log) => {
    if (activeTab === "resolved") return log.resolved
    if (activeTab === "unresolved") return !log.resolved
    return true
  })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Журнал помилок</h1>
        <Button onClick={retry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Оновити
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Всі</TabsTrigger>
          <TabsTrigger value="unresolved">Невирішені</TabsTrigger>
          <TabsTrigger value="resolved">Вирішені</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-xl font-bold mb-2">Помилка завантаження</h3>
                  <p className="text-muted-foreground mb-4">{error.message}</p>
                  <Button onClick={retry}>Спробувати знову</Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredLogs?.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Немає помилок</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "resolved"
                      ? "Немає вирішених помилок"
                      : activeTab === "unresolved"
                        ? "Немає невирішених помилок"
                        : "Немає зареєстрованих помилок"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredLogs?.map((log) => (
                <Card key={log.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{log.error_message}</CardTitle>
                        <CardDescription>
                          {new Date(log.timestamp).toLocaleString()} • {log.url}
                        </CardDescription>
                      </div>
                      <Badge variant={log.resolved ? "default" : "destructive"}>
                        {log.resolved ? "Вирішено" : "Невирішено"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded-md mb-4 overflow-auto max-h-40">
                      <pre className="text-xs font-mono">{log.component_stack}</pre>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">User Agent: {log.user_agent}</div>
                      {!log.resolved && (
                        <Button variant="outline" size="sm" onClick={() => markAsResolved(log.id)}>
                          Позначити як вирішене
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
