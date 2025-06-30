'use client'

import { SessionProvider} from 'next-auth/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <SessionProvider>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-100 min-h-screen">
        {children}
      </div>
      <Footer />
    </SessionProvider>
    )
}