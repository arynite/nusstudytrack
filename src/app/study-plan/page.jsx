'use client'

//export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabaseClient'

import './study-plan.css'
import '../create-plan/create-plan.css' // ensures css is consistent
import '../view-plans/view-plans.css' // ensures css is consistent

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
  //const [loading, setLoading] = useState(false)

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

      console.log('Fetched data from study_plan table:', data)

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
        
        await supabase
        .from('study_plans')
        .upsert(
        [{
        user_id: user.id,
        education: data.education,
        degree_length: data.degree_length,
        rc: data.rc,
        specialisations: data.specialisations,
        exemptions: data.exemptions,
      }],
      { onConflict: ['user_id'] }
    )}

      setMounted(true)
    }

    fetchUserData()
  }, [router])

  const GoBack = () => {
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
        <button className="Go-Back-button" onClick={GoBack}>
          Go Back
        </button>
        <button className="view-timetable-button" onClick={HandleViewTimetableF}>
          View Timetable
        </button>
      </div>
    </div>
  )
}