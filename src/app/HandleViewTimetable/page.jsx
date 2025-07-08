'use client'

import { useEffect, useState } from 'react'
import { flattenModules } from '../../utils/flattenmodules'
import { generateTimetable } from '../../utils/generateTimetable'
import { specialisationModules } from '../../utils/requirements'
import './HandleViewTimetable.css'

export default function TimetablePage() {
  const [plannedSemesters, setPlannedSemesters] = useState([])
  const [mounted, setMounted] = useState(false)
  const [formValues, setFormValues] = useState({
    education: '',
    degreeLength: 4,
    rc: '',
    specialisations: [],
    exemptions: [],
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const education = params.get('education') || ''
    const degreeLength = Number(params.get('degreeLength') || '4')
    const rc = params.get('rc') || ''
    const specialisations = params.get('specialisations')?.split(',').filter(Boolean) || []
    const exemptions = params.get('exemptions')?.split(',').filter(Boolean) || []

    const fv = { education, degreeLength, rc, specialisations, exemptions }
    setFormValues(fv)

    const generate = async () => {
      const flattened = flattenModules(specialisations, specialisationModules, exemptions)
      const timetable = await generateTimetable(flattened, degreeLength * 2)
      setPlannedSemesters(timetable)
      setMounted(true)
    }

    generate()
  }, [])

  if (!mounted) return <p>Loading...</p>

  return (
    <div className="studyplan-container">
      <h2 className="studyplan-title">Suggested Semester Plan</h2>
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

      <div className="content-container">
        <div className="button-container">
          <button className="generate-timetable-button" onClick={() => router.push('/create-plan')}>
            Reshuffle
          </button>
        </div>
      </div>

    </div>
  )
}


