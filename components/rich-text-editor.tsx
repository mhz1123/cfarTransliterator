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
  Download,
  Upload
} from "lucide-react"
import { useTranslationOptions } from "@/lib/translation-options-context"
import { transliterationEngine } from "@/lib/transliteration"

interface TextEditorProps {
  direction: "urdu-to-roman" | "roman-to-urdu"
  onDirectionChange: (direction: "urdu-to-roman" | "roman-to-urdu") => void
}

interface TextFormat {
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  align: "left" | "center" | "right" | "justify"
  fontSize: number
  fontFamily: string
}

interface FormattedText {
  text: string
  format: TextFormat
}

export function RichTextEditor({ direction, onDirectionChange }: TextEditorProps) {
  const [content, setContent] = useState<FormattedText[]>([
    { text: "", format: { bold: false, italic: false, underline: false, strikethrough: false, align: "left", fontSize: 16, fontFamily: "default" } }
  ])
  const [currentFormat, setCurrentFormat] = useState<TextFormat>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: "left",
    fontSize: 16,
    fontFamily: "default"
  })
  const [convertedContent, setConvertedContent] = useState<FormattedText[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { options } = useTranslationOptions()

  const fontOptions = [
    { value: "default", label: "Default", urduFont: "Noto Nastaliq Urdu" },
    { value: "jameel", label: "Jameel Noori Nastaleeq", urduFont: "Jameel Noori Nastaleeq" },
    { value: "alvi", label: "Alvi Nastaleeq", urduFont: "Alvi Nastaleeq" },
    { value: "custom", label: "Custom Font", urduFont: "Arial" }
  ]

  const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]

  const toggleFormat = (format: keyof Omit<TextFormat, 'align' | 'fontSize' | 'fontFamily'>) => {
    setCurrentFormat(prev => ({
      ...prev,
      [format]: !prev[format]
    }))
  }

  const setAlignment = (align: TextFormat['align']) => {
    setCurrentFormat(prev => ({ ...prev, align }))
  }

  const setFontSize = (size: number) => {
    setCurrentFormat(prev => ({ ...prev, fontSize: size }))
  }

  const setFontFamily = (font: string) => {
    setCurrentFormat(prev => ({ ...prev, fontFamily: font }))
  }

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText
    setContent([{ text, format: currentFormat }])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setContent(prev => [...prev, { text: "", format: currentFormat }])
    }
  }

  const convertContent = async () => {
    if (!content[0]?.text.trim()) return

    setIsConverting(true)
    try {
             const converted = await Promise.all(
         content.map(async (item) => {
           let convertedText: string
           if (direction === "roman-to-urdu") {
             const result = await transliterationEngine.transliterateRomanToUrdu(item.text)
             convertedText = result.transliteratedText
           } else {
             const result = await transliterationEngine.transliterateUrduToRoman(item.text)
             convertedText = result.transliteratedText
           }
           return {
             text: convertedText,
             format: item.format
           }
         })
       )
      setConvertedContent(converted)
    } catch (error) {
      console.error("Conversion error:", error)
    } finally {
      setIsConverting(false)
    }
  }

  const clearContent = () => {
    setContent([{ text: "", format: { bold: false, italic: false, underline: false, strikethrough: false, align: "left", fontSize: 16, fontFamily: "default" } }])
    setConvertedContent([])
  }

  const swapDirection = () => {
    const newDirection = direction === "urdu-to-roman" ? "roman-to-urdu" : "urdu-to-roman"
    onDirectionChange(newDirection)
    setConvertedContent([])
  }

  const downloadContent = (type: "original" | "converted") => {
    const data = type === "original" ? content : convertedContent
    if (!data[0]?.text.trim()) return

    const text = data.map(item => item.text).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `urdu-text-${type}-${new Date().toISOString().split('T')[0]}.txt`
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

  const getTextStyle = (format: TextFormat, isUrdu: boolean = false) => {
    return {
      fontWeight: format.bold ? 'bold' : 'normal',
      fontStyle: format.italic ? 'italic' : 'normal',
      textDecoration: [
        format.underline ? 'underline' : '',
        format.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' '),
      textAlign: format.align,
      fontSize: `${format.fontSize}px`,
      fontFamily: getFontFamily(format.fontFamily, isUrdu)
    }
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
                variant={currentFormat.bold ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFormat('bold')}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant={currentFormat.italic ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFormat('italic')}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant={currentFormat.underline ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFormat('underline')}
                className="h-8 w-8 p-0"
              >
                <Underline className="h-3 w-3" />
              </Button>
              <Button
                variant={currentFormat.strikethrough ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFormat('strikethrough')}
                className="h-8 w-8 p-0"
              >
                <Strikethrough className="h-3 w-3" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <Button
                variant={currentFormat.align === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => setAlignment("left")}
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant={currentFormat.align === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => setAlignment("center")}
                className="h-8 w-8 p-0"
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant={currentFormat.align === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => setAlignment("right")}
                className="h-8 w-8 p-0"
              >
                <AlignRight className="h-3 w-3" />
              </Button>
              <Button
                variant={currentFormat.align === "justify" ? "default" : "outline"}
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
                value={currentFormat.fontSize}
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
                value={currentFormat.fontFamily}
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
                onInput={handleTextChange}
                onKeyDown={handleKeyDown}
                className="min-h-64 p-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                style={getTextStyle(currentFormat)}
                suppressContentEditableWarning
              />
            </div>

            {/* Converted Output */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Converted Text ({direction === "roman-to-urdu" ? "Urdu" : "Roman Urdu"})</h4>
                <Button
                  onClick={convertContent}
                  disabled={!content[0]?.text.trim() || isConverting}
                  size="sm"
                  className="h-7 text-xs"
                >
                  {isConverting ? "Converting..." : "Convert"}
                </Button>
              </div>
              <div className="min-h-64 p-4 border rounded-lg bg-muted/30 overflow-auto">
                {convertedContent.length > 0 ? (
                  convertedContent.map((item, index) => (
                    <div
                      key={index}
                      style={getTextStyle(item.format, direction === "roman-to-urdu")}
                      className="mb-2"
                    >
                      {item.text}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Converted text will appear here...
                  </p>
                )}
              </div>
              {convertedContent.length > 0 && (
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
