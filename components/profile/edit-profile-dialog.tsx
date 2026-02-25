"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Phone, GraduationCap, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EditProfileDialogProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedUser: any) => void
}

export function EditProfileDialog({ user, open, onOpenChange, onSave }: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    university: user?.university || "",
    phone: user?.phone || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim()

  const handleSave = async () => {
    if (!isFormValid) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedUser = {
        ...user,
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
      }
      onSave(updatedUser)
      setIsLoading(false)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 1500)

      console.log("[v0] Profile updated successfully:", updatedUser)
    }, 1000)
  }

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}` || "U"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="text-center pb-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update your personal information and preferences
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {showSuccess && (
          <div className="flex items-center justify-center space-x-2 bg-success/10 text-success p-3 rounded-lg border border-success/20">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center space-x-2">
                <User className="h-4 w-4 text-primary" />
                <span>First Name *</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                className="bg-background/50 border-border/50 focus:border-primary/50"
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center space-x-2">
                <User className="h-4 w-4 text-primary" />
                <span>Last Name *</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                className="bg-background/50 border-border/50 focus:border-primary/50"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email Address *</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="bg-background/50 border-border/50 focus:border-primary/50"
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="university" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>University</span>
            </Label>
            <Select
              value={formData.university}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, university: value }))}
            >
              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
                <SelectValue placeholder="Select your university" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50">
                <SelectItem value="Uganda Christian University">Uganda Christian University</SelectItem>
                <SelectItem value="Makerere University">Makerere University</SelectItem>
                <SelectItem value="Kyambogo University">Kyambogo University</SelectItem>
                <SelectItem value="Makerere University Business School">Makerere University Business School</SelectItem>
                <SelectItem value="Uganda Martyrs University">Uganda Martyrs University</SelectItem>
                <SelectItem value="Kampala International University">Kampala International University</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Phone Number</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="bg-background/50 border-border/50 focus:border-primary/50"
              placeholder="+256 XXX XXX XXX"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
            <span className="text-sm font-medium">Profile Completion</span>
            <Badge
              variant={isFormValid ? "default" : "secondary"}
              className="bg-primary/10 text-primary border-primary/20"
            >
              {isFormValid ? "Complete" : "Incomplete"}
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border/50 hover:bg-accent/50">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !isFormValid}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
