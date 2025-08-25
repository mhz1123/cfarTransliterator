"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import type { TransliterationResult } from "@/lib/transliteration"
import { useTranslationOptions } from "@/lib/translation-options-context"
import { enhancedTransliterationEngine } from "@/components/enhanced-transliteration-engine"
import { validateFile, createDownloadBlob, parseFile } from "@/lib/file-utils"

interface ProcessedFile {
  id: string
  name: string
  originalContent: string
  processedContent: string
  transliterationResult: TransliterationResult
  size: number
  status: "processing" | "completed" | "error"
  error?: string
  fileType: string
}

export function FileProcessor({ direction }: FileProcessorProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { options } = useTranslationOptions()

  const processText = async (text: string): Promise<TransliterationResult> => {
    return await enhancedTransliterationEngine.transliterateWithOptions(text, direction, options)
  }

  const readFileContent = async (file: File): Promise<string> => {
    try {
      return await parseFile(file)
    } catch (error) {
      throw new Error(`Failed to read ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const processFiles = useCallback(
    async (selectedFiles: FileList) => {
      setIsProcessing(true)
      setProgress(0)

      const fileArray = Array.from(selectedFiles)
      const newFiles: ProcessedFile[] = []

      for (let i = 0; i < fileArray.length; i += options.batchSize) {
        const batch = fileArray.slice(i, i + options.batchSize)

        for (const file of batch) {
          const fileId = `${Date.now()}-${Math.random()}`

          try {
            const validation = validateFile(file)
            if (!validation.isValid) {
              throw new Error(validation.error)
            }

            // Update progress if enabled
            if (options.progressUpdates) {
              setProgress((i / fileArray.length) * 100)
            }

            // Read file content using new parser
            const content = await readFileContent(file)

            // Process content through enhanced transliteration engine
            const result = await processText(content)

            const processedFile: ProcessedFile = {
              id: fileId,
              name: file.name,
              originalContent: content,
              processedContent: result.transliteratedText,
              transliterationResult: result,
              size: file.size,
              status: "completed",
              fileType: "." + file.name.split(".").pop()?.toLowerCase() || ".txt",
            }

            newFiles.push(processedFile)

            // Auto-download if enabled
            if (options.autoDownload) {
              setTimeout(() => downloadFile(processedFile), 100)
            }
          } catch (error) {
            const errorFile: ProcessedFile = {
              id: fileId,
              name: file.name,
              originalContent: "",
              processedContent: "",
              transliterationResult: {
                originalText: "",
                transliteratedText: "",
                method: "rule-based",
                completeness: {
                  isComplete: false,
                  untransliteratedParts: [],
                  totalWords: 0,
                  untransliteratedCount: 0,
                },
              },
              size: file.size,
              status: "error",
              error: error instanceof Error ? error.message : "Unknown error",
              fileType: "." + file.name.split(".").pop()?.toLowerCase() || ".txt",
            }

            newFiles.push(errorFile)
          }
        }
      }

      setProgress(100)
      setFiles((prev) => [...prev, ...newFiles])
      setIsProcessing(false)

      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000)
    },
    [direction, options],
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
  }

  const downloadFile = (file: ProcessedFile) => {
    const fileType = file.fileType === ".pdf" ? "pdf" : file.fileType === ".docx" ? "docx" : "txt"
    createDownloadBlob(file.processedContent, file.name, fileType)
  }

  const downloadAllFiles = () => {
    const completedFiles = files.filter((f) => f.status === "completed")
    if (completedFiles.length === 0) return

    completedFiles.forEach((file) => {
      setTimeout(() => downloadFile(file), 100)
    })
  }

  const clearFiles = () => {
    setFiles([])
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files for Processing
          </CardTitle>
          <CardDescription>
            Upload text files (.txt, .md, .csv) to transliterate from{" "}
            {direction === "urdu-to-roman" ? "Urdu to Roman" : "Roman to Urdu"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">TXT, MD, CSV, PDF, DOCX files (MAX. 10MB each)</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".txt,.md,.csv,.text,.pdf,.docx"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing files...</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Processed Files ({files.length})
                </CardTitle>
                <CardDescription>
                  {files.filter((f) => f.status === "completed").length} completed,{" "}
                  {files.filter((f) => f.status === "error").length} failed
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAllFiles}
                  disabled={files.filter((f) => f.status === "completed").length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
                <Button variant="outline" size="sm" onClick={clearFiles}>
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm text-muted-foreground">({formatFileSize(file.size)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === "completed" && (
                        <>
                          <Badge className={getMethodBadgeColor(file.transliterationResult.method)}>
                            {file.transliterationResult.method}
                          </Badge>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <Button size="sm" variant="outline" onClick={() => downloadFile(file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                      {file.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                      {file.status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </div>

                  {file.status === "completed" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Words: {file.transliterationResult.completeness.totalWords}</span>
                        <span>
                          Completeness:{" "}
                          {file.transliterationResult.completeness.isComplete ? (
                            <span className="text-green-600">100%</span>
                          ) : (
                            <span className="text-orange-600">
                              {Math.round(
                                ((file.transliterationResult.completeness.totalWords -
                                  file.transliterationResult.completeness.untransliteratedCount) /
                                  file.transliterationResult.completeness.totalWords) *
                                  100,
                              )}
                              %
                            </span>
                          )}
                        </span>
                      </div>
                      {!file.transliterationResult.completeness.isComplete && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {file.transliterationResult.completeness.untransliteratedCount} words could not be
                            transliterated completely
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {file.status === "error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{file.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface FileProcessorProps {
  direction: "urdu-to-roman" | "roman-to-urdu"
}
