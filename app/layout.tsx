import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { TranslationOptionsProvider } from "@/lib/translation-options-context"
import { Toaster } from "@/components/ui/toaster"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Urdu Transliteration App",
  description: "Advanced transliteration between Urdu, Roman Urdu, and English with file processing capabilities",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable} antialiased`}>
      <body>
        <TranslationOptionsProvider>
          {children}
          <Toaster />
        </TranslationOptionsProvider>
      </body>
    </html>
  )
}
