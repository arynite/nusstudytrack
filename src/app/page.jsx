'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabaseClient'
import './home.css'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  
    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    }) || {}
  
    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [])
  
  
  const goToViewPlans = () => router.push('/view-plans')
  const goToCreatePlan = () => router.push('/create-plan')
  const goToAuth = () => router.push('/auth')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/auth')
  }

  if (!user) {
    return (
      <div className="home-container">
        <div className="home-card">
          <h1 className="home-title">Welcome to NUStudyTrack</h1>
          <p className="home-message">Please log in to create/access your study plans.</p>
          <button className="home-button" onClick={goToAuth}>
            Sign Up/Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    <title>Home - NUStudyTrack</title>
    <div className="home-container">
      <button className="home-button logout-button" onClick={handleLogout}>
        Logout
      </button>
      <div className="logo-card rounded-[100px] pr-[30px]">
        <img src="/nusstlogo.png" alt="NUStudyTrack Logo" className="w-80 mx-auto" />
        <div className="home-card">
          <h1 className="home-title">Welcome, {user.email}!</h1>
          <p className="home-message">What would you like to do today?</p>
          <div className="home-buttons">
            <button className="home-button" onClick={goToViewPlans}>
              View Existing Study Plans
            </button>
            <br></br>
            <button className="home-button" onClick={goToCreatePlan}>
              Create New Study Plan
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
