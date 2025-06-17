'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import './view-plans.css'
import Image from 'next/image'

export default function ViewPlans() {
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
        <h1>Oh no plans yet, generate table?</h1>
      </div>

        <div className="submit-container">
          <button className="submit-button" type="submit">
            Generate timetable!
          </button>
        </div>

    </div>
  )
}