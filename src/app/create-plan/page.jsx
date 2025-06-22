'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import './create-plan.css'

export default function CreatePlan() {
  const router = useRouter()
  const [education, setEducation] = useState('')
  const [degreeLength, setDegreeLength] = useState('')
  const [rc, setRc] = useState('')

  const [exemptions, setExemptions] = useState({
    'MA1301 (eg. NP CAEM)': false,
    'ES1103': false,
    'ES1000': false,
  })

  const [specialisations, setSpecialisations] = useState({
    'adv-electronics': false,
    'industry4': false,
    'iot': false,
    'microelectronics': false,
    'robotics': false,
    'space-tech': false,
    'transportation': false,
    'data-eng': false,
  })

  const toggleSpecialisation = id => {
    setSpecialisations(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleExemption = id => {
    setExemptions(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert('You must be logged in')
      return
    }

    const selectedSpecialisations = Object.keys(specialisations).filter(key => specialisations[key])
    const selectedExemptions = Object.keys(exemptions).filter(key => exemptions[key])

    const { error: insertError } = await supabase.from('study_plans').insert([
      {
        user_id: user.id,
        education,
        degree_length: parseFloat(degreeLength),
        rc,
        exemptions: selectedExemptions,
        specialisations: selectedSpecialisations,
      }
    ])

    if (insertError) {
      alert('Failed to save: ' + insertError.message)
      return
    }

    router.push(`/study-plan?education=${encodeURIComponent(education)}&degreeLength=${degreeLength}&rc=${encodeURIComponent(rc)}&exemptions=${encodeURIComponent(selectedExemptions.join(','))}&specialisations=${encodeURIComponent(selectedSpecialisations.join(','))}`)
  }

  return (
    <div className="create-container">
      <div className="create-header">
        <img src="/nusstlogo.png" alt="Orbital Logo" />
        <div className="titles">
          <h1><b>Plan Smarter. Graduate Sooner.</b></h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="question">
          Which tertiary education did you complete?
        </div>
        <table>
          <tbody>
            <tr>
              {['JC / Others', 'Polytechnic'].map(item => (
                <td
                  key={item}
                  className={`selection ${education === item ? 'selection-active' : ''}`}
                  onClick={() => setEducation(item)}
                >
                  {item}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="question">
          How long do you wish to pursue your degree for?
        </div>
        <table>
          <tbody>
            <tr>
              {['3', '3.5', '4', '4.5', '5'].map(item => (
                <td
                  key={item}
                  className={`selection ${degreeLength === item ? 'selection-active' : ''}`}
                  onClick={() => setDegreeLength(item)}
                >
                  {item}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="question">
          Are you staying in any RCs?
        </div>
        <table>
          <tbody>
            <tr>
              {['NUSC', 'RVRC', 'RC4', 'Tembusu', 'Acacia College', 'None'].map(item => (
                <td
                  key={item}
                  className={`selection ${rc === item ? 'selection-active' : ''}`}
                  onClick={() => setRc(item)}
                >
                  {item}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="question">
          Are you exempted from any of these modules?
        </div>
        {Object.entries(exemptions).map(([id, checked]) => (
          <div key={id} className="checkbox-item">
            <input
              type="checkbox"
              id={id}
              checked={checked}
              onChange={() => toggleExemption(id)}
            />
            <label htmlFor={id}>{id}</label>
          </div>
        ))}

        <br />
        <hr />
        <div className="question">
          Which Specialisations / Minor would you like to complete?
        </div>

        {[
          { id: 'adv-electronics', label: 'Advanced Electronics' },
          { id: 'industry4', label: 'Industry 4.0' },
          { id: 'iot', label: 'Internet of Things' },
          { id: 'microelectronics', label: 'Microelectronics & Quantum Materials' },
          { id: 'robotics', label: 'Robotics' },
          { id: 'space-tech', label: 'Space Technology' },
          { id: 'transportation', label: 'Sustainable Electric Transportation' },
          { id: 'data-eng', label: 'Minor in Data Engineering' },
        ].map(({ id, label }) => (
          <div key={id} className="checkbox-item">
            <input
              type="checkbox"
              id={id}
              checked={specialisations[id]}
              onChange={() => toggleSpecialisation(id)}
            />
            <label htmlFor={id}>{label}</label>
          </div>
        ))}

        <div className="submit-container">
          <button className="submit-button" type="submit">
            Generate timetable!
          </button>
        </div>
      </form>
    </div>
  )
}
