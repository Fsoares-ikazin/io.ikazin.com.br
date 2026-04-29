'use client'
import React from 'react'
import Link from 'next/link'
import { getOrgLogoMediaDirectory, getOrgAuthBackgroundMediaDirectory } from '@services/media/media'
import { getUriWithOrg } from '@services/config/config'
import { cn } from '@/lib/utils'
import { usePlan } from '@components/Hooks/usePlan'

interface AuthBrandingPanelProps {
  org: any
  welcomeText?: string
}

export default function AuthBrandingPanel({ org, welcomeText }: AuthBrandingPanelProps) {
  const authBranding = org?.config?.config?.customization?.auth_branding || org?.config?.config?.general?.auth_branding || {}
  const {
    welcome_message = '',
    background_type = 'gradient',
    background_image = '',
    text_color = 'light'
  } = authBranding

  const plan = usePlan()
  const isEnterprise = plan === 'enterprise'

  const isIkazinOrg = org?.slug === 'default' || org?.slug === 'ikazin' || org?.label === 'IKAZIN.IO'
  const isDefaultOrg = isIkazinOrg || !org?.name || org.name === 'default' || org.name === 'Default'

  const getBackgroundStyle = (): React.CSSProperties => {
    if (isDefaultOrg || background_type === 'gradient' || !background_image) {
      return {
        background: 'linear-gradient(135deg, hsl(215 25% 6%) 0%, hsl(215 18% 11%) 60%, hsl(215 25% 8%) 100%)',
      }
    }
    if (background_type === 'custom' && background_image) {
      return {
        backgroundImage: `url(${getOrgAuthBackgroundMediaDirectory(org?.org_uuid, background_image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    if (background_type === 'unsplash' && background_image) {
      return {
        backgroundImage: `url(${background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return {
      background: 'linear-gradient(135deg, hsl(215 25% 6%) 0%, hsl(215 18% 11%) 60%, hsl(215 25% 8%) 100%)',
    }
  }

  const displayMessage = welcome_message || welcomeText || ''
  const hasCustomBackground = !isDefaultOrg && background_type !== 'gradient' && background_image
  const displayName = isIkazinOrg ? 'Ikazin.io' : (isDefaultOrg ? 'IKAZIN.IO' : org?.name)

  return (
    <div
      className="relative flex flex-col h-full w-full"
      style={getBackgroundStyle()}
    >
      {/* Radial glow — brand accent */}
      {isDefaultOrg && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, hsl(86 67% 64% / 0.08) 0%, hsl(184 50% 49% / 0.06) 40%, transparent 70%)',
          }}
        />
      )}

      {/* Overlay for custom backgrounds only */}
      {hasCustomBackground && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-10">
        {/* Top bar */}
        {isDefaultOrg ? (
          <div className="login-topbar">
            <Link prefetch href="/">
              <img
                src="/logo.png"
                alt="IKAZIN.IO"
                width={36}
                height={36}
                style={{ filter: 'drop-shadow(0 0 6px hsl(184 50% 49% / 0.5))' }}
              />
            </Link>
          </div>
        ) : !isEnterprise ? (
          <div className="login-topbar">
            <Link prefetch href="https://io.ikazin.com.br" target="_blank">
              <img
                src="/logo.png"
                alt="Ikazin.io"
                width={30}
                height={30}
                className={cn(
                  "transition-opacity hover:opacity-100",
                  text_color === 'light' ? "opacity-60 invert" : "opacity-40"
                )}
              />
            </Link>
          </div>
        ) : null}

        {/* Content - vertically and horizontally centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className={cn(
            "flex flex-col items-center text-center gap-6",
            text_color === 'light' ? "text-white" : "text-gray-900"
          )}>
            {/* Organization logo */}
            <Link prefetch href={isDefaultOrg ? '/' : getUriWithOrg(org?.slug, '/')}>
              {isDefaultOrg ? (
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{ background: 'hsl(215 18% 11%)', border: '1px solid hsl(184 50% 49% / 0.25)' }}
                >
                  <img
                    src="/logo.png"
                    alt="IKAZIN.IO"
                    width={72}
                    height={72}
                    style={{ filter: 'drop-shadow(0 0 8px hsl(184 50% 49% / 0.4))' }}
                  />
                </div>
              ) : org?.logo_image ? (
                <div className="w-24 h-24 rounded-2xl ring-1 ring-inset ring-white/10 bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={getOrgLogoMediaDirectory(org.org_uuid, org.logo_image)}
                    alt={org.name}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl ring-1 ring-inset ring-white/10 bg-white flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="IKAZIN.IO" width={72} height={72} className="object-contain" />
                </div>
              )}
            </Link>

            {/* Text content */}
            <div className="space-y-1">
              <h1
                className="font-black text-4xl tracking-tight"
                style={isDefaultOrg ? { background: 'linear-gradient(90deg, hsl(86 67% 64%), hsl(184 50% 49%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}
              >
                {displayName}
              </h1>
              {displayMessage && (
                <p className={cn(
                  "text-lg max-w-sm leading-relaxed",
                  text_color === 'light' ? "text-white/70" : "text-gray-600"
                )}>
                  {displayMessage}
                </p>
              )}
              {isDefaultOrg && (
                <p className="text-sm" style={{ color: 'hsl(213 27% 92% / 0.5)' }}>
                  Virtual Commissioning & Digital Twin
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-10" />
      </div>
    </div>
  )
}
