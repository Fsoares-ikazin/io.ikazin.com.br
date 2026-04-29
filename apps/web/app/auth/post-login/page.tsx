'use client'

import PageLoading from '@components/Objects/Loaders/PageLoading'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useEffect } from 'react'

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function roleBelongsToCurrentOrg(role: any, orgslug: string | null): boolean {
  if (!orgslug) return true

  const roleOrg = role?.org || role?.organization
  const possibleSlugs = [
    roleOrg?.slug,
    roleOrg?.org_slug,
    roleOrg?.orgslug,
    role?.org_slug,
    role?.orgslug,
  ].filter(Boolean)

  return possibleSlugs.includes(orgslug)
}

function roleHasDashboardAccess(role: any): boolean {
  const rights = role?.role?.rights || role?.rights
  return rights?.dashboard?.action_access === true
}

function shouldGoToDashboard(sessionData: any, orgslug: string | null): boolean {
  if (sessionData?.user?.is_superadmin === true) return true

  const roles = sessionData?.roles
  if (!Array.isArray(roles)) return false

  return roles.some((role: any) => (
    roleBelongsToCurrentOrg(role, orgslug) && roleHasDashboardAccess(role)
  ))
}

export default function PostLoginPage() {
  const session = useLHSession() as any

  useEffect(() => {
    if (session.status === 'loading') return

    if (session.status !== 'authenticated') {
      window.location.replace('/login')
      return
    }

    const orgslug = getCookieValue('learnhouse_current_orgslug') || getCookieValue('learnhouse_orgslug')
    const target = shouldGoToDashboard(session.data, orgslug) ? '/dash' : '/'
    window.location.replace(target)
  }, [session.status, session.data])

  return (
    <div className="min-h-screen bg-ikz-bg flex items-center justify-center">
      <PageLoading />
    </div>
  )
}
