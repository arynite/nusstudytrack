'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/utils/supabaseClient'
import './auth.css'

const isValidNusEmail = (email) => /^[\w.+-]+@u\.nus\.edu$/.test(email)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const checkAndSignUp = async () => {
    if (!isValidNusEmail(email)) {
      setMessage('Please use a valid NUS email, eg. e1234567@u.nus.edu')
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (!signInError) {
      setMessage('Email already registered. Redirecting to home...')
      router.push('/')
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setMessage(signUpError.message)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
  }

  const signIn = async () => {
    if (!isValidNusEmail(email)) {
      setMessage('Please use a valid NUS email, ending with @u.nus.edu')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Logged in successfully!')
      router.push('/')
    }
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <h2 className="login-heading">Welcome to NUStudyTrack</h2>

        <input
          type="email"
          placeholder="NUS Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="login-buttons">
          <button className="login-button" onClick={signIn}>Sign in</button>
          <button className="login-button" onClick={checkAndSignUp}>Register</button>
        </div>

        {message && <p className="login-message">{message}</p>}
      </div>

      <div className="login-right">
        <Image
          src="/nusstlogo.png"
          alt="NUStudyTrack logo"
          width={400}
          height={300}
          className="login-logo"
        />
        <div className="login-tagline">
          <div>Plan Smarter.</div>
          <strong>Graduate Sooner.</strong>
        </div>
      </div>
    </div>
  )
}
