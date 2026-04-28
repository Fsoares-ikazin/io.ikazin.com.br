'use client'
import { Building2, ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import { getLEARNHOUSE_DOMAIN_VAL } from '@services/config/config'
import { stripPort } from '@services/utils/ts/hostUtils'

function OrgNotFound() {
  const [orgSlug, setOrgSlug] = useState('')
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgSlug.trim()) return

    setIsNavigating(true)
    const domain = getLEARNHOUSE_DOMAIN_VAL()
    const baseDomain = stripPort(domain)
    const cleanSlug = orgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    const protocol = window.location.protocol + '//'
    const port = window.location.port
    const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : ''

    window.location.href = `${protocol}${cleanSlug}.${baseDomain}${portSuffix}/login`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ikz-bg text-ikz-text">
      <div className="max-w-md w-full mx-4 p-8 bg-ikz-surface rounded-2xl border border-ikz-border shadow-lg">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-ikz-cyan/10 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-ikz-cyan" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-ikz-cyan">
            Informe sua organização
          </h1>
          <p className="mt-3 text-sm text-ikz-text">
            Digite o nome da sua organização para continuar para a página de login.
          </p>
        </div>

        <form onSubmit={handleNavigate} className="mt-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-ikz-bg rounded-xl p-3 border border-ikz-border focus-within:border-ikz-cyan focus-within:ring-1 focus-within:ring-ikz-cyan">
              <input
                type="text"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="sua-organizacao"
                className="flex-1 bg-transparent outline-none text-ikz-text placeholder:text-ikz-text-muted"
                autoFocus
              />
              <span className="text-ikz-text-muted text-sm">.{stripPort(getLEARNHOUSE_DOMAIN_VAL())}</span>
            </div>

            <button
              type="submit"
              disabled={!orgSlug.trim() || isNavigating}
              className="w-full flex items-center justify-center gap-2 bg-ikz-cyan text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isNavigating ? (
                'Redirecionando...'
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-ikz-text-muted">
          Não sabe o nome da organização? Entre em contato com o administrador.
        </p>
      </div>
    </div>
  )
}

export default OrgNotFound
