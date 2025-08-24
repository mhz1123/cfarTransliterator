"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Download, Upload, RotateCcw, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface TranslationOptions {
  // Method preferences
  preferredMethod: "auto" | "lexicon-first" | "rule-based-first" | "lexicon-only" | "rule-based-only"

  // Quality settings
  qualityThreshold: number
  showIncompleteWarnings: boolean

  // Text processing
  preserveFormatting: boolean
  normalizeText: boolean
  handleDiacritics: "remove" | "preserve" | "normalize"
  digitConversion: "auto" | "arabic-to-english" | "preserve"

  // Output formatting
  outputCase: "preserve" | "lowercase" | "uppercase" | "title"
  punctuationHandling: "convert" | "preserve" | "remove"

  // File processing
  batchSize: number
  progressUpdates: boolean
  autoDownload: boolean

  // Advanced
  enablePhoneticRules: boolean
  strictMode: boolean
  debugMode: boolean
}

const DEFAULT_OPTIONS: TranslationOptions = {
  preferredMethod: "auto",
  qualityThreshold: 80,
  showIncompleteWarnings: true,
  preserveFormatting: true,
  normalizeText: true,
  handleDiacritics: "remove",
  digitConversion: "auto",
  outputCase: "preserve",
  punctuationHandling: "convert",
  batchSize: 10,
  progressUpdates: true,
  autoDownload: false,
  enablePhoneticRules: true,
  strictMode: false,
  debugMode: false,
}

interface TranslationSettingsProps {
  options: TranslationOptions
  onOptionsChange: (options: TranslationOptions) => void
  onReset?: () => void
  onExport?: () => void
  onImport?: (options: TranslationOptions) => void
}

export function TranslationSettings({
  options,
  onOptionsChange,
  onReset,
  onExport,
  onImport,
}: TranslationSettingsProps) {
  const [localOptions, setLocalOptions] = useState<TranslationOptions>(options)
  const { toast } = useToast()

  useEffect(() => {
    setLocalOptions(options)
  }, [options])

  const handleOptionChange = <K extends keyof TranslationOptions>(key: K, value: TranslationOptions[K]) => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    onOptionsChange(newOptions)
  }

  const handleReset = () => {
    setLocalOptions(DEFAULT_OPTIONS)
    onOptionsChange(DEFAULT_OPTIONS)
    if (onReset) onReset()
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
    })
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localOptions, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "transliteration-settings.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (onExport) onExport()
    toast({
      title: "Settings Exported",
      description: "Settings have been downloaded as JSON file",
    })
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedOptions = JSON.parse(e.target?.result as string) as TranslationOptions
        setLocalOptions(importedOptions)
        onOptionsChange(importedOptions)
        if (onImport) onImport(importedOptions)
        toast({
          title: "Settings Imported",
          description: "Settings have been successfully imported",
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid settings file format",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Translation Settings
              </CardTitle>
              <CardDescription>Configure transliteration behavior and output preferences</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportSettings}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                  id="import-settings"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="import-settings" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </label>
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Translation Method */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Translation Method</Label>
              <p className="text-sm text-muted-foreground">Choose how the transliteration engine processes text</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Preferred Method</Label>
              <Select
                value={localOptions.preferredMethod}
                onValueChange={(value: TranslationOptions["preferredMethod"]) =>
                  handleOptionChange("preferredMethod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    Auto (Hybrid){" "}
                    <Badge variant="secondary" className="ml-2">
                      Recommended
                    </Badge>
                  </SelectItem>
                  <SelectItem value="lexicon-first">Lexicon First</SelectItem>
                  <SelectItem value="rule-based-first">Rule-based First</SelectItem>
                  <SelectItem value="lexicon-only">Lexicon Only</SelectItem>
                  <SelectItem value="rule-based-only">Rule-based Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Quality Settings */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Quality Control</Label>
              <p className="text-sm text-muted-foreground">Set quality thresholds and warning preferences</p>
            </div>

            <div className="space-y-2">
              <Label>Quality Threshold: {localOptions.qualityThreshold}%</Label>
              <Slider
                value={[localOptions.qualityThreshold]}
                onValueChange={([value]) => handleOptionChange("qualityThreshold", value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Minimum acceptable translation completeness percentage</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Incomplete Warnings</Label>
                <p className="text-xs text-muted-foreground">Display alerts for translations below quality threshold</p>
              </div>
              <Switch
                checked={localOptions.showIncompleteWarnings}
                onCheckedChange={(checked) => handleOptionChange("showIncompleteWarnings", checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Text Processing */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Text Processing</Label>
              <p className="text-sm text-muted-foreground">Configure how input text is processed and normalized</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Preserve Formatting</Label>
                  <p className="text-xs text-muted-foreground">Keep line breaks and spacing</p>
                </div>
                <Switch
                  checked={localOptions.preserveFormatting}
                  onCheckedChange={(checked) => handleOptionChange("preserveFormatting", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Normalize Text</Label>
                  <p className="text-xs text-muted-foreground">Apply character normalization</p>
                </div>
                <Switch
                  checked={localOptions.normalizeText}
                  onCheckedChange={(checked) => handleOptionChange("normalizeText", checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Diacritics Handling</Label>
              <Select
                value={localOptions.handleDiacritics}
                onValueChange={(value: TranslationOptions["handleDiacritics"]) =>
                  handleOptionChange("handleDiacritics", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remove">Remove Diacritics</SelectItem>
                  <SelectItem value="preserve">Preserve Diacritics</SelectItem>
                  <SelectItem value="normalize">Normalize Diacritics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Digit Conversion</Label>
              <Select
                value={localOptions.digitConversion}
                onValueChange={(value: TranslationOptions["digitConversion"]) =>
                  handleOptionChange("digitConversion", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Convert</SelectItem>
                  <SelectItem value="arabic-to-english">Arabic to English</SelectItem>
                  <SelectItem value="preserve">Preserve Original</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Output Formatting */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Output Formatting</Label>
              <p className="text-sm text-muted-foreground">Control how the translated text is formatted</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Output Case</Label>
                <Select
                  value={localOptions.outputCase}
                  onValueChange={(value: TranslationOptions["outputCase"]) => handleOptionChange("outputCase", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preserve">Preserve Original</SelectItem>
                    <SelectItem value="lowercase">Lowercase</SelectItem>
                    <SelectItem value="uppercase">Uppercase</SelectItem>
                    <SelectItem value="title">Title Case</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Punctuation</Label>
                <Select
                  value={localOptions.punctuationHandling}
                  onValueChange={(value: TranslationOptions["punctuationHandling"]) =>
                    handleOptionChange("punctuationHandling", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="convert">Convert to Target Script</SelectItem>
                    <SelectItem value="preserve">Preserve Original</SelectItem>
                    <SelectItem value="remove">Remove Punctuation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* File Processing */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">File Processing</Label>
              <p className="text-sm text-muted-foreground">Configure batch processing and file handling options</p>
            </div>

            <div className="space-y-2">
              <Label>Batch Size: {localOptions.batchSize} files</Label>
              <Slider
                value={[localOptions.batchSize]}
                onValueChange={([value]) => handleOptionChange("batchSize", value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Number of files to process simultaneously</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Progress Updates</Label>
                  <p className="text-xs text-muted-foreground">Show real-time progress</p>
                </div>
                <Switch
                  checked={localOptions.progressUpdates}
                  onCheckedChange={(checked) => handleOptionChange("progressUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Download</Label>
                  <p className="text-xs text-muted-foreground">Download files automatically</p>
                </div>
                <Switch
                  checked={localOptions.autoDownload}
                  onCheckedChange={(checked) => handleOptionChange("autoDownload", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Advanced Settings</Label>
              <p className="text-sm text-muted-foreground">Expert-level configuration options</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Phonetic Rules</Label>
                  <p className="text-xs text-muted-foreground">Apply linguistic phonetic rules</p>
                </div>
                <Switch
                  checked={localOptions.enablePhoneticRules}
                  onCheckedChange={(checked) => handleOptionChange("enablePhoneticRules", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Strict Mode</Label>
                  <p className="text-xs text-muted-foreground">Enforce stricter validation</p>
                </div>
                <Switch
                  checked={localOptions.strictMode}
                  onCheckedChange={(checked) => handleOptionChange("strictMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Mode</Label>
                  <p className="text-xs text-muted-foreground">Show detailed processing info</p>
                </div>
                <Switch
                  checked={localOptions.debugMode}
                  onCheckedChange={(checked) => handleOptionChange("debugMode", checked)}
                />
              </div>
            </div>

            {localOptions.debugMode && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Debug mode is enabled. Additional processing information will be displayed in the console and results.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { DEFAULT_OPTIONS }
