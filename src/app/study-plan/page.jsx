'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function StudyPlan() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div>
      <h1>Hello Study Plan</h1>
    </div>
  )
}
