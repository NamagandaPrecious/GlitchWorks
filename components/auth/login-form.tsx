"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, GraduationCap } from "lucide-react"
import Image from "next/image"

interface LoginFormProps {
  onLogin: (user: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    phone: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const formData = new FormData(e.target as HTMLFormElement)
      const email = formData.get("email") as string

      // For demo purposes, extract name from email or use default
      const emailName = email.split("@")[0].split(".")
      const firstName = emailName[0] ? emailName[0].charAt(0).toUpperCase() + emailName[0].slice(1) : "Student"
      const lastName = emailName[1] ? emailName[1].charAt(0).toUpperCase() + emailName[1].slice(1) : "User"

      onLogin({
        id: "1",
        name: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        university: "Uganda Christian University",
        phone: "+256 700 000 000",
      })
      setIsLoading(false)
    }, 1500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onLogin({
        id: "1",
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        university: registrationData.university,
        phone: registrationData.phone,
      })
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl animate-pulse"></div>
            <Image
              src="/seba-logo.jpg"
              alt="SEBA Logo"
              width={72}
              height={72}
              className="rounded-3xl shadow-2xl relative z-10"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Welcome to SEBA
              </h1>
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <p className="text-balance">Smart budgeting for university students</p>
            </div>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription className="text-base">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@student.university.ac.ug"
                      required
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        required
                        value={registrationData.firstName}
                        onChange={(e) => setRegistrationData((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        required
                        value={registrationData.lastName}
                        onChange={(e) => setRegistrationData((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-sm font-medium">
                      University
                    </Label>
                    <Select
                      required
                      value={registrationData.university}
                      onValueChange={(value) => setRegistrationData((prev) => ({ ...prev, university: value }))}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Uganda Christian University">Uganda Christian University</SelectItem>
                        <SelectItem value="Makerere University">Makerere University</SelectItem>
                        <SelectItem value="Kyambogo University">Kyambogo University</SelectItem>
                        <SelectItem value="Makerere University Business School">
                          Makerere University Business School
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regEmail" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="your.email@student.university.ac.ug"
                      required
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData((prev) => ({ ...prev, email: e.target.value }))}
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+256 700 000 000"
                      required
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regPassword" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="Create a strong password"
                      required
                      value={registrationData.password}
                      onChange={(e) => setRegistrationData((prev) => ({ ...prev, password: e.target.value }))}
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
