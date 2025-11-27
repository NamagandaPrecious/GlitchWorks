"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plus, Info, CheckCircle, Clock } from "lucide-react"

// Mock pending requests
const pendingRequests = [
  {
    id: "1",
    vendorName: "Campus Coffee Shop",
    category: "Food & Dining",
    location: "Student Center",
    requestDate: "2024-09-15",
    status: "pending",
    reason: "Popular student hangout spot",
  },
  {
    id: "2",
    vendorName: "Quick Print Services",
    category: "Learning Materials",
    location: "Library Building",
    requestDate: "2024-09-10",
    status: "approved",
    reason: "Needed for printing assignments",
  },
]

export function VendorRequest() {
  const [vendorName, setVendorName] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [reason, setReason] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
      setIsSubmitting(false)

      // Reset form
      setVendorName("")
      setCategory("")
      setLocation("")
      setReason("")
      setContactInfo("")

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success text-success-foreground"
      case "pending":
        return "bg-warning text-warning-foreground"
      case "rejected":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Request New Vendor</h2>
        <p className="text-muted-foreground">Suggest vendors you'd like to see added to the authorized list</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Submit Request
            </CardTitle>
            <CardDescription>Help us expand our network of trusted vendors</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
                <p className="text-muted-foreground">
                  We'll review your vendor request and get back to you within 3-5 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g., Campus Bookstore"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                      <SelectItem value="Learning Materials">Learning Materials</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Clothing & Accessories">Clothing & Accessories</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Main Campus, Student Center"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Vendor Contact (Optional)</Label>
                  <Input
                    id="contactInfo"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Phone number or email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Why should we add this vendor? *</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this vendor would be valuable for students..."
                    rows={3}
                    required
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    All vendor requests are reviewed for security and student benefit. We prioritize vendors that serve
                    essential student needs.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>Track the status of your vendor requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{request.vendorName}</h4>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {request.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {request.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Category:</strong> {request.category}
                    </p>
                    <p>
                      <strong>Location:</strong> {request.location}
                    </p>
                    <p>
                      <strong>Requested:</strong> {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Reason:</strong> {request.reason}
                    </p>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No vendor requests yet. Submit your first request above!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
