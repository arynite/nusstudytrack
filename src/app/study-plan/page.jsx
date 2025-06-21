'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import './study-plan.css'

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
  'MA1301 (eg. NP CAEM)': 'MA1301',
  'ES1103': 'ES1103',
  'ES1000': 'ES1000',
}

export default function StudyPlan() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null 
  }

  const education = searchParams.get('education')
  const degreeLength = searchParams.get('degreeLength')
  const rc = searchParams.get('rc')
  const specialisations = searchParams.get('specialisations')?.split(',').filter(Boolean) || []
  const exemptions = searchParams.get('exemptions')?.split(',').filter(Boolean) || []

  const handleViewTimetable = () => {
    router.push('/view-timetable')
  }
  
  return (
    <div className="studyplan-container">
      <h2 className="studyplan-title">Your Submitted Study Plan</h2>

      <p><span className="studyplan-label">Education:</span> {education}</p>
      <p><span className="studyplan-label">Degree Length:</span> {degreeLength} years</p>
      <p><span className="studyplan-label">Residential College:</span> {rc}</p>

      <p>
        <span className="studyplan-label">Exemptions:</span>{' '}
        {exemptions.length > 0
          ? exemptions.map(ex => exemptionLabels[ex] || ex).join(', ')
          : 'None'}
      </p>

      <p>
        <span className="studyplan-label">Specialisations / Minors:</span>{' '}
        {specialisations.length > 0
          ? specialisations.map(spec => specialisationLabels[spec] || spec).join(', ')
          : 'None'}
      </p>

      <br />
      <hr />
      <div className="button-container">
        <button className="view-timetable-button" onClick={handleViewTimetable}>
          View Timetables
        </button>
      </div>
    </div>
  )
}
