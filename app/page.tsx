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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <Languages className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">C-FAR Transliterator</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Advanced transliteration system</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
              <Badge variant="secondary" className="font-mono text-xs">
                v2.0
              </Badge>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Settings</span>
                    <span className="xs:hidden">Config</span>
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
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Advanced Urdu Transliteration System</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Convert between Urdu, Roman Urdu, and English using our hybrid lexicon and rule-based engine with advanced
              customization options
            </p>
          </div>

          {/* Language Direction Selector */}
          <LanguageSelector direction={direction} onDirectionChange={setDirection} />

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Type className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Text Translation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Real-time transliteration with quality metrics and customizable options
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Batch Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upload multiple files simultaneously with progress tracking and auto-download
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Hybrid Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Combines lexicon-based and rule-based methods for maximum accuracy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Quality Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Monitor completeness and configure quality thresholds and warnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger
                value="text"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
              >
                <Type className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Text Translation</span>
                <span className="xs:hidden">Text</span>
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">File Processing</span>
                <span className="xs:hidden">Files</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm"
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Analytics</span>
                <span className="xs:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <TextTranslator direction={direction} onDirectionChange={setDirection} />
            </TabsContent>

            <TabsContent value="files" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <FileProcessor direction={direction} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <StatsDashboard stats={mockStats} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-12 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Advanced Urdu Transliteration System with File Processing Capabilities
              </p>
              <p className="text-xs text-muted-foreground mt-1">Powered by hybrid lexicon and rule-based engine</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
              <span>Method: {options.preferredMethod}</span>
              <Separator orientation="vertical" className="h-3 sm:h-4" />
              <span>Quality: {options.qualityThreshold}%</span>
              <Separator orientation="vertical" className="h-3 sm:h-4" />
              <span>Batch: {options.batchSize} files</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
