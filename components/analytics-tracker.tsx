"use client"

import { useEffect } from "react"
import { logAnalyticsEvent } from "@/lib/firebase"

interface AnalyticsTrackerProps {
  children: React.ReactNode
}

export function AnalyticsTracker({ children }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Track page view
    logAnalyticsEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      timestamp: new Date().toISOString()
    })

    // Track app session start
    logAnalyticsEvent('session_start', {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString()
    })
  }, [])

  return <>{children}</>
}

// Helper functions to track specific events
export const trackTranslationEvent = (direction: string, method: string, wordCount: number) => {
  logAnalyticsEvent('translation_performed', {
    direction,
    method,
    word_count: wordCount,
    timestamp: new Date().toISOString()
  })
}

export const trackFileUploadEvent = (fileType: string, fileSize: number) => {
  logAnalyticsEvent('file_uploaded', {
    file_type: fileType,
    file_size: fileSize,
    timestamp: new Date().toISOString()
  })
}

export const trackFeatureUsageEvent = (feature: string) => {
  logAnalyticsEvent('feature_used', {
    feature_name: feature,
    timestamp: new Date().toISOString()
  })
}

export const trackErrorEvent = (error: string, context: string) => {
  logAnalyticsEvent('error_occurred', {
    error_message: error,
    context,
    timestamp: new Date().toISOString()
  })
}
