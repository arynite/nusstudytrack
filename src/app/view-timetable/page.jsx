'use client'

import { useEffect, useState } from 'react'
import { eeMajorRequirements, specialisationModules } from '@/utils/requirements'
import { flattenModules } from '@/utils/flattenmodules'
import { generateTimetable } from '@/utils/generateTimetable'


export default function ViewTimetable() {
  const [timetable, setTimetable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadTimetable() {
      setLoading(true)
      try {
        // Example: flatten modules from EE major and 'robotics' specialisation
        const allModules = flattenModules(
          eeMajorRequirements,
          ['robotics'], 
          specialisationModules
        )
        const result = await generateTimetable(allModules)
        setTimetable(result)
      } catch (e) {
        setError(e.message || 'Failed to generate timetable')
      }
      setLoading(false)
    }

    loadTimetable()
  }, [])

  if (loading) return <p>Loading timetable...</p>
  if (error) return <p>Error: {error}</p>
  if (!timetable) return <p>No timetable generated.</p>

  return (  
    <div>
      <h1>Your Timetable</h1>
      {timetable.map((semesterModules, idx) => (
        <div key={idx} style={{ marginBottom: '1rem' }}>
          <h2>Semester {idx + 1}</h2>
          {semesterModules.length > 0 ? (
            <ul>
              {semesterModules.map((mod) => (
                <li key={mod}>{mod}</li>
              ))}
            </ul>
          ) : (
            <p>No modules scheduled this semester.</p>
          )}
        </div>
      ))}
    </div>
  )
}
