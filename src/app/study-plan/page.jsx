'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import './study-plan.css'
import { supabase } from '../../utils/supabaseClient'

export default function StudyPlan() {
  const router = useRouter()
  const [formValues, setFormValues] = useState({
    education: '',
    degreeLength: '',
    rc: '',
    specialisations: [],
    exemptions: [],
  })
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
          specialisations: Array.isArray(data.specialisations) ? data.specialisations : [],
          exemptions: Array.isArray(data.exemptions) ? data.exemptions : [],
        })
      }

      setMounted(true)
    }

    fetchUserData()
  }, [router])

  const saveStudyPlan = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('You must be logged in')
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('study_plans')
        .upsert(
          [{
            user_id: user.id,
            education: formValues.education,
            degree_length: formValues.degreeLength,
            rc: formValues.rc,
            specialisations: formValues.specialisations,
            exemptions: formValues.exemptions,
          }],
          { onConflict: ['user_id'] }
        )

      if (error) {
        console.error('Error saving study plan:', error)
        alert('Error saving study plan. Please try again.')
      } else {
        alert('Study plan saved successfully!')
      }
    } finally {
      setLoading(false)
    }

    router.push('/create-plan')
  }

  const HandleViewTimetableF = () => {
    const queryParams = new URLSearchParams({
      education: formValues.education,
      degreeLength: formValues.degreeLength.toString(),
      rc: formValues.rc,
      specialisations: formValues.specialisations.join(','),
      exemptions: formValues.exemptions.join(','),
    })

    router.push(`/HandleViewTimetable?${queryParams.toString()}`)
  }

  if (!mounted) return null

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
        <button className="Go-Back-button" onClick={saveStudyPlan}>
          Go Back
        </button>
        <button className="view-timetable-button" onClick={HandleViewTimetableF}>
          View Timetable
        </button>
      </div>
    </div>
  )
}