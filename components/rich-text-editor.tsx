"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  RotateCcw,
  ArrowRightLeft,
  Download
} from "lucide-react"
import { useTranslationOptions } from "@/lib/translation-options-context"
import { transliterationEngine } from "@/lib/transliteration"
import { trackFeatureUsageEvent, trackTranslationEvent } from "@/components/analytics-tracker"

interface TextEditorProps {
  direction: "urdu-to-roman" | "roman-to-urdu"
  onDirectionChange: (direction: "urdu-to-roman" | "roman-to-urdu") => void
}

interface FormattedText {
  text: string
  format: {
    bold: boolean
    italic: boolean
    underline: boolean
    strikethrough: boolean
    align: "left" | "center" | "right" | "justify"
    fontSize: number
    fontFamily: string
  }
}

export function RichTextEditor({ direction, onDirectionChange }: TextEditorProps) {
  const [convertedContent, setConvertedContent] = useState<string>("")
  const [isConverting, setIsConverting] = useState(false)
  const [toolbarUpdate, setToolbarUpdate] = useState(0) // Force re-render for toolbar
  const editorRef = useRef<HTMLDivElement>(null)
  const { options } = useTranslationOptions()

  const fontOptions = [
    { value: "default", label: "Default", urduFont: "Noto Nastaliq Urdu" },
    { value: "jameel", label: "Jameel Noori Nastaleeq", urduFont: "Jameel Noori Nastaleeq" },
    { value: "alvi", label: "Alvi Nastaleeq", urduFont: "Alvi Nastaleeq" },
    { value: "custom", label: "Custom Font", urduFont: "Arial" }
  ]

  const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]

  // Initialize editor with proper contentEditable setup
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<div><br></div>'
    }
  }, [])

  // Add event listeners for selection changes
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const handleSelectionChange = () => {
      // Force re-render to update toolbar state
      setToolbarUpdate(prev => prev + 1)
    }

    const handleMouseUp = () => {
      handleSelectionChange()
    }

    const handleKeyUp = () => {
      handleSelectionChange()
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    editor.addEventListener('mouseup', handleMouseUp)
    editor.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      editor.removeEventListener('mouseup', handleMouseUp)
      editor.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Apply formatting to selected text
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    // Force toolbar update after applying format
    setTimeout(() => setToolbarUpdate(prev => prev + 1), 10)
  }

  // Get current formatting state
  const getCurrentFormat = () => {
    return {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
      align: getCurrentAlignment(),
      fontSize: getCurrentFontSize(),
      fontFamily: getCurrentFontFamily()
    }
  }

  const getCurrentAlignment = () => {
    if (document.queryCommandState('justifyLeft')) return "left"
    if (document.queryCommandState('justifyCenter')) return "center"
    if (document.queryCommandState('justifyRight')) return "right"
    if (document.queryCommandState('justifyFull')) return "justify"
    return "left"
  }

  const getCurrentFontSize = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
        ? range.commonAncestorContainer.parentElement 
        : range.commonAncestorContainer as Element
      
      if (element) {
        const fontSize = window.getComputedStyle(element).fontSize
        return parseInt(fontSize) || 16
      }
    }
    return 16
  }

  const getCurrentFontFamily = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
        ? range.commonAncestorContainer.parentElement 
        : range.commonAncestorContainer as Element
      
      if (element) {
        const fontFamily = window.getComputedStyle(element).fontFamily
        // Map font family back to our options
        if (fontFamily.includes('Noto Nastaliq Urdu')) return "default"
        if (fontFamily.includes('Jameel Noori Nastaleeq')) return "jameel"
        if (fontFamily.includes('Alvi Nastaleeq')) return "alvi"
        return "default"
      }
    }
    return "default"
  }

  const setAlignment = (align: "left" | "center" | "right" | "justify") => {
    const command = `justify${align.charAt(0).toUpperCase() + align.slice(1)}`
    applyFormat(command)
    // Force toolbar update after alignment change
    setTimeout(() => setToolbarUpdate(prev => prev + 1), 10)
  }

  const setFontSize = (size: number) => {
    applyFormat('fontSize', size.toString())
    // Force toolbar update after font size change
    setTimeout(() => setToolbarUpdate(prev => prev + 1), 10)
  }

  const setFontFamily = (font: string) => {
    const fontOption = fontOptions.find(f => f.value === font)
    if (fontOption) {
      applyFormat('fontName', fontOption.urduFont)
      // Force toolbar update after font family change
      setTimeout(() => setToolbarUpdate(prev => prev + 1), 10)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyFormat('insertParagraph')
    }
  }

  const convertContent = async () => {
    if (!editorRef.current || !editorRef.current.innerText.trim()) return

    setIsConverting(true)
    try {
      const htmlContent = editorRef.current.innerHTML
      const textContent = editorRef.current.innerText

      // Convert the text content
      let convertedText: string
      if (direction === "roman-to-urdu") {
        const result = await transliterationEngine.transliterateRomanToUrdu(textContent)
        convertedText = result.transliteratedText
      } else {
        const result = await transliterationEngine.transliterateUrduToRoman(textContent)
        convertedText = result.transliteratedText
      }

      // Apply the same HTML structure to converted text
      const convertedHtml = applyFormattingToConvertedTextAdvanced(htmlContent, convertedText)
      setConvertedContent(convertedHtml)

      // Track translation event
      const wordCount = textContent.split(/\s+/).length
      trackTranslationEvent(direction, 'rich_text_editor', wordCount)
      trackFeatureUsageEvent('rich_text_editor_conversion')
    } catch (error) {
      console.error("Conversion error:", error)
    } finally {
      setIsConverting(false)
    }
  }

  const applyFormattingToConvertedText = (originalHtml: string, convertedText: string) => {
    // Create a temporary div to parse the original HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = originalHtml

    // Split converted text into lines
    const convertedLines = convertedText.split('\n')
    
    // Process each line and preserve formatting
    const formattedLines = convertedLines.map((line, index) => {
      // Find the corresponding original element
      const originalElement = tempDiv.children[index] as HTMLElement
      
      if (originalElement && line.trim()) {
        // Clone the original element to preserve all formatting
        const clonedElement = originalElement.cloneNode(true) as HTMLElement
        
        // Clear the content and add the converted text
        clonedElement.innerHTML = ''
        clonedElement.textContent = line
        
        return clonedElement.outerHTML
      }
      
      // For empty lines, preserve the original element structure
      if (originalElement) {
        return originalElement.outerHTML
      }
      
      return '<div><br></div>'
    })
    
    return formattedLines.join('')
  }

  const applyFormattingToConvertedTextAdvanced = (originalHtml: string, convertedText: string) => {
    // Create a temporary div to parse the original HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = originalHtml

    // Split converted text into lines
    const convertedLines = convertedText.split('\n')
    
    // Process each line and preserve formatting
    const formattedLines = convertedLines.map((line, index) => {
      // Find the corresponding original element
      const originalElement = tempDiv.children[index] as HTMLElement
      
      if (originalElement && line.trim()) {
        // Clone the original element to preserve all formatting
        const clonedElement = originalElement.cloneNode(true) as HTMLElement
        
        // Replace the text content while preserving HTML structure
        const originalText = originalElement.textContent || ''
        if (originalText) {
          // Walk through the DOM tree and replace text nodes
          const walker = document.createTreeWalker(
            clonedElement,
            NodeFilter.SHOW_TEXT,
            null
          )
          
          let textNode
          while (textNode = walker.nextNode()) {
            if (textNode.textContent && textNode.textContent.trim()) {
              textNode.textContent = line
              break // Replace only the first text node
            }
          }
        } else {
          // If no text content, set the innerHTML
          clonedElement.innerHTML = line
        }
        
        return clonedElement.outerHTML
      }
      
      // For empty lines, preserve the original element structure
      if (originalElement) {
        return originalElement.outerHTML
      }
      
      return '<div><br></div>'
    })
    
    return formattedLines.join('')
  }

  const clearContent = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<div><br></div>'
    }
    setConvertedContent("")
  }

  const swapDirection = () => {
    const newDirection = direction === "urdu-to-roman" ? "roman-to-urdu" : "urdu-to-roman"
    onDirectionChange(newDirection)
    setConvertedContent("")
  }

  const downloadContent = (type: "original" | "converted") => {
    let content = ""
    let filename = ""

    if (type === "original") {
      content = editorRef.current?.innerText || ""
      filename = `urdu-text-original-${new Date().toISOString().split('T')[0]}.txt`
    } else {
      content = convertedContent.replace(/<[^>]*>/g, '') // Remove HTML tags
      filename = `urdu-text-converted-${new Date().toISOString().split('T')[0]}.txt`
    }

    if (!content.trim()) return

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFontFamily = (fontValue: string, isUrdu: boolean = false) => {
    const font = fontOptions.find(f => f.value === fontValue)
    if (isUrdu && font) {
      return font.urduFont
    }
    return fontValue === "default" ? "inherit" : fontValue
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="leading-none font-semibold flex items-center gap-2">
                Rich Text Editor
                <Badge variant="secondary" className="text-xs">
                  {direction === "roman-to-urdu" ? "Roman → Urdu" : "Urdu → Roman"}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Write and format text in {direction === "roman-to-urdu" ? "Roman Urdu" : "Urdu"}, then convert while preserving formatting
              </p>
            </div>
            <Button
              onClick={swapDirection}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Swap
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-3 border rounded-lg bg-muted/30">
            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <Button
                variant={getCurrentFormat().bold ? "default" : "outline"}
                size="sm"
                onClick={() => applyFormat('bold')}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant={getCurrentFormat().italic ? "default" : "outline"}
                size="sm"
                onClick={() => applyFormat('italic')}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant={getCurrentFormat().underline ? "default" : "outline"}
                size="sm"
                onClick={() => applyFormat('underline')}
                className="h-8 w-8 p-0"
              >
                <Underline className="h-3 w-3" />
              </Button>
              <Button
                variant={getCurrentFormat().strikethrough ? "default" : "outline"}
                size="sm"
                onClick={() => applyFormat('strikethrough')}
                className="h-8 w-8 p-0"
              >
                <Strikethrough className="h-3 w-3" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <Button
                variant={getCurrentFormat().align === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => setAlignment("left")}
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant={getCurrentFormat().align === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => setAlignment("center")}
                className="h-8 w-8 p-0"
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant={getCurrentFormat().align === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => setAlignment("right")}
                className="h-8 w-8 p-0"
              >
                <AlignRight className="h-3 w-3" />
              </Button>
              <Button
                variant={getCurrentFormat().align === "justify" ? "default" : "outline"}
                size="sm"
                onClick={() => setAlignment("justify")}
                className="h-8 w-8 p-0"
              >
                <AlignJustify className="h-3 w-3" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Font Size */}
            <div className="flex items-center gap-2">
              <Type className="h-3 w-3 text-muted-foreground" />
              <select
                value={getCurrentFormat().fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="h-8 px-2 text-xs border rounded bg-background"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Font Family */}
            <div className="flex items-center gap-2">
              <Type className="h-3 w-3 text-muted-foreground" />
              <select
                value={getCurrentFormat().fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="h-8 px-2 text-xs border rounded bg-background"
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Input Text ({direction === "roman-to-urdu" ? "Roman Urdu" : "Urdu"})</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={clearContent}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                  <Button
                    onClick={() => downloadContent("original")}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              <div
                ref={editorRef}
                contentEditable
                onKeyDown={handleKeyDown}
                className="min-h-64 p-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-text break-words whitespace-pre-wrap"
                style={{
                  fontFamily: getFontFamily(getCurrentFormat().fontFamily, direction === "urdu-to-roman"),
                  direction: direction === "urdu-to-roman" ? "rtl" : "ltr",
                  caretColor: "currentColor"
                }}
                suppressContentEditableWarning
              />
            </div>

            {/* Converted Output */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Converted Text ({direction === "roman-to-urdu" ? "Urdu" : "Roman Urdu"})</h4>
                <Button
                  onClick={convertContent}
                  disabled={!editorRef.current?.innerText.trim() || isConverting}
                  size="sm"
                  className="h-7 text-xs"
                >
                  {isConverting ? "Converting..." : "Convert"}
                </Button>
              </div>
              <div 
                className="min-h-64 p-4 border rounded-lg bg-muted/30 overflow-auto"
                style={{
                  fontFamily: getFontFamily(getCurrentFormat().fontFamily, direction === "roman-to-urdu"),
                  direction: direction === "roman-to-urdu" ? "rtl" : "ltr"
                }}
                dangerouslySetInnerHTML={{ __html: convertedContent || '<p class="text-muted-foreground text-sm">Converted text will appear here...</p>' }}
              />
              {convertedContent && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => downloadContent("converted")}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download Converted
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Font Upload Section */}
          <div className="p-4 border rounded-lg bg-muted/20">
            <h4 className="text-sm font-medium mb-3">Custom Font Upload</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  className="text-xs"
                  id="font-upload"
                />
                <label htmlFor="font-upload" className="text-xs text-muted-foreground">
                  Upload custom font file
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: TTF, OTF, WOFF, WOFF2
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
