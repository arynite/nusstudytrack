'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import html2canvas from 'html2canvas'
import './view-plans.css'

export default function ViewPlans() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [timetable, setTimetable] = useState(null)
  const captureRef = useRef(null) 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

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

      if (error && error.code !== 'PGRST116') {
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
    <>
    <title>View Plans - NUStudyTrack</title>
      <div id="img-container" ref={captureRef}>
        <div className="view-container">
          <div className="header-container">
            <div className="create-header2">
              <img src="/OrbitalLogo.jpg" alt="Orbital Logo 2" />
            </div>
            <div className="create-header">
              <img src="/nusstlogo.png" alt="NUS ST Logo" />
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
                        <h4 className="font-semibold mb-2">
                          Year {year} Sem {sem}
                        </h4>
                        <ul className="list-disc pl-5 text-sm">
                          {semester.map((mod, modIdx) => (
                            <li key={`${mod}-${modIdx}`}>{mod}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="no-timetable-msg-container">
                <h1 className="no-timetable-yet-msg">Oh no plans yet, generate table?</h1>
                <div className="button-container">
                  <button
                    className="generate-timetable-button screenshot-button"
                    onClick={() => router.push('/create-plan')}
                  >
                    Generate timetable!
                  </button>

                  <button
                    className="go-back-button screenshot-button"
                    onClick={() => router.push('/')}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {timetable && (
        <div className="button-container mt-4">
          <button
            className="generate-timetable-button screenshot-button"
            onClick={() => router.push('/study-plan')}
          >
            Generate Timetable Again
          </button>

          <button
            className="generate-timetable-button screenshot-button"
            onClick={async () => {
              if (!captureRef.current) return

              // temp hide buttons and show date exported
              const buttons = document.querySelectorAll('.screenshot-button')
              buttons.forEach(btn => btn.classList.add('screenshot-ignore'))

              const date = new Date()
              const dateString = date.toLocaleDateString('en-SG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })

              const dateDiv = document.createElement('div')
              dateDiv.textContent = `Exported on ${dateString}`
              dateDiv.style.color = 'grey'
              dateDiv.style.fontSize = '12px'
              dateDiv.style.textAlign = 'center'
              dateDiv.style.marginTop = '16px'

              const spacerDiv = document.createElement('div')
              spacerDiv.style.height = '20px'

              // append dateDiv and space just for screenshot
              captureRef.current.appendChild(dateDiv)
              captureRef.current.appendChild(spacerDiv)

              const canvas = await html2canvas(captureRef.current)
              const link = document.createElement('a')
              link.download = 'nus_study_plan.png'
              link.href = canvas.toDataURL()
              link.click()

              // restore buttons and remove date
              dateDiv.remove()
              spacerDiv.remove()
              buttons.forEach(btn => btn.classList.remove('screenshot-ignore'))
            }}
          >
            Export as Image
          </button>
        </div>
      )}
    </>
  )
}
