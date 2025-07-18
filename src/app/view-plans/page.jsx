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
  const [plans, setPlans] = useState([])
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0)

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
        .select('id, timetable, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching study plans:', error)
        setPlans([])
      } else {
        const nonEmptyPlans = data
          .filter((plan) => plan.timetable && plan.timetable.some((sem) => sem.length > 0))
        setPlans(nonEmptyPlans)
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  const selectedPlan = plans[selectedPlanIndex] || null

  if (loading) {
    return (
      <div className="view-container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="view-container">
      <div
        className="logo-container cursor-pointer"
        onClick={() => router.push('/')}
      >
        <Image
          src="/nusstlogo.png"
          alt="NUStudyTrack logo"
          width={250}
          height={150}
          className="logo"
        />
      </div>

      <div className="content-container">
        {plans.length > 0 ? (
          <>
            <h1 className="timetable-title">Your Saved Timetables</h1>

            <div className="mb-4">
              <label className="font-semibold mr-2">Select a plan:</label>
              <select
                value={selectedPlanIndex}
                onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                className="border p-1 rounded"
              >
                {plans.map((plan, idx) => (
                  <option key={plan.id} value={idx}>
                    Plan {idx + 1} 
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {selectedPlan.timetable.map((semester, idx) => {
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

            <div className="button-container mt-4">
              <button
                className="generate-timetable-button"
                onClick={() => router.push('/study-plan')}
              >
                Regenerate Timetable
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="no-timetable-yet-msg">
              Oh no plans yet, generate table?
            </h1>
            <div className="button-container">
              <button
                className="generate-timetable-button"
                onClick={() => router.push('/create-plan')}
              >
                Generate timetable!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
