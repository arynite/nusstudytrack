'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import './study-plan.css'
import { generateTimetable } from '../../utils/generateTimetable'
import { flattenModules } from '../../utils/flattenmodules'
import { eeMajorRequirements } from '../../utils/requirements'
import { specialisationModules } from '../../utils/requirements'
import { supabase } from '../../utils/supabaseClient'

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
  const [formValues, setFormValues] = useState({
  education: '',
  degreeLength: '',
  rc: '',
  specialisations: [],
  exemptions: [],
})
const [plannedSemesters, setPlannedSemesters] = useState([])
const [mounted, setMounted] = useState(false)
const [loading, setLoading] = useState(false)


useEffect(() => {
  const fetchUserData = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert('You must be logged in')
      router.push('/login')
      return
    }

    const { data, error, status } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
      console.log('Fetched data from study plan:', data)

    if (error && status !== 406) {
      console.error('Failed to fetch study plan:', error)
    } else if (data) {
      setFormValues({
        education: data.education,
        degreeLength: data.degree_length,
        rc: data.rc,
        specialisations: data.specialisations || [],
        exemptions: data.exemptions || [],
      })

      console.log('Fetched data from Supabase:', data)

      setFormValues({
        education: data.education,
        degreeLength: data.degree_length,
        rc: data.rc,
        specialisations: Array.isArray(data.specialisations) ? data.specialisations : [],
        exemptions: Array.isArray(data.exemptions) ? data.exemptions : [],
      })

      setMounted(true)
    }
  }
  fetchUserData()
}, [])
  if (!mounted) return null
  
  const handleViewTimetable = () => {
    const queryParams = new URLSearchParams({
      education: formValues.education,
      degreeLength: formValues.degreeLength.toString(),
      rc: formValues.rc,
      specialisations: formValues.specialisations.join(','),
      exemptions: formValues.exemptions.join(','),
    })

    router.push(`/HandleViewTimetable`)
  }
  return (
    <div className="studyplan-container">
      <h2 className="studyplan-title">Your Study Plan</h2>
      <div className="studyplan-summary">
        <p><strong>Education:</strong> {formValues.education}</p>
        <p><strong>Degree Length:</strong> {formValues.degreeLength} years</p>
        <p><strong>RC:</strong> {formValues.rc}</p>
        <p><strong>Specialisations:</strong> {formValues.specialisations.join(', ') || 'None'}</p>
        <p><strong>Exemptions:</strong> {formValues.exemptions.join(', ') || 'None'}</p>
      </div>

      <div className="button-container">
        <button className="view-timetable-button" onClick={handleViewTimetable}>
          View Timetable
        </button>
      </div>
    </div>
  )
}