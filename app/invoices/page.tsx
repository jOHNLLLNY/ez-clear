"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Download, FileText } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { useUser } from "@/context/user-context"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export default function InvoicesPage() {
  const { userProfile } = useUser()
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
  )
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])

  // Client details
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientPhone, setClientPhone] = useState("")

  // Business details
  const [businessName, setBusinessName] = useState(userProfile?.businessName || "")
  const [businessAddress, setBusinessAddress] = useState(
    userProfile?.address
      ? `${userProfile.address}, ${userProfile.city}, ${userProfile.province?.toUpperCase() || ""} ${userProfile.postalCode || ""}`
      : "",
  )
  const [businessEmail, setBusinessEmail] = useState(userProfile?.email || "")
  const [businessPhone, setBusinessPhone] = useState(userProfile?.phone || "")

  // Invoice items
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }])

  // Notes
  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("Payment due within 30 days")

  // Calculate subtotal, tax, and total
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = 0.13 // 13% tax rate
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  // Add new item
  const addItem = () => {
    const newId = (items.length + 1).toString()
    setItems([...items, { id: newId, description: "", quantity: 1, rate: 0, amount: 0 }])
  }

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  // Update item
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // Recalculate amount if quantity or rate changes
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  // Generate PDF
  const generatePDF = () => {
    // In a real app, this would generate a PDF using a library like jsPDF or call an API
    alert("PDF generation would happen here. In a real app, this would create a downloadable invoice PDF.")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 bg-card flex items-center shadow-soft z-10">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Invoice Generator</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        <Card className="border border-border rounded-xl shadow-card bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">INVOICE</h2>
                <div className="flex items-center mt-2">
                  <Label htmlFor="invoiceNumber" className="text-sm mr-2">
                    Invoice #:
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="h-8 w-32 bg-muted border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="invoiceDate" className="text-sm w-20">
                    Date:
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="h-8 bg-muted border-border"
                  />
                </div>
                <div className="flex items-center">
                  <Label htmlFor="dueDate" className="text-sm w-20">
                    Due Date:
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-8 bg-muted border-border"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Business Information */}
              <div>
                <h3 className="font-medium mb-2">From</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="businessName" className="text-xs">
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your Business Name"
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessAddress" className="text-xs">
                      Address
                    </Label>
                    <Textarea
                      id="businessAddress"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Your Business Address"
                      className="h-20 bg-muted border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="businessEmail" className="text-xs">
                        Email
                      </Label>
                      <Input
                        id="businessEmail"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="bg-muted border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessPhone" className="text-xs">
                        Phone
                      </Label>
                      <Input
                        id="businessPhone"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="(123) 456-7890"
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div>
                <h3 className="font-medium mb-2">Bill To</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="clientName" className="text-xs">
                      Client Name
                    </Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Client Name"
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress" className="text-xs">
                      Address
                    </Label>
                    <Textarea
                      id="clientAddress"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Client Address"
                      className="h-20 bg-muted border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="clientEmail" className="text-xs">
                        Email
                      </Label>
                      <Input
                        id="clientEmail"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@email.com"
                        className="bg-muted border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone" className="text-xs">
                        Phone
                      </Label>
                      <Input
                        id="clientPhone"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="(123) 456-7890"
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground w-full">Description</th>
                      <th className="text-right py-2 text-sm font-medium text-muted-foreground whitespace-nowrap px-2">
                        Quantity
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-muted-foreground whitespace-nowrap px-2">
                        Rate
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-muted-foreground whitespace-nowrap px-2">
                        Amount
                      </th>
                      <th className="py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="py-2">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Item description"
                            className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                            className="border-0 p-0 h-auto text-right focus-visible:ring-0 bg-transparent"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                            className="border-0 p-0 h-auto text-right focus-visible:ring-0 bg-transparent"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">${item.amount.toFixed(2)}</td>
                        <td className="py-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="h-8 w-8 hover:bg-muted"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (13%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes for the client"
                  className="h-24 bg-muted border-border"
                />
              </div>
              <div>
                <Label htmlFor="terms" className="text-sm font-medium">
                  Terms & Conditions
                </Label>
                <Textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment terms and conditions"
                  className="h-24 bg-muted border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-lg shadow-button hover:bg-muted transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button
            onClick={generatePDF}
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-200 shadow-button"
          >
            <Download className="h-4 w-4 mr-2" /> Generate PDF
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
