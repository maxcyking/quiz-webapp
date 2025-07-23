"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { Bell, Lock, Moon, Sun, User } from "lucide-react";
import { ChangePasswordDialog } from "@/components/settings/change-password";
import { ResetPasswordDialog } from "@/components/settings/reset-password";
import { TwoFactorAuthDialog } from "@/components/settings/two-factor-auth";
import { ConnectedDevicesDialog } from "@/components/settings/connected-devices";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useExam();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Wait for theme to be available
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user || !mounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Account Settings</CardTitle>
            </div>
            <CardDescription>Manage your account preferences and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about your exams</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="exam-reminders">Exam Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified before your scheduled exams</p>
              </div>
              <Switch id="exam-reminders" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="result-notifications">Result Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when exam results are available</p>
              </div>
              <Switch id="result-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
              </div>
              <Switch id="browser-notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-notifications">Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">Play a sound for important notifications</p>
              </div>
              <Switch id="sound-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize how PrepForAll looks on your device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setTheme("system")}
                >
                  <span className="mr-2">💻</span>
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChangePasswordDialog />
            <ResetPasswordDialog />
            <TwoFactorAuthDialog />
            <ConnectedDevicesDialog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}