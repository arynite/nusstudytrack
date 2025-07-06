'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

//import { useRouter } from 'next/navigation'
//import { useSearchParams } from 'next/navigation'
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
  //const [mounted, setMounted] = useState(false)
  //const [plannedSemesters, setPlannedSemesters] = useState([])
  const [formValues, setFormValues] = useState({
  education: '',
  degreeLength: 4,
  rc: '',
  specialisations: [],
  exemptions: [],
})
const [plannedSemesters, setPlannedSemesters] = useState([])
const [mounted, setMounted] = useState(false)


useEffect(() => {
  //const params = new URLSearchParams(window.location.search)
  const education = params.get('education')
  const degreeLength = Number(params.get('degreeLength') || '4')
  const rc = params.get('rc')
  const specialisations = params.get('specialisations')?.split(',').filter(Boolean) || []
  const exemptions = params.get('exemptions')?.split(',').filter(Boolean) || []

  setFormValues({ education, degreeLength, rc, specialisations, exemptions })
  setMounted(true)
}, [])

  if (!mounted) return null

  //const education = searchParams.get('education')
  //const degreeLength = Number(searchParams.get('degreeLength') || '4')
  //const rc = searchParams.get('rc')
  //const specialisations = searchParams.get('specialisations')?.split(',').filter(Boolean) || []
  //const exemptions = searchParams.get('exemptions')?.split(',').filter(Boolean) || []

  
  const handleViewTimetable = async () => {
    const flattenedModules = flattenModules(
      formValues.specialisations,
      specialisationModules,
      formValues.exemptions
    )
    const timetable = await generateTimetable(flattenedModules, formValues.degreeLength * 2)
  }

  

  return (
    <div className="studyplan-container">
      <h2 className="studyplan-title">Your Submitted Study Plan</h2>

      <p><span className="studyplan-label">Education:</span> {formValues.education}</p>
      <p><span className="studyplan-label">Degree Length:</span> {formValues.degreeLength} years</p>
      <p><span className="studyplan-label">Residential College:</span> {formValues.rc}</p>

      <p>
        <span className="studyplan-label">Exemptions:</span>{' '}
        {formValues.exemptions.length > 0
          ? formValues.exemptions.map(ex => exemptionLabels[ex] || ex).join(', ')
          : 'None'}
      </p>

      <p>
        <span className="studyplan-label">Specialisations / Minors:</span>{' '}
        {formValues.specialisations.length > 0
          ? formValues.specialisations.map(spec => specialisationLabels[spec] || spec).join(', ')
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