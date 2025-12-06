import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IsaPomDex Scheduler',
  description: 'Clinical scheduling tool for Isatuximab, Pomalidomide, and Dexamethasone regimen for relapsed/refractory multiple myeloma.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
