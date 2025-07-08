'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { flattenModules } from '../../utils/flattenmodules'
import { generateTimetable } from '../../utils/generateTimetable'
import { specialisationModules } from '../../utils/requirements'
import { supabase } from '../../utils/supabaseClient'
import './HandleViewTimetable.css'

export default function TimetablePage() {
  const router = useRouter()
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
    const fetchData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('You must be logged in to view your timetable.')
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch study plan:', error)
        return
      }

      const {
        education,
        degree_length: degreeLength,
        rc,
        specialisations = [],
        exemptions = [],
      } = data

      const fv = { education, degreeLength, rc, specialisations, exemptions }
      setFormValues(fv)

      const flattened = flattenModules(specialisations, specialisationModules, exemptions)
      const timetable = await generateTimetable(flattened, degreeLength * 2)
      setPlannedSemesters(timetable)
      setMounted(true)
    }

    fetchData()
  }, [])
  
  
  const SaveTimetable = async () => {
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
      .update({ timetable: plannedSemesters })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error saving timetable:', error)
      alert('Failed to save timetable.')
    } else {
      alert('Timetable saved successfully!')
      router.push('/view-plans')
    }
  }


  if (!mounted) return <p>Loading...</p>

  return (
    <div className="studyplan-container">
      <h2 className="studyplan-title">Suggested Semester Plan</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {plannedSemesters.map((semester, idx) => (
          <div key={idx} className="semester-card border p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Semester {idx + 1}</h4>
            <ul className="list-disc pl-5 text-sm">
              {semester.map((mod, modIdx) => (
                <li key={`${mod}-${modIdx}`}>{mod}</li>
              ))}
            </ul>

          </div>
        ))}
      </div>

      <div className="content-container">
        <div className="button-container">
          <button className="Reshuffle-button" onClick={() => router.push('/study-plan')}>
            Reshuffle
          </button> 
          <button className="SaveTimetable-button" onClick={SaveTimetable}>
            Save
          </button>
        </div>
      </div>

    </div>
  )
}

 // add function for the button to save timetable 

