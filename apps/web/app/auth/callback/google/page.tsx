'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useAuth, validateOAuthState } from '@components/Contexts/AuthContext'
import { getLEARNHOUSE_DOMAIN_VAL } from '@services/config/config'

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'csrf_error'>('loading')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')

      // Handle OAuth errors from Google
      if (errorParam) {
        setError(`Falha na autenticação com Google: ${errorParam}`)
        setStatus('error')
        return
      }

      if (!code) {
        setError('Nenhum código de autorização foi recebido do Google')
        setStatus('error')
        return
      }

      if (!state) {
        setError('Parâmetro state ausente. Possível problema de segurança')
        setStatus('csrf_error')
        return
      }

      // Check if we need to bounce to a custom domain origin.
      // When OAuth was initiated from a custom domain (e.g., learn.mozilla.org),
      // Google redirects to the main domain (dev.learnhouse.io). We detect this
      // via returnOrigin in the state and bounce the code+state to the custom domain
      // so CSRF validation and cookie-setting happen on the correct origin.
      try {
        const stateData = JSON.parse(atob(state))
        if (stateData.returnOrigin && stateData.returnOrigin !== window.location.origin) {
          const bounceUrl = new URL('/auth/callback/google', stateData.returnOrigin)
          // Forward all search params (code, state, scope, etc.)
          searchParams.forEach((value, key) => {
            bounceUrl.searchParams.set(key, value)
          })
          window.location.href = bounceUrl.toString()
          return
        }
      } catch {
        // State parsing failed, continue to CSRF validation which will handle the error
      }

      const stateValidation = validateOAuthState(state)
      if (!stateValidation.valid) {
        setError('Solicitação de autenticação inválida ou expirada. Tente novamente.')
        setStatus('csrf_error')
        return
      }

      const callbackUrl = stateValidation.callbackUrl

      // Get org_id from cookie if set
      let orgId: number | undefined
      try {
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=')
          if (name === 'learnhouse_oauth_org_id' && value) {
            orgId = parseInt(value, 10)
            if (isNaN(orgId)) {
              orgId = undefined
            }
            break
          }
        }
      } catch {
        // Ignore cookie parsing errors
      }

      try {
        // redirect_uri must always match what was sent during authorization (main domain)
        const domain = getLEARNHOUSE_DOMAIN_VAL()
        const oauthRedirectUri = `${window.location.protocol}//${domain}/auth/callback/google`

        // Exchange code for tokens with our backend
        // First, we need to get Google's access token
        const tokenResponse = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirect_uri: oauthRedirectUri,
          }),
        })

        if (!tokenResponse.ok) {
          // If no token endpoint, exchange directly via Next.js API route
          // This ensures cookies are set by Next.js for reliable SSR access
          const oauthCallbackUrl = new URL('/api/auth/oauth/google/callback', window.location.origin)
          oauthCallbackUrl.searchParams.set('code', code)
          oauthCallbackUrl.searchParams.set('redirect_uri', oauthRedirectUri)
          if (orgId) {
            oauthCallbackUrl.searchParams.set('org_id', orgId.toString())
          }

          const backendResponse = await fetch(oauthCallbackUrl.toString(), {
            method: 'GET',
            credentials: 'include',
          })

          if (!backendResponse.ok) {
            const errorData = await backendResponse.json().catch(() => ({}))
            throw new Error(errorData.detail || 'Falha na autenticação com Google')
          }

          const data = await backendResponse.json()

          // Validate response structure
          if (!data.tokens?.access_token) {
            throw new Error('Resposta inválida do servidor')
          }

          // Sign in with the tokens from backend
          const result = await signIn('credentials', {
            redirect: false,
            sso: 'true',
            sso_access_token: data.tokens.access_token,
            sso_refresh_token: data.tokens.refresh_token,
            sso_user: JSON.stringify(data.user),
            sso_expiry: data.tokens.expiry,
            callbackUrl,
          })

          if (result && !result.ok) {
            throw new Error(result.error || 'Falha ao concluir o login')
          }

          setStatus('success')
          router.push(callbackUrl)
          return
        }

        const tokenData = await tokenResponse.json()

        // Validate token response
        if (!tokenData.access_token) {
          throw new Error('Resposta de token inválida do Google')
        }

        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          }
        )

        if (!userInfoResponse.ok) {
          throw new Error('Falha ao obter informações do usuário no Google')
        }

        const userInfo = await userInfoResponse.json()

        // Validate user info
        if (!userInfo.email) {
          throw new Error('Não foi possível recuperar o e-mail do Google')
        }

        // Call Next.js API route to ensure cookies are set properly
        const oauthUrl = orgId
          ? `/api/auth/oauth?org_id=${orgId}`
          : '/api/auth/oauth'

        const oauthResponse = await fetch(oauthUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userInfo.email,
            provider: 'google',
            access_token: tokenData.access_token,
          }),
          credentials: 'include',
        })

        if (!oauthResponse.ok) {
          const errorData = await oauthResponse.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Falha na autenticação')
        }

        const data = await oauthResponse.json()

        // Validate response structure
        if (!data.tokens?.access_token) {
          throw new Error('Resposta inválida do servidor')
        }

        // Sign in with the obtained tokens
        const result = await signIn('credentials', {
          redirect: false,
          sso: 'true',
          sso_access_token: data.tokens.access_token,
          sso_refresh_token: data.tokens.refresh_token,
          sso_user: JSON.stringify(data.user),
          sso_expiry: data.tokens.expiry,
          callbackUrl,
        })

        if (result && !result.ok) {
          throw new Error(result.error || 'Falha ao concluir o login')
        }

        setStatus('success')
        router.push(callbackUrl)
      } catch (err: any) {
        console.error('Google OAuth callback error:', err)
        setError(err.message || 'Falha na autenticação')
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, router, signIn])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ikz-bg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Concluindo login...
          </h1>
          <p className="text-gray-400">Aguarde enquanto autenticamos você.</p>
        </div>
      </div>
    )
  }

  if (status === 'csrf_error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ikz-bg">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full border border-amber-800/60 bg-amber-950/35 p-3">
              <ShieldAlert className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Falha na verificação de segurança
          </h1>
          <p className="text-gray-400 mb-2">{error}</p>
          <p className="text-gray-400 text-sm mb-6">
            Isso pode acontecer se a sessão de login expirou ou se você acessou um link antigo.
            Inicie o login novamente.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-2 px-4 bg-ikz-cyan text-white rounded-md hover:opacity-90 transition-colors"
            >
              Ir para o login
            </Link>
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-ikz-border bg-ikz-surface text-gray-200 rounded-md hover:border-ikz-cyan/50 transition-colors"
            >
              Ir para o início
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ikz-bg">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 border border-red-900/60 bg-red-950/35 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Falha na autenticação
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-2 px-4 bg-ikz-cyan text-white rounded-md hover:opacity-90 transition-colors"
            >
              Tentar novamente
            </Link>
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-ikz-border bg-ikz-surface text-gray-200 rounded-md hover:border-ikz-cyan/50 transition-colors"
            >
              Ir para o início
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state - redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-ikz-bg">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="w-12 h-12 text-ikz-lime animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">
          Login concluído
        </h1>
        <p className="text-gray-400">Redirecionando você agora...</p>
      </div>
    </div>
  )
}
