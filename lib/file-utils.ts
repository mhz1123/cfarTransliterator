export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export const SUPPORTED_FILE_TYPES = [".txt", ".md", ".csv", ".text", ".pdf", ".docx"]
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

export function createDownloadBlob(content: string, filename: string, fileType: "txt" | "pdf" | "docx" = "txt"): void {
  let blob: Blob
  let downloadName: string

  switch (fileType) {
    case "txt":
      blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      downloadName = filename.replace(/\.[^/.]+$/, "") + "_processed.txt"
      break
    case "pdf":
      // For now, we'll download as text since creating PDF requires additional libraries
      blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      downloadName = filename.replace(/\.[^/.]+$/, "") + "_processed.txt"
      break
    case "docx":
      // For now, we'll download as text since creating DOCX requires additional libraries
      blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      downloadName = filename.replace(/\.[^/.]+$/, "") + "_processed.txt"
      break
    default:
      blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      downloadName = filename
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = downloadName
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
      const content = await parseFile(file)

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

export async function parsePDFFile(file: File): Promise<string> {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      throw new Error("PDF parsing is not supported in server-side environment")
    }

    // Using CDN version of PDF.js to avoid Node.js module compatibility issues
    // @ts-ignore - PDF.js is loaded from CDN
    const pdfjsLib = (window as any).pdfjsLib || await loadPDFJSFromCDN()
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ""

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      fullText += pageText + "\n"
    }

    return fullText.trim()
  } catch (error) {
    console.error("PDF parsing error:", error)
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function loadPDFJSFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib)
      return
    }

    // Load PDF.js from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      // Load worker
      const workerScript = document.createElement('script')
      workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      workerScript.onload = () => {
        // @ts-ignore - PDF.js is loaded from CDN
        const pdfjsLib = (window as any).pdfjsLib
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          resolve(pdfjsLib)
        } else {
          reject(new Error('Failed to load PDF.js from CDN'))
        }
      }
      workerScript.onerror = () => reject(new Error('Failed to load PDF.js worker from CDN'))
      document.head.appendChild(workerScript)
    }
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'))
    document.head.appendChild(script)
  })
}

export async function parseDOCXFile(file: File): Promise<string> {
  try {
    // Using mammoth library for parsing DOCX
    const mammoth = await import("mammoth")

    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    if (result.messages.length > 0) {
      console.warn("DOCX parsing warnings:", result.messages)
    }

    return result.value.trim()
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function parseFile(file: File): Promise<string> {
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

  switch (fileExtension) {
    case ".pdf":
      return await parsePDFFile(file)
    case ".docx":
      return await parseDOCXFile(file)
    case ".txt":
    case ".md":
    case ".csv":
    case ".text":
      return await readFileAsText(file)
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`)
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file, "utf-8")
  })
}
