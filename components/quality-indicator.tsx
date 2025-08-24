"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react"
import type { TransliterationResult } from "@/lib/transliteration"

interface QualityIndicatorProps {
  result: TransliterationResult
  showDetails?: boolean
  size?: "sm" | "md" | "lg"
}

export function QualityIndicator({ result, showDetails = false, size = "md" }: QualityIndicatorProps) {
  const completenessPercentage =
    result.completeness.totalWords > 0
      ? Math.round(
          ((result.completeness.totalWords - result.completeness.untransliteratedCount) /
            result.completeness.totalWords) *
            100,
        )
      : 100

  const getQualityLevel = (percentage: number) => {
    if (percentage >= 95) return { level: "excellent", color: "text-green-600", icon: CheckCircle2 }
    if (percentage >= 80) return { level: "good", color: "text-blue-600", icon: Info }
    if (percentage >= 60) return { level: "fair", color: "text-orange-600", icon: AlertTriangle }
    return { level: "poor", color: "text-red-600", icon: XCircle }
  }

  const quality = getQualityLevel(completenessPercentage)
  const Icon = quality.icon

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

  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Icon className={`${iconSize} ${quality.color}`} />
                <span className={`font-medium ${quality.color} ${textSize}`}>{completenessPercentage}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Translation completeness: {quality.level}</p>
            </TooltipContent>
          </Tooltip>

          <Badge className={getMethodBadgeColor(result.method)} variant="secondary">
            {result.method}
          </Badge>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <Progress value={completenessPercentage} className="h-2" />

            <div className={`grid grid-cols-2 gap-4 ${textSize} text-muted-foreground`}>
              <div>
                <span className="font-medium">Total Words:</span> {result.completeness.totalWords}
              </div>
              <div>
                <span className="font-medium">Untransliterated:</span> {result.completeness.untransliteratedCount}
              </div>
            </div>

            {result.completeness.untransliteratedParts.length > 0 && (
              <div className={`${textSize}`}>
                <span className="font-medium text-muted-foreground">Issues with:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.completeness.untransliteratedParts.slice(0, 5).map((part, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {part}
                    </Badge>
                  ))}
                  {result.completeness.untransliteratedParts.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{result.completeness.untransliteratedParts.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
