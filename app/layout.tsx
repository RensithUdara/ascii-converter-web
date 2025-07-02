import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASCII Art Generator',
  description: 'Created with ASCII Art Generator',
  generator: 'ASCII Art Generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
