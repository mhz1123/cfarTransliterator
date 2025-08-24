"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type TranslationOptions, DEFAULT_OPTIONS } from "@/components/translation-settings"

interface TranslationOptionsContextType {
  options: TranslationOptions
  updateOptions: (options: TranslationOptions) => void
  resetOptions: () => void
}

const TranslationOptionsContext = createContext<TranslationOptionsContextType | undefined>(undefined)

const STORAGE_KEY = "transliteration-options"

interface TranslationOptionsProviderProps {
  children: ReactNode
}

export function TranslationOptionsProvider({ children }: TranslationOptionsProviderProps) {
  const [options, setOptions] = useState<TranslationOptions>(DEFAULT_OPTIONS)

  // Load options from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedOptions = JSON.parse(stored) as TranslationOptions
        setOptions({ ...DEFAULT_OPTIONS, ...parsedOptions })
      }
    } catch (error) {
      console.error("Failed to load translation options:", error)
    }
  }, [])

  // Save options to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options))
    } catch (error) {
      console.error("Failed to save translation options:", error)
    }
  }, [options])

  const updateOptions = (newOptions: TranslationOptions) => {
    setOptions(newOptions)
  }

  const resetOptions = () => {
    setOptions(DEFAULT_OPTIONS)
  }

  return (
    <TranslationOptionsContext.Provider value={{ options, updateOptions, resetOptions }}>
      {children}
    </TranslationOptionsContext.Provider>
  )
}

export function useTranslationOptions() {
  const context = useContext(TranslationOptionsContext)
  if (context === undefined) {
    throw new Error("useTranslationOptions must be used within a TranslationOptionsProvider")
  }
  return context
}
