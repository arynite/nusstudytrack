'use client'

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

export default function StudyPlan() {
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
  const specialisations = searchParams.get('specialisations')?.split(',') || []

  //
  const handleViewTimetable = () => {
  router.push(`/view-timetable?education=${encodeURIComponent(education)}&degreeLength=${degreeLength}&rc=${encodeURIComponent(rc)}&specialisations=${specialisations.join(',')}`)
  }
  //

  return (
    <div className="studyplan-container">
      <h2 className="studyplan-title">Your Submitted Study Plan</h2>

      <p><span className="studyplan-label">Education:</span> {education}</p>
      <p><span className="studyplan-label">Degree Length:</span> {degreeLength} years</p>
      <p><span className="studyplan-label">Residential College:</span> {rc}</p>
      <p>
        <span className="studyplan-label">Specialisations / Minors:</span>{' '}
        {specialisations.length > 0
            ? specialisations
                .map(spec => specialisationLabels[spec] || spec)
                .join(', ')
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
