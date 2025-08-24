"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, FileText, Languages } from "lucide-react"

export function TranslationLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FileProcessingLoader({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <FileText className="h-6 w-6 absolute top-3 left-3 text-primary-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Processing Files</h3>
        <p className="text-sm text-muted-foreground">Transliterating your files... {Math.round(progress)}% complete</p>
      </div>
    </div>
  )
}

export function TranslationInProgress() {
  return (
    <div className="flex items-center justify-center py-8 space-x-3">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <Languages className="h-5 w-5 text-primary animate-pulse" />
      <span className="text-sm font-medium">Transliterating...</span>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: any
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="p-4 bg-muted/50 rounded-full">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
