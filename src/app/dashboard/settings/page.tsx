"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { createClient } from '../../../lib/supabase/client'
import { toast } from "sonner"
import type { Database } from "../../../types/supabase"

const supabase = createClient()

type FormData = {
  fullName: string
  email: string
  emailNotifications: boolean
  darkMode: boolean
  timezone: string
}


export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    emailNotifications: false,
    darkMode: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  // Load profile data
  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: user.email || '',
          emailNotifications: profile.email_notifications || false,
          darkMode: profile.dark_mode || false,
          timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        }))

        // Apply dark mode on load
        if (profile.dark_mode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    }
  }

  // Load profile on mount and when stream changes
  useEffect(() => {
    {
      loadProfile()
    }
  }, [])

  const handleProfileUpdate = async () => {
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          email_notifications: formData.emailNotifications,
          dark_mode: formData.darkMode,
          timezone: formData.timezone
        })

      if (profileError) throw profileError


      toast.success('Settings updated successfully')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating settings:', error)
      toast.error(error.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium dark:text-gray-100">Settings</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Update your profile settings.
          </p>

          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="dark:bg-gray-800 dark:border-gray-700">
              <TabsTrigger value="profile" className="dark:text-gray-100">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Profile Settings</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="dark:text-gray-100">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="dark:text-gray-100">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone" className="dark:text-gray-100">Timezone</Label>
                      <select
                        id="timezone"
                        value={formData.timezone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-100"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">(UTC-5) Eastern Time</option>
                        <option value="America/Chicago">(UTC-6) Central Time</option>
                        <option value="America/Denver">(UTC-7) Mountain Time</option>
                        <option value="America/Los_Angeles">(UTC-8) Pacific Time</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, emailNotifications: checked }))}
                      />
                      <Label htmlFor="emailNotifications" className="dark:text-gray-100">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="darkMode"
                        checked={formData.darkMode}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({ ...prev, darkMode: checked }))
                          if (checked) {
                            document.documentElement.classList.add('dark')
                          } else {
                            document.documentElement.classList.remove('dark')
                          }
                        }}
                      />
                      <Label htmlFor="darkMode" className="dark:text-gray-100">Dark Mode</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleProfileUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
