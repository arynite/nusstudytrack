'use client'

export const dynamic = 'force-dynamic'


import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import './study-plan.css'

import { generateTimetable } from '../../utils/generateTimetable' // change from @
import { flattenModules } from '../../utils/flattenmodules' // change from @
import { eeMajorRequirements } from '../../utils/requirements' // change from @
import { specialisationModules } from '../../utils/requirements' // change from @

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
