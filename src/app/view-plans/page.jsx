'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import './view-plans.css'
import Image from 'next/image'

export default function ViewPlans() {
  const router = useRouter()

  return (
    <div className="view-container">
      <div className="header">
        <div className="logo-container">
          <Image
            src="/nusstlogo.png"
            alt="NUStudyTrack logo"
            width={250}
            height={150}
            className="logo"
          />
        </div>
        <h1><b>Oh no plans yet, generate table?</b></h1>
      </div>

      <div className="button-container">
        <button className="submit-button" onClick={() => router.push('/create-plan')}>
          Generate timetable!
        </button>
      </div>
    </div>
  )
}