"use client"

import { useState } from "react"
import { FileProcessor } from "@/components/file-processor"
import { TextTranslator } from "@/components/text-translator"
import { LanguageSelector } from "@/components/language-selector"
import { TranslationSettings } from "@/components/translation-settings"
import { StatsDashboard } from "@/components/stats-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Languages, FileText, Zap, Shield, Settings, BarChart3, Type } from "lucide-react"
import { useTranslationOptions } from "@/lib/translation-options-context"

export default function HomePage() {
  const [direction, setDirection] = useState<"urdu-to-roman" | "roman-to-urdu">("urdu-to-roman")
  const [activeTab, setActiveTab] = useState("text")
  const { options, updateOptions, resetOptions } = useTranslationOptions()

  // Mock stats data - in a real app, this would come from a backend or local storage
  const mockStats = {
    totalTranslations: 1247,
    totalWords: 45623,
    totalFiles: 89,
    averageAccuracy: 94,
    methodBreakdown: {
      lexicon: 567,
      ruleBased: 234,
      hybrid: 446,
    },
    recentActivity: {
      today: 23,
      thisWeek: 156,
      thisMonth: 489,
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Urdu Transliteration</h1>
                <p className="text-sm text-muted-foreground">Advanced transliteration system</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono">
                v2.0
              </Badge>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Translation Settings</SheetTitle>
                    <SheetDescription>Configure transliteration behavior and preferences</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <TranslationSettings options={options} onOptionsChange={updateOptions} onReset={resetOptions} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Advanced Urdu Transliteration System</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert between Urdu, Roman Urdu, and English using our hybrid lexicon and rule-based engine with advanced
              customization options
            </p>
          </div>

          {/* Language Direction Selector */}
          <LanguageSelector direction={direction} onDirectionChange={setDirection} />

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Text Translation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time transliteration with quality metrics and customizable options
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Batch Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload multiple files simultaneously with progress tracking and auto-download
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Hybrid Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Combines lexicon-based and rule-based methods for maximum accuracy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Quality Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor completeness and configure quality thresholds and warnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Translation
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File Processing
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-6">
              <TextTranslator direction={direction} onDirectionChange={setDirection} />
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <FileProcessor direction={direction} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <StatsDashboard stats={mockStats} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                Advanced Urdu Transliteration System with File Processing Capabilities
              </p>
              <p className="text-xs text-muted-foreground mt-1">Powered by hybrid lexicon and rule-based engine</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Method: {options.preferredMethod}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Quality: {options.qualityThreshold}%</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Batch: {options.batchSize} files</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
