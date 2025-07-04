'use client'

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

  const education = searchParams.get('education')
  const degreeLength = Number(searchParams.get('degreeLength') || '4')
  const rc = searchParams.get('rc')
  const specialisations = searchParams.get('specialisations')?.split(',').filter(Boolean) || []
  const exemptions = searchParams.get('exemptions')?.split(',').filter(Boolean) || []

  let x;
  const numSPN = selectedSpecialisations.length;
  if (numSPN === 0) {
    x = 40;
  } else if (numSPN === 1) {
    x = 20;
  } else if (numSPN >= 2) {
    x = 0;
  }

  const handleViewTimetable = async () => {
    const flattenedModules = flattenModules(eeMajorRequirements, specialisations, specialisationModules)

    try {
      const timetable = await generateTimetable(flattenedModules, degreeLength * 2)
      console.log('Generated Timetable:', timetable)
      setPlannedSemesters(timetable)
    } catch (err) {
      console.error('Failed to generate timetable', err)
    }
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
          View Timetable
        </button>
      </div>

      {plannedSemesters.length > 0 && (
        <div className="timetable-container mt-6">
          <h3 className="studyplan-title">Suggested Semester Plan</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {plannedSemesters.map((semester, idx) => (
              <div key={idx} className="semester-card border p-4 rounded shadow">
                <h4 className="font-semibold mb-2">Semester {idx + 1}</h4>
                <ul className="list-disc pl-5 text-sm">
                  {semester.map((mod) => (
                    <li key={mod}>{mod}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
