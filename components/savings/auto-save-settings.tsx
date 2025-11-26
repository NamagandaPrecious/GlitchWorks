"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency, mockUser } from "@/lib/mock-data"
import { Settings, Info, Zap } from "lucide-react"

export function AutoSaveSettings() {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [savePercentage, setSavePercentage] = useState([75])
  const [saveFrequency, setSaveFrequency] = useState("daily")
  const [minimumSave, setMinimumSave] = useState([500])

  const estimatedDailySavings = 2000 * (savePercentage[0] / 100) // Mock calculation

  const userName = mockUser?.firstName || mockUser?.name?.split(" ")?.[0] || "Student"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {userName}'s Auto-Save Settings
        </CardTitle>
        <CardDescription>Automatically save unspent budget funds to earn interest</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-save">Enable Auto-Save</Label>
            <p className="text-sm text-muted-foreground">Automatically transfer unspent daily budget to savings</p>
          </div>
          <Switch id="auto-save" checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
        </div>

        {autoSaveEnabled && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Save Percentage</Label>
              <div className="space-y-2">
                <Slider
                  value={savePercentage}
                  onValueChange={setSavePercentage}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10%</span>
                  <span className="font-medium">{savePercentage[0]}% of unspent funds</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Save Frequency</Label>
              <Select value={saveFrequency} onValueChange={setSaveFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (at end of day)</SelectItem>
                  <SelectItem value="weekly">Weekly (every Sunday)</SelectItem>
                  <SelectItem value="monthly">Monthly (end of month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Minimum Save Amount</Label>
              <div className="space-y-2">
                <Slider
                  value={minimumSave}
                  onValueChange={setMinimumSave}
                  max={5000}
                  min={100}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>UGX 100</span>
                  <span className="font-medium">{formatCurrency(minimumSave[0])} minimum</span>
                  <span>UGX 5,000</span>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Based on your current spending patterns, you could save approximately{" "}
                <strong>{formatCurrency(estimatedDailySavings)}</strong> per day with these settings.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
              <Button variant="outline">Reset to Default</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
