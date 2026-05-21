'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { User, Lock, ShoppingBag, Settings } from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import UserAvatar from '@components/Objects/UserAvatar'
import { getUriWithOrg } from '@services/config/config'
import { extractIkazinAccountSummary, getTierLabel, getTierTone } from '@components/Objects/Account/accountIkazin'

interface AccountSidebarProps {
  orgslug: string
  currentSubpage: string
}

const NAV_ITEMS = [
  { id: 'general', icon: Settings, labelKey: 'account.general' },
  { id: 'profile', icon: User, labelKey: 'account.profile' },
  { id: 'security', icon: Lock, labelKey: 'account.security' },
  { id: 'purchases', icon: ShoppingBag, labelKey: 'account.purchases' },
]

export function AccountSidebar({ orgslug, currentSubpage }: AccountSidebarProps) {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const user = session?.data?.user
  const ikazinSummary = extractIkazinAccountSummary(user)

  return (
    <div className="space-y-4">
      {/* User Info Card */}
      <div className="bg-ikz-surface shadow-lg shadow-black/30 rounded-lg overflow-hidden">
        {/* User Profile Header */}
        <div className="p-4 border-b border-ikz-border">
          <div className="flex flex-col items-center text-center">
            <UserAvatar
              border="border-4"
              rounded="rounded-full"
              width={80}
            />
            <div className="mt-3">
              <h2 className="font-semibold text-gray-100">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* User Bio (truncated) */}
        {user?.bio && (
          <div className="px-4 py-3 border-b border-ikz-border">
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
              {user.bio}
            </p>
          </div>
        )}

        <div className="px-4 py-3 border-b border-ikz-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Ikazin
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-200">
                {getTierLabel(ikazinSummary.currentPlan)}
              </p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getTierTone(ikazinSummary.maxTierEver)}`}>
              Pico: {getTierLabel(ikazinSummary.maxTierEver)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-2">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentSubpage === item.id
              return (
                <Link
                  key={item.id}
                  href={getUriWithOrg(orgslug, `/account/${item.id}`)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-ikz-surface'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default AccountSidebar
