"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, FileText, Zap, Target, TrendingUp, Clock } from "lucide-react"

interface TranslationStats {
  totalTranslations: number
  totalWords: number
  totalFiles: number
  averageAccuracy: number
  methodBreakdown: {
    lexicon: number
    ruleBased: number
    hybrid: number
  }
  recentActivity: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

interface StatsDashboardProps {
  stats: TranslationStats
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "lexicon":
        return "bg-green-500"
      case "ruleBased":
        return "bg-blue-500"
      case "hybrid":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const totalMethodUsage =
    stats.methodBreakdown.lexicon + stats.methodBreakdown.ruleBased + stats.methodBreakdown.hybrid

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalTranslations)}</div>
            <p className="text-xs text-muted-foreground">+{stats.recentActivity.today} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalWords)}</div>
            <p className="text-xs text-muted-foreground">Across all translations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalFiles)}</div>
            <p className="text-xs text-muted-foreground">Batch processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Translation completeness</p>
          </CardContent>
        </Card>
      </div>

      {/* Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Translation Methods
          </CardTitle>
          <CardDescription>Breakdown of transliteration methods used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Lexicon-based</span>
                <Badge variant="secondary" className="text-xs">
                  Most Accurate
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalMethodUsage > 0 ? Math.round((stats.methodBreakdown.lexicon / totalMethodUsage) * 100) : 0}%
                </span>
                <span className="text-sm font-medium">{formatNumber(stats.methodBreakdown.lexicon)}</span>
              </div>
            </div>
            <Progress
              value={totalMethodUsage > 0 ? (stats.methodBreakdown.lexicon / totalMethodUsage) * 100 : 0}
              className="h-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium">Hybrid</span>
                <Badge variant="secondary" className="text-xs">
                  Balanced
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalMethodUsage > 0 ? Math.round((stats.methodBreakdown.hybrid / totalMethodUsage) * 100) : 0}%
                </span>
                <span className="text-sm font-medium">{formatNumber(stats.methodBreakdown.hybrid)}</span>
              </div>
            </div>
            <Progress
              value={totalMethodUsage > 0 ? (stats.methodBreakdown.hybrid / totalMethodUsage) * 100 : 0}
              className="h-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Rule-based</span>
                <Badge variant="secondary" className="text-xs">
                  Fallback
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalMethodUsage > 0 ? Math.round((stats.methodBreakdown.ruleBased / totalMethodUsage) * 100) : 0}%
                </span>
                <span className="text-sm font-medium">{formatNumber(stats.methodBreakdown.ruleBased)}</span>
              </div>
            </div>
            <Progress
              value={totalMethodUsage > 0 ? (stats.methodBreakdown.ruleBased / totalMethodUsage) * 100 : 0}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Translation activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.recentActivity.today}</div>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.recentActivity.thisWeek}</div>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.recentActivity.thisMonth}</div>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
