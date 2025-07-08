'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import Image from 'next/image'
import './view-plans.css'

export default function ViewPlans() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timetable, setTimetable] = useState(null)

  useEffect(() => {
    const fetchUserTimetable = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('You must be logged in')
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('study_plans')
        .select('timetable')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching study plan:', error)
      } else if (data && data.timetable) {
        setTimetable(data.timetable)
      } else {
        setTimetable(null)
      }

      setLoading(false)
    }

    fetchUserTimetable()
  }, [router])

  if (loading) {
    return <div className="view-container"><p>Loading...</p></div>
  }

  if (!timetable || timetable.length === 0) {
    return (
      <div className="view-container">
        <div className="logo-container">
          <Image
            src="/nusstlogo.png"
            alt="NUStudyTrack logo"
            width={250}
            height={150}
            className="logo"
          />
        </div>

        <div className="content-container">
          <h1 className="no-timetable-yet-msg">Oh no plans yet, generate table?</h1>
          <div className="button-container">
            <button
              className="generate-timetable-button"
              onClick={() => router.push('/create-plan')}
            >
              Generate timetable!
            </button>
          </div>
        </div>
      </div>
    )
  }

  return ( // Shows timetable if it exists
    <div className="view-container">
      <div className="logo-container">
        <Image
          src="/nusstlogo.png"
          alt="NUStudyTrack logo"
          width={250}
          height={150}
          className="logo"
        />
      </div>

      <div className="content-container">
        <h1 className="timetable-title">Your Saved Semester Plan</h1>
        <div className="semester-plan">
          {timetable.map((semesterModules, index) => (
            <div className="semester-box" key={index}>
              <h3>Semester {index + 1}</h3>
              <ul>
                {semesterModules.map((mod, i) => (
                  <li key={i}>{mod}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}