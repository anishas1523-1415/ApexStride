import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AuraKinematics | 3D Biomechanical AI Analyzer',
  description: 'Zero-sensor sports kinematics application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050810] to-black text-slate-100 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Toaster theme="dark" position="top-center" />
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
