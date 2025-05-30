'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const LandingPageContent = dynamic(
  () => import('./landing-page-content'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to CRM</h1>
          <p className="text-gray-400">Loading landing page...</p>
        </div>
      </div>
    )
  }
)

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to CRM</h1>
            <p className="text-gray-400">Loading landing page...</p>
          </div>
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  )
}
