'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabaseClient'
import './view-plans.css'
import Image from 'next/image'

export default function ViewPlans() {
  const router = useRouter()

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
          <button className="generate-timetable-button" onClick={() => router.push('/create-plan')}>
            Generate timetable!
          </button>
        </div>
      </div>
    </div>
  )
}