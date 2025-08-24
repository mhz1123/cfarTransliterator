"use client"

import { transliterationEngine, type TransliterationResult } from "@/lib/transliteration"
import type { TranslationOptions } from "@/components/translation-settings"

export class EnhancedTransliterationEngine {
  private static instance: EnhancedTransliterationEngine

  static getInstance(): EnhancedTransliterationEngine {
    if (!EnhancedTransliterationEngine.instance) {
      EnhancedTransliterationEngine.instance = new EnhancedTransliterationEngine()
    }
    return EnhancedTransliterationEngine.instance
  }

  private applyTextProcessing(text: string, options: TranslationOptions): string {
    let processedText = text

    // Handle formatting preservation
    if (!options.preserveFormatting) {
      processedText = processedText.replace(/\s+/g, " ").trim()
    }

    // Apply normalization if enabled
    if (options.normalizeText) {
      // Additional normalization can be added here
      processedText = processedText.normalize("NFC")
    }

    return processedText
  }

  private applyOutputFormatting(text: string, options: TranslationOptions): string {
    let formattedText = text

    // Apply case transformation
    switch (options.outputCase) {
      case "lowercase":
        formattedText = formattedText.toLowerCase()
        break
      case "uppercase":
        formattedText = formattedText.toUpperCase()
        break
      case "title":
        formattedText = formattedText.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
        )
        break
      // "preserve" is default - no change needed
    }

    // Handle punctuation
    if (options.punctuationHandling === "remove") {
      formattedText = formattedText.replace(/[۔؟،؍٪.,!?;:]/g, "")
    }

    return formattedText
  }

  private checkQualityThreshold(result: TransliterationResult, options: TranslationOptions): TransliterationResult {
    const completenessPercentage =
      result.completeness.totalWords > 0
        ? Math.round(
            ((result.completeness.totalWords - result.completeness.untransliteratedCount) /
              result.completeness.totalWords) *
              100,
          )
        : 100

    // Add quality warning if below threshold
    if (completenessPercentage < options.qualityThreshold && options.showIncompleteWarnings) {
      console.warn(`Translation quality (${completenessPercentage}%) below threshold (${options.qualityThreshold}%)`)
    }

    return result
  }

  async transliterateWithOptions(
    text: string,
    direction: "urdu-to-roman" | "roman-to-urdu",
    options: TranslationOptions,
  ): Promise<TransliterationResult> {
    // Pre-process text according to options
    const processedText = this.applyTextProcessing(text, options)

    // Debug logging if enabled
    if (options.debugMode) {
      console.log("[Debug] Original text:", text)
      console.log("[Debug] Processed text:", processedText)
      console.log("[Debug] Options:", options)
    }

    // Perform transliteration using the core engine
    let result: TransliterationResult

    if (direction === "urdu-to-roman") {
      result = await transliterationEngine.transliterateUrduToRoman(processedText)
    } else {
      result = await transliterationEngine.transliterateRomanToUrdu(processedText)
    }

    // Apply output formatting
    const formattedOutput = this.applyOutputFormatting(result.transliteratedText, options)

    // Create enhanced result
    const enhancedResult: TransliterationResult = {
      ...result,
      transliteratedText: formattedOutput,
    }

    // Check quality threshold
    const finalResult = this.checkQualityThreshold(enhancedResult, options)

    // Debug logging if enabled
    if (options.debugMode) {
      console.log("[Debug] Translation result:", finalResult)
      console.log("[Debug] Method used:", finalResult.method)
      console.log("[Debug] Completeness:", finalResult.completeness)
    }

    return finalResult
  }

  async batchTransliterateWithOptions(
    texts: string[],
    direction: "urdu-to-roman" | "roman-to-urdu",
    options: TranslationOptions,
    onProgress?: (progress: number) => void,
  ): Promise<TransliterationResult[]> {
    const results: TransliterationResult[] = []
    const batchSize = options.batchSize

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)

      // Process batch
      const batchPromises = batch.map((text) => this.transliterateWithOptions(text, direction, options))

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Update progress if callback provided
      if (onProgress && options.progressUpdates) {
        const progress = Math.min(((i + batchSize) / texts.length) * 100, 100)
        onProgress(progress)
      }
    }

    return results
  }
}

export const enhancedTransliterationEngine = EnhancedTransliterationEngine.getInstance()
