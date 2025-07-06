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


const specialisationLabels = {
  'adv-electronics': 'Advanced Electronics',
  'industry4': 'Industry 4.0',
  'iot': 'Internet of Things',
  'microelectronics': 'Microelectronics & Quantum Materials',
  'robotics': 'Robotics',
  'space-tech': 'Space Technology',
  'transportation': 'Sustainable Electric Transportation',
  'data-eng': 'Minor in Data Engineering',
}

const exemptionLabels = {
  'PC1201': 'PC1201',
  'MA1301 (eg. NP CAEM)': 'MA1301',
  'ES1103': 'ES1103',
  'ES1000': 'ES1000',
}


export default function StudyPlan() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [plannedSemesters, setPlannedSemesters] = useState([])

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
