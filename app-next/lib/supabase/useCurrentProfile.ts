'use client'
import { useState, useEffect } from 'react'
import { createClient } from './client'
import { profileRowToProfile } from './types'
import type { Profile } from './types'

export function useCurrentProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').select('*').eq('id', data.user.id).single()
        .then(({ data: row }) => {
          if (row) setProfile(profileRowToProfile(row))
        })
    })
  }, [])
  return profile
}
