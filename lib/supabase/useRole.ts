'use client'

import { useState, useEffect } from 'react'
import { createClient } from './client'
import type { ProfilePermission } from './types'

export function useRole(): ProfilePermission | null {
  const [role, setRole] = useState<ProfilePermission | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('permission')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.permission) setRole(profile.permission as ProfilePermission)
        })
    })
  }, [])

  return role
}
