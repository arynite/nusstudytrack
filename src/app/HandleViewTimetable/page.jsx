'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { flattenModules } from '../../utils/flattenmodules'
import { generateTimetable } from '../../utils/generateTimetable'
import { specialisationModules, RCOrNoRC } from '../../utils/requirements'
import { supabase } from '../../utils/supabaseClient'
import './HandleViewTimetable.css'

import { getExemptedModules } from '../../utils/generateTimetable'

export default function TimetablePage() {
  const router = useRouter()
  const [plannedSemesters, setPlannedSemesters] = useState([])
  const [mounted, setMounted] = useState(false)
  const [rcMods, setRcMods] = useState(new Set()) 

  const [formValues, setFormValues] = useState({
    education: '',
    degreeLength: '',
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

      //console.log('Exemptions:', exemptions)

      const fv = { education, degreeLength, rc, specialisations, exemptions }
      setFormValues(fv)

      const rc_ge_Modules = await RCOrNoRC(user.id, rc)
      setRcMods(rc_ge_Modules)
      //console.log('RC/GE Modules:', Array.from(rc_ge_Modules))

      const completedModules = await getExemptedModules(user.id)
      console.log('Completed bridging modules:', Array.from(completedModules))

      let timetable;

      const flattened = flattenModules(specialisations, specialisationModules, exemptions, rc_ge_Modules) 
      const Actiul_Total = flattened.length + rc_ge_Modules.size - completedModules.size


      if (degreeLength === 3 && 32 <= Actiul_Total <= 36){ // handles generateTimetable function from generateTimetable.ts
        timetable = await generateTimetable(flattened, degreeLength * 2, 6, user.id, rc_ge_Modules) 
      } else if (degreeLength === 3 && Actiul_Total <= 31) {
        timetable = await generateTimetable(flattened, degreeLength * 2, 5, user.id, rc_ge_Modules) 
      }
      
      
      else if (degreeLength === 3.5 && Actiul_Total <= 40) {
        timetable = await generateTimetable(flattened, degreeLength * 2, 6, user.id, rc_ge_Modules) 
      } else if (degreeLength === 4 && Actiul_Total <= 40) {
        timetable = await generateTimetable(flattened, degreeLength * 2, 5, user.id, rc_ge_Modules) 
      } else if (degreeLength === 4.5 && Actiul_Total <= 40) {
        timetable = await generateTimetable(flattened, degreeLength * 2, 4, user.id, rc_ge_Modules) 
      } else if (degreeLength === 5 && Actiul_Total <= 40) {
        timetable = await generateTimetable(flattened, degreeLength * 2, 4, user.id, rc_ge_Modules) 
      }
      else{
        timetable = await generateTimetable(flattened, degreeLength * 2, Actiul_Total/(degreeLength * 2), user.id, rc_ge_Modules) // original method
        console.log("its here")
      }
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
  const nonEmptySemesters = plannedSemesters.filter(sem => sem.length > 0)

  return (
    <div className="studyplan-container">
      <h2 className="studyplan-title">Suggested Semester Plan</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
      {nonEmptySemesters.map((semester, idx) => {
          const year = Math.floor(idx / 2) + 1
          const sem = (idx % 2) + 1
          return (
            <div key={idx} className="semester-card border p-4 rounded shadow">
              <h4 className="font-semibold mb-2">Year {year} Sem {sem}</h4>
              <ul className="list-disc pl-5 text-sm">
                {semester.map((mod, modIdx) => (
                  <li key={`${mod}-${modIdx}`}>{mod}</li>
                ))}
              </ul>
            </div>
          )
        })}
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

