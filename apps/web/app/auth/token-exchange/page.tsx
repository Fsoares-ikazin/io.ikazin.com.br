'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'Nenhum código de acesso foi informado.',
  code_expired: 'Este link de acesso expirou ou já foi usado. Volte ao painel e clique em "Visitar site" novamente.',
  platform_unreachable: 'Não foi possível acessar a plataforma principal. Tente novamente em instantes.',
  platform_bad_response: 'A plataforma retornou uma resposta inesperada. Tente novamente.',
  no_tokens: 'O link de acesso não continha credenciais.',
  no_refresh_token: 'O link de acesso não contém um token de atualização. Volte ao painel e clique em "Visitar site" novamente.',
  no_access_token: 'Não foi possível obter um token de sessão válido.',
  session_invalid: 'Sua conta não foi reconhecida nesta organização. Entre diretamente.',
  user_not_in_tenant: 'Sua conta não é membro desta organização. Entre diretamente.',
  backend_unreachable: 'Não foi possível acessar o backend. Tente novamente.',
  bad_origin: 'Esta solicitação foi rejeitada pelo servidor.',
  bad_content_type: 'Esta solicitação foi rejeitada pelo servidor.',
  unexpected: 'Algo inesperado aconteceu. Tente novamente.',
}

// Only allow same-origin relative paths. Rejects `//evil.com`, `https://evil.com`,
// and backslash tricks — prevents the `?redirect=` param from becoming an open
// redirect after a successful exchange.
function sanitizeRedirect(raw: string | null): string {
  const fallback = '/dash'
  if (!raw) return fallback
  if (!raw.startsWith('/')) return fallback
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  if (/[\r\n]/.test(raw)) return fallback
  return raw
}

function TokenExchangeInner() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleExchange = async () => {
      const code = searchParams.get('code')
      const redirect = sanitizeRedirect(searchParams.get('redirect'))

      if (!code) {
        setError('Código de autenticação ausente')
        return
      }

      try {
        // Call our own API which server-side exchanges the code for tokens
        const res = await fetch('/api/auth/token-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
          credentials: 'include',
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          const errCode = body?.code as string | undefined
          setError(
            (errCode && ERROR_MESSAGES[errCode]) ||
              body?.error ||
              'Falha na autenticação. Tente entrar novamente.'
          )
          return
        }

        // Full page reload so AuthContext initializes fresh with the new cookies
        window.location.href = redirect
      } catch {
        setError('Algo deu errado. Tente novamente.')
      }
    }

    handleExchange()
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ikz-bg">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 border border-red-900/60 bg-red-950/35 rounded-full">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Falha na autenticação</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 bg-ikz-cyan text-white rounded-lg hover:opacity-90 transition-colors text-sm font-semibold"
          >
            Ir para o login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ikz-bg">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
        </div>
        <h1 className="text-lg font-semibold text-white mb-1">Entrando...</h1>
        <p className="text-gray-400 text-sm">Aguarde enquanto configuramos sua sessão.</p>
      </div>
    </div>
  )
}

export default function TokenExchangePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ikz-bg">
          <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
        </div>
      }
    >
      <TokenExchangeInner />
    </Suspense>
  )
}
