'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import Image from 'next/image'
import './view-plans.css'

export default function ViewPlans() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [timetable, setTimetable] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Get logged-in user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('You must be logged in')
        router.push('/login')
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from('study_plans')
        .select('timetable')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found" in supabase-js
        console.error('Error fetching study plan:', error)
      }

      if (data && data.timetable && data.timetable.length > 0) {
        const nonEmpty = data.timetable.filter((sem) => sem.length > 0)
        setTimetable(nonEmpty)
      } else {
        setTimetable(null)
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="view-container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="view-container">
      
    <div className="header-container">
      <div className="create-header2">
        <img src="/OrbitalLogo.jpg" alt="Orbital Logo 2" />
        </div>
        <div className="create-header">
          <img src="/nusstlogo.png" alt="Orbital Logo" />
        </div>
      </div>

      <div className="content-container">
        {timetable ? (
          <>
            <h1 className="view-timetable-title">Your Saved Timetable</h1>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {timetable.map((semester, idx) => {
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
            <div className='button-container'>
              <button
                className='generate-timetable-button'
                onClick={() => router.push('/study-plan')}
              >
                Generate Timetable Again
              </button>
            </div>
          </>
        ) : (
          <>
          <div className='no-timetable-msg-container'>
            <h1 className='no-timetable-yet-msg'>
              Oh no plans yet, generate table?
            </h1>
            <div className="button-container">
              <button
                className="generate-timetable-button"
                onClick={() => router.push('/create-plan')}
              >
                Generate timetable!
              </button>

              <button className ='go-back-button'
              onClick = {() => router.push('/')}
              >Go Back
              </button>
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
