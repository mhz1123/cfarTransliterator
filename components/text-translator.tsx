"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, RotateCcw, ArrowRightLeft, Loader2 } from "lucide-react"
import type { TransliterationResult } from "@/lib/transliteration"
import { useToast } from "@/hooks/use-toast"
import { useTranslationOptions } from "@/lib/translation-options-context"
import { enhancedTransliterationEngine } from "@/components/enhanced-transliteration-engine"
import { QualityIndicator } from "@/components/quality-indicator"

interface TextTranslatorProps {
  direction: "urdu-to-roman" | "roman-to-urdu"
  onDirectionChange?: (direction: "urdu-to-roman" | "roman-to-urdu") => void
}

export function TextTranslator({ direction, onDirectionChange }: TextTranslatorProps) {
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<TransliterationResult | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const { toast } = useToast()
  const { options } = useTranslationOptions()

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    try {
      const translationResult = await enhancedTransliterationEngine.transliterateWithOptions(
        inputText,
        direction,
        options,
      )

      setResult(translationResult)
    } catch (error) {
      toast({
        title: "Translation Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }, [inputText, direction, options, toast])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleClear = () => {
    setInputText("")
    setResult(null)
  }

  const handleSwapDirection = () => {
    if (onDirectionChange) {
      const newDirection = direction === "urdu-to-roman" ? "roman-to-urdu" : "urdu-to-roman"
      onDirectionChange(newDirection)

      // Swap input and output if there's a result
      if (result) {
        setInputText(result.transliteratedText)
        setResult(null)
      }
    }
  }

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "lexicon":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rule-based":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "hybrid":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const inputPlaceholder = direction === "urdu-to-roman" ? "یہاں اردو متن لکھیں..." : "Type Roman Urdu text here..."

  const outputLabel = direction === "urdu-to-roman" ? "Roman Urdu Output" : "Urdu Script Output"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Text Translator
                <Badge variant="outline" className="font-mono text-xs">
                  {direction === "urdu-to-roman" ? "UR → EN" : "EN → UR"}
                </Badge>
              </CardTitle>
              <CardDescription>Real-time transliteration between Urdu and Roman scripts</CardDescription>
            </div>
            {onDirectionChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapDirection}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Swap
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {direction === "urdu-to-roman" ? "Urdu Text Input" : "Roman Urdu Input"}
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={inputPlaceholder}
              className="min-h-32 resize-none"
              dir={direction === "urdu-to-roman" ? "rtl" : "ltr"}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {inputText.length} characters, {inputText.split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClear} disabled={!inputText && !result}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={handleTranslate} disabled={!inputText.trim() || isTranslating} size="sm">
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                  )}
                  Translate
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {result && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{outputLabel}</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(result.transliteratedText)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <Textarea
                value={result.transliteratedText}
                readOnly
                className="min-h-32 resize-none bg-muted/50"
                dir={direction === "urdu-to-roman" ? "ltr" : "rtl"}
              />

              <QualityIndicator result={result} showDetails={true} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
