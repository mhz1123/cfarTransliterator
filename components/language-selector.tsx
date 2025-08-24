"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Languages, ArrowRight } from "lucide-react"

interface LanguageSelectorProps {
  direction: "urdu-to-roman" | "roman-to-urdu"
  onDirectionChange: (direction: "urdu-to-roman" | "roman-to-urdu") => void
  className?: string
}

export function LanguageSelector({ direction, onDirectionChange, className }: LanguageSelectorProps) {
  const languages = {
    "urdu-to-roman": {
      from: { name: "Urdu", code: "UR", script: "اردو" },
      to: { name: "Roman", code: "EN", script: "Roman" },
    },
    "roman-to-urdu": {
      from: { name: "Roman", code: "EN", script: "Roman" },
      to: { name: "Urdu", code: "UR", script: "اردو" },
    },
  }

  const current = languages[direction]

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <span className="font-medium">Translation Direction</span>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Language selection container */}
            <div className="flex items-center justify-center gap-3">
              {/* From Language */}
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono">
                    {current.from.code}
                  </Badge>
                  <span className="font-medium text-sm md:text-base">{current.from.name}</span>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">{current.from.script}</div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              {/* To Language */}
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono">
                    {current.to.code}
                  </Badge>
                  <span className="font-medium text-sm md:text-base">{current.to.name}</span>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">{current.to.script}</div>
              </div>
            </div>

            <div className="flex justify-center md:justify-start md:ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDirectionChange(direction === "urdu-to-roman" ? "roman-to-urdu" : "urdu-to-roman")}
              >
                Swap
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
