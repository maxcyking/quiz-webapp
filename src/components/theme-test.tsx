"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ThemeTest() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-glass shadow-canva">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-canva-purple-600 to-canva-blue-600 bg-clip-text text-transparent">
            Canva-Inspired Theme Showcase
          </CardTitle>
          <CardDescription>
            Experience our beautiful gradient theme inspired by Canva's design
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-4">Current theme: <Badge variant="secondary">{theme}</Badge></p>
            <div className="flex gap-3">
              <Button 
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="bg-gradient-to-r from-canva-purple-500 to-canva-blue-500 hover:from-canva-purple-600 hover:to-canva-blue-600"
              >
                Light Theme
              </Button>
              <Button 
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="bg-gradient-to-r from-canva-purple-700 to-canva-blue-700 hover:from-canva-purple-800 hover:to-canva-blue-800"
              >
                Dark Theme
              </Button>
              <Button 
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-canva-purple-100 to-canva-blue-100 dark:from-canva-purple-900 dark:to-canva-blue-900">
              <CardHeader>
                <CardTitle className="text-canva-purple-700 dark:text-canva-purple-300">Primary Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary"></div>
                  <div className="w-8 h-8 rounded-full bg-canva-purple-500"></div>
                  <div className="w-8 h-8 rounded-full bg-canva-blue-500"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-canva-pink-100 to-canva-orange-100 dark:from-canva-pink-900 dark:to-canva-orange-900">
              <CardHeader>
                <CardTitle className="text-canva-pink-700 dark:text-canva-pink-300">Accent Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-canva-pink-500"></div>
                  <div className="w-8 h-8 rounded-full bg-canva-orange-500"></div>
                  <div className="w-8 h-8 rounded-full bg-canva-green-500"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-glass">
              <CardHeader>
                <CardTitle>Glass Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Beautiful glassmorphism effect with backdrop blur
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Interactive Elements</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small Button</Button>
              <Button>Default Button</Button>
              <Button size="lg">Large Button</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}