import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudyFlowHQ Portal — Academic Portal Management Service',
  description: 'We manage your university portal so you can focus on what matters. Assignment submission, grade tracking, deadline management — all handled by experts.',
  keywords: 'university portal management, academic concierge, assignment help, student portal service',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
