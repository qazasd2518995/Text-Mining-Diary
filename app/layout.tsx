import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import './globals.css'

const playfairDisplay = Playfair_Display({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const sourceSans3 = Source_Sans_3({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Learning Diary | 學習日誌',
  description: 'Weekly Reflection on GenAI-Assisted Learning',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="scroll-smooth">
      <body
        className={`${playfairDisplay.variable} ${sourceSans3.variable} font-[family-name:var(--font-body)] antialiased bg-stone-50 text-stone-800`}
      >
        {children}
      </body>
    </html>
  )
}
