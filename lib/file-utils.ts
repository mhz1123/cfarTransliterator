export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export const SUPPORTED_FILE_TYPES = [".txt", ".md", ".csv", ".text"]
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    }
  }

  // Check file type
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
  if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Unsupported file type. Supported types: ${SUPPORTED_FILE_TYPES.join(", ")}`,
    }
  }

  return { isValid: true }
}

export function createDownloadBlob(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export async function processFilesBatch(
  files: FileList,
  processor: (content: string) => Promise<any>,
  onProgress?: (progress: number) => void,
): Promise<any[]> {
  const results = []
  const fileArray = Array.from(files)

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]

    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      results.push({
        file: file.name,
        error: validation.error,
        success: false,
      })
      continue
    }

    try {
      // Read file content
      const content = await readFileAsText(file)

      // Process content
      const result = await processor(content)

      results.push({
        file: file.name,
        result,
        success: true,
      })
    } catch (error) {
      results.push({
        file: file.name,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      })
    }

    // Update progress
    if (onProgress) {
      onProgress(((i + 1) / fileArray.length) * 100)
    }
  }

  return results
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file, "utf-8")
  })
}
