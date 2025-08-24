export interface LexiconEntry {
  urdu_script: string
  roman_urdu: string
}

export interface TransliterationResult {
  originalText: string
  transliteratedText: string
  method: "lexicon" | "rule-based" | "hybrid"
  completeness: {
    isComplete: boolean
    untransliteratedParts: string[]
    totalWords: number
    untransliteratedCount: number
  }
}

// Enhanced character mappings based on the Python implementation
const URDU_TO_ROMAN_MAP: Record<string, string> = {
  // Basic letters
  ا: "a",
  آ: "aa",
  أ: "a",
  إ: "i",
  ب: "b",
  پ: "p",
  ت: "t",
  ٹ: "T",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ڈ: "D",
  ذ: "z",
  ر: "r",
  ڑ: "R",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "",
  غ: "gh",
  ف: "f",
  ق: "q",
  ک: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  ں: "n",
  و: "w",
  ہ: "h",
  ھ: "h",
  ی: "y",
  ے: "e",
  ء: "'",
  // Punctuation
  " ": " ",
  "۔": ".",
  "؟": "?",
  "،": ",",
  "؍": "/",
  "٪": "%",
}

const ROMAN_TO_URDU_MAP: Record<string, string> = {
  // Vowels
  aa: "آ",
  a: "ا",
  e: "ے",
  i: "ی",
  o: "و",
  u: "و",
  // Consonants - prioritize longer sequences first
  ch: "چ",
  kh: "خ",
  gh: "غ",
  sh: "ش",
  zh: "ژ",
  th: "تھ",
  ph: "پھ",
  dh: "دھ",
  rh: "ڑھ",
  bh: "بھ",
  jh: "جھ",
  mh: "مھ",
  nh: "نھ",
  // Single consonants
  b: "ب",
  p: "پ",
  t: "ت",
  T: "ٹ",
  j: "ج",
  h: "ہ",
  d: "د",
  D: "ڈ",
  r: "ر",
  R: "ڑ",
  z: "ز",
  s: "س",
  f: "ف",
  q: "ق",
  k: "ک",
  g: "گ",
  l: "ل",
  m: "م",
  n: "ن",
  w: "و",
  y: "ی",
  // Punctuation
  ".": "۔",
  "?": "؟",
  ",": "،",
  "/": "؍",
  "%": "٪",
  " ": " ",
}

// Character normalization
const NORMALIZE_MAP: Record<string, string> = {
  ي: "ی", // Arabic yeh to Urdu yeh
  ى: "ی", // Alif maksura to yeh
  ؤ: "یٔ", // Yeh with hamza
  ك: "ک", // Arabic kaf to Urdu kaf
  ة: "ہ", // Teh marbuta to heh
  ۀ: "ہ", // Heh with yeh above
}

// Arabic digits normalization
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
const ENGLISH_DIGITS = "0123456789"

class TransliterationEngine {
  private lexicon: Map<string, string> = new Map()
  private reverseLexicon: Map<string, string> = new Map()
  private isLoaded = false

  async loadLexicon(): Promise<void> {
    if (this.isLoaded) return

    try {
      const response = await fetch("/lexicon.json")
      const data: LexiconEntry[] = await response.json()

      this.lexicon.clear()
      this.reverseLexicon.clear()

      data.forEach((entry) => {
        const urdu = this.normalizeUrdu(entry.urdu_script.trim())
        const roman = entry.roman_urdu.trim().toLowerCase()

        if (urdu && roman) {
          this.lexicon.set(urdu, roman)
          this.reverseLexicon.set(roman, urdu)

          // Add word-level mappings
          const urduWords = urdu.split(/\s+/)
          const romanWords = roman.split(/\s+/)

          if (urduWords.length === 1 && romanWords.length === 1) {
            this.lexicon.set(urduWords[0], romanWords[0])
            this.reverseLexicon.set(romanWords[0], urduWords[0])
          }
        }
      })

      this.isLoaded = true
      console.log(`Lexicon loaded: ${this.lexicon.size} Urdu→Roman mappings`)
    } catch (error) {
      console.error("Failed to load lexicon:", error)
      this.isLoaded = false
    }
  }

  private normalizeUrdu(text: string): string {
    // Convert Arabic digits to English
    let normalized = text
    for (let i = 0; i < ARABIC_DIGITS.length; i++) {
      normalized = normalized.replace(new RegExp(ARABIC_DIGITS[i], "g"), ENGLISH_DIGITS[i])
    }

    // Remove tatweel (kashida)
    normalized = normalized.replace(/\u0640/g, "")

    // Apply character normalization
    Object.entries(NORMALIZE_MAP).forEach(([arabic, urdu]) => {
      normalized = normalized.replace(new RegExp(arabic, "g"), urdu)
    })

    // Remove diacritics
    normalized = normalized.replace(/[\u064B-\u0652\u0670]/g, "")

    return normalized
  }

  private transliterateUrduWordRuleBased(word: string): string {
    const chars = Array.from(word)
    const result: string[] = []
    let i = 0

    while (i < chars.length) {
      const currentChar = chars[i]

      // Handle aspiration: consonant + do-chashmi heh (ھ)
      if (i + 1 < chars.length && chars[i + 1] === "ھ") {
        const baseRoman = URDU_TO_ROMAN_MAP[currentChar]
        if (baseRoman) {
          result.push(baseRoman + "h")
          i += 2
          continue
        }
      }

      // Direct character mapping
      const mapped = URDU_TO_ROMAN_MAP[currentChar]
      result.push(mapped || currentChar)
      i++
    }

    return this.applyPhoneticRules(result.join(""))
  }

  private transliterateRomanWordRuleBased(word: string): string {
    const cleanWord = word.replace(/[.,!?;:]+$/, "")
    const punctuation = word.slice(cleanWord.length)

    const wordLower = cleanWord.toLowerCase()
    let result = ""
    let i = 0

    // Sort keys by length (longest first)
    const sortedKeys = Object.keys(ROMAN_TO_URDU_MAP).sort((a, b) => b.length - a.length)

    while (i < wordLower.length) {
      let matched = false

      for (const key of sortedKeys) {
        if (key !== " " && wordLower.substring(i).startsWith(key)) {
          result += ROMAN_TO_URDU_MAP[key]
          i += key.length
          matched = true
          break
        }
      }

      if (!matched) {
        const char = wordLower[i]
        // Handle unmapped characters
        if (char === "a") result += "ا"
        else if (char === "i") result += "ی"
        else if (char === "u" || char === "o") result += "و"
        else if (char === "e") result += "ے"
        else result += char
        i++
      }
    }

    // Add back punctuation in Urdu
    const urduPunctuation = punctuation.replace(/\./g, "۔").replace(/\?/g, "؟").replace(/,/g, "،")

    return result + urduPunctuation
  }

  private applyPhoneticRules(text: string): string {
    // Convert 'w' between consonants to 'o' for vowel sound
    text = text.replace(
      /(?<=[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])w(?=[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])/g,
      "o",
    )

    // Convert 'y' between consonants to 'i' for vowel sound
    text = text.replace(
      /(?<=[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])y(?=[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])/g,
      "i",
    )

    // Clean up multiple spaces
    text = text.replace(/\s+/g, " ")

    // Remove leading/trailing apostrophes and spaces
    return text.trim().replace(/^['"\s]+|['"\s]+$/g, "")
  }

  private checkCompleteness(originalText: string, transliteratedText: string, direction: "ur-to-en" | "en-to-ur") {
    if (direction === "ur-to-en") {
      // Check if any Urdu characters remain
      const urduPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g
      const untransliterated = transliteratedText.match(urduPattern) || []

      return {
        isComplete: untransliterated.length === 0,
        untransliteratedParts: untransliterated,
        totalWords: originalText.split(/\s+/).length,
        untransliteratedCount: untransliterated.length,
      }
    } else {
      // Check if any Latin characters remain
      const latinPattern = /[A-Za-z]+/g
      const untransliterated = transliteratedText.match(latinPattern) || []

      return {
        isComplete: untransliterated.length === 0,
        untransliteratedParts: untransliterated,
        totalWords: originalText.split(/\s+/).length,
        untransliteratedCount: untransliterated.length,
      }
    }
  }

  async transliterateUrduToRoman(text: string): Promise<TransliterationResult> {
    await this.loadLexicon()

    const normalizedText = this.normalizeUrdu(text)

    // Try exact phrase match first
    if (this.lexicon.has(normalizedText)) {
      const result = this.lexicon.get(normalizedText)!
      return {
        originalText: text,
        transliteratedText: result,
        method: "lexicon",
        completeness: this.checkCompleteness(text, result, "ur-to-en"),
      }
    }

    // Word-by-word processing
    const words = normalizedText.split(/\s+/)
    const resultWords: string[] = []
    const methodsUsed: string[] = []

    for (const word of words) {
      const cleanWord = word.replace(/[۔؟،؍٪]+$/, "")
      const punctuation = word.slice(cleanWord.length)

      if (this.lexicon.has(cleanWord)) {
        const romanPunct = punctuation.replace(/۔/g, ".").replace(/؟/g, "?").replace(/،/g, ",")
        resultWords.push(this.lexicon.get(cleanWord)! + romanPunct)
        methodsUsed.push("lexicon")
      } else {
        const transliterated = this.transliterateUrduWordRuleBased(cleanWord)
        const romanPunct = punctuation.replace(/۔/g, ".").replace(/؟/g, "?").replace(/،/g, ",")
        resultWords.push(transliterated + romanPunct)
        methodsUsed.push("rule-based")
      }
    }

    const result = resultWords.join(" ")
    const method =
      methodsUsed.includes("lexicon") && methodsUsed.includes("rule-based")
        ? "hybrid"
        : methodsUsed.includes("lexicon")
          ? "lexicon"
          : "rule-based"

    return {
      originalText: text,
      transliteratedText: result,
      method: method as "lexicon" | "rule-based" | "hybrid",
      completeness: this.checkCompleteness(text, result, "ur-to-en"),
    }
  }

  async transliterateRomanToUrdu(text: string): Promise<TransliterationResult> {
    await this.loadLexicon()

    const trimmedText = text.trim()
    if (!trimmedText) {
      return {
        originalText: text,
        transliteratedText: "",
        method: "rule-based",
        completeness: { isComplete: true, untransliteratedParts: [], totalWords: 0, untransliteratedCount: 0 },
      }
    }

    // Try exact phrase match first
    const lowerText = trimmedText.toLowerCase()
    if (this.reverseLexicon.has(lowerText)) {
      const result = this.reverseLexicon.get(lowerText)!
      return {
        originalText: text,
        transliteratedText: result,
        method: "lexicon",
        completeness: this.checkCompleteness(text, result, "en-to-ur"),
      }
    }

    // Word-by-word processing
    const words = trimmedText.split(/\s+/)
    const resultWords: string[] = []
    const methodsUsed: string[] = []

    for (const word of words) {
      const lowerWord = word.toLowerCase()

      if (this.reverseLexicon.has(lowerWord)) {
        resultWords.push(this.reverseLexicon.get(lowerWord)!)
        methodsUsed.push("lexicon")
      } else {
        const transliterated = this.transliterateRomanWordRuleBased(word)
        resultWords.push(transliterated)
        methodsUsed.push("rule-based")
      }
    }

    const result = resultWords.join(" ")
    const method =
      methodsUsed.includes("lexicon") && methodsUsed.includes("rule-based")
        ? "hybrid"
        : methodsUsed.includes("lexicon")
          ? "lexicon"
          : "rule-based"

    return {
      originalText: text,
      transliteratedText: result,
      method: method as "lexicon" | "rule-based" | "hybrid",
      completeness: this.checkCompleteness(text, result, "en-to-ur"),
    }
  }
}

// Export singleton instance
export const transliterationEngine = new TransliterationEngine()
