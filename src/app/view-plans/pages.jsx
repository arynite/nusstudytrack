'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import './view-plans.css'

export default function ViewPlans() {
  return (
    <div className="view-container">
      <div className="header">
        <img src="/nusstlogo.png" alt="Orbital Logo" />
        <h1>Oh no plans yet, generate table?</h1>
      </div>
      
      <div className="content">
        <p>This is the view plans page.</p>
      </div>
    </div>
  )
}