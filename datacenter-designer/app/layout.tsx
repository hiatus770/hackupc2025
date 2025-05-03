import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Siemens Datacenter Designer',
  description: 'Created with at hackupc!'
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
