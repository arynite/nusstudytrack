'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import './create-plan.css'
import '../create-plan/create-plan.css' // ensures css is consistent
import '../view-plans/view-plans.css' // ensures css is consistent
import { flattenModules } from '../../utils/flattenmodules'
import { eeMajorRequirements, specialisationModules, RCOrNoRC} from '../../utils/requirements'

export default function CreatePlan() {
  const router = useRouter()
  const [education, setEducation] = useState('')
  const [degreeLength, setDegreeLength] = useState('')
  const [rc, setRc] = useState('')

const [generatedModules, setGeneratedModules] = useState([])
const [exemptions, setExemptions] = useState({
    'PC1201': false,
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

    let y;
    const numExemptions = selectedExemptions.length;
    if (numExemptions === 1) {
      y = 3;
    } else if (numExemptions === 2) {
      y = 2;
    } else if (numExemptions >= 1) {
      y = 1;
    } else {
      y = 0;
    }

    let x;
    const numSPN = selectedSpecialisations.length;

    if (education === 'JC / Others' && numSPN === 0) {
      x = 10;
    } else if (numSPN === 1) {
      x = 5;
    } else if (numSPN >= 2) {
      x = 0;
    }

    if (education === 'Polytechnic' && numSPN === 0) {
      x = 5;
    } else if (numSPN === 1) {
      x = 0;
    }
    
    const rcMods = await RCOrNoRC(user.id, rc);
    const z = x + y
    
    const requiredModules = flattenModules(
      selectedSpecialisations,
      specialisationModules,
      selectedExemptions,
      z,
      rcMods
    )
    
    setGeneratedModules(requiredModules)
    
    console.log("Mods to clear:", requiredModules)
    console.log("z:", z)


    const { error: upsertError } = await supabase.from('study_plans').upsert([
      {
        user_id: user.id,
        education,
        degree_length: parseFloat(degreeLength),
        rc,
        exemptions: selectedExemptions,
        specialisations: selectedSpecialisations,
      }],
      { onConflict: ['user_id'] }
    )
    if (upsertError) {
      alert('Upsert Error: ' + upsertError.message)
      return
    }

    router.push(`/study-plan?education=${encodeURIComponent(education)}&degreeLength=${degreeLength}&rc=${encodeURIComponent(rc)}&exemptions=${encodeURIComponent(selectedExemptions.join(','))}&specialisations=${encodeURIComponent(selectedSpecialisations.join(','))}&x=${x}`)
  }

  return (
    <>
    <title>Create Plan - NUStudyTrack</title>
  <div className="create-container">
    <div className="header-container">
      <div className="create-header2">
        <img src="/OrbitalLogo.jpg" alt="Orbital Logo 2" />
        </div>
        <div className="create-header">
          <img src="/nusstlogo.png" alt="Orbital Logo" />
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
              {['NUSC', 'CAPT', 'RC4', 'Tembusu', 'Acacia','RVRC', 'None'].map(item => (
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

        <div className="submit-container">
          <button className="submit-button" type="submit">
            Generate timetable!
          </button>
        </div>
      </form>
    </div>
    </>
  )
}
