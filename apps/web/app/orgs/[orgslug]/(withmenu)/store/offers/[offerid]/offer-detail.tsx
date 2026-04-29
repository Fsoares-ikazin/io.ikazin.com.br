'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import { getUriWithOrg } from '@services/config/config'
import { getCourseThumbnailMediaDirectory } from '@services/media/media'
import { getOfferCheckoutSession } from '@services/payments/offers'
import {
  ArrowLeft, RefreshCcw, SquareCheck, Sparkles, BookOpen,
  Mic, Puzzle, AlertCircle, Loader2, ShoppingBag
} from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import toast from 'react-hot-toast'

interface Resource {
  resource_uuid: string
  resource_type: string
  name: string
  description: string
  thumbnail_image: string
  org_uuid: string
}

interface OfferDetailClientProps {
  orgslug: string
  orgId: number
  offerUuid: string
  offer: any
  access_token: string | null
}

function resourceIcon(type: string, size = 14) {
  switch (type) {
    case 'course': return <BookOpen size={size} className="text-indigo-500" />
    case 'podcast': return <Mic size={size} className="text-pink-400" />
    default: return <Puzzle size={size} className="text-gray-400" />
  }
}

function stripTypePrefix(uuid: string): string {
  return uuid.replace(/^[a-z]+_/, '')
}

function getResourceUrl(orgslug: string, resource: Resource): string | null {
  const id = stripTypePrefix(resource.resource_uuid)
  switch (resource.resource_type) {
    case 'course': return getUriWithOrg(orgslug, `/course/${id}`)
    case 'podcast': return getUriWithOrg(orgslug, `/podcast/${id}`)
    case 'playground': return getUriWithOrg(orgslug, `/playground/${id}`)
    default: return null
  }
}

function ResourceCard({ resource, orgslug }: { resource: Resource; orgslug: string }) {
  const src = resource.thumbnail_image && resource.resource_type === 'course'
    ? getCourseThumbnailMediaDirectory(resource.org_uuid, resource.resource_uuid, resource.thumbnail_image)
    : null

  const url = getResourceUrl(orgslug, resource)
  const card = (
    <div className={`bg-ikz-surface rounded-xl border border-ikz-border shadow-lg shadow-black/30 overflow-hidden flex flex-col ${url ? 'cursor-pointer hover:scale-[1.01] transition-transform duration-150' : ''}`}>
      {/* Thumbnail */}
      <div
        className="w-full aspect-video overflow-hidden bg-ikz-bg"
        style={{
          backgroundImage: src ? `url(${src})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!src && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ikz-surface to-ikz-bg">
            {resourceIcon(resource.resource_type, 28)}
          </div>
        )}
        <div className="p-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 capitalize">
            {resourceIcon(resource.resource_type, 10)}
            {resource.resource_type}
          </span>
        </div>
      </div>
      {/* Details */}
      <div className="p-3 flex flex-col gap-1">
        <p className="font-semibold text-sm text-ikz-text leading-snug">{resource.name}</p>
        {resource.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{resource.description}</p>
        )}
      </div>
    </div>
  )

  return url ? <Link href={url}>{card}</Link> : card
}

export default function OfferDetailClient({ orgslug, orgId, offerUuid, offer, access_token }: OfferDetailClientProps) {
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token ?? access_token
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!offer) {
    return (
      <GeneralWrapperStyled>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle size={32} className="text-gray-300 mb-3" />
          <h2 className="font-bold text-ikz-text text-lg">Oferta não encontrada</h2>
          <Link href={getUriWithOrg(orgslug, '/store')} className="mt-4 text-sm text-ikz-cyan hover:underline">
            Voltar para a loja
          </Link>
        </div>
      </GeneralWrapperStyled>
    )
  }

  const isSubscription = offer.offer_type === 'subscription'
  const benefits: string[] = offer.benefits
    ? offer.benefits.split(',').map((b: string) => b.trim()).filter(Boolean)
    : []
  const resources: Resource[] = offer.included_resources ?? []

  const handleCheckout = async () => {
    if (!token) {
      router.push(getUriWithOrg(orgslug, `/login?redirect=/store/offers/${offerUuid}`))
      return
    }
    setLoading(true)
    try {
      const redirectUri = window.location.href
      const result = await getOfferCheckoutSession(orgId, offerUuid, redirectUri, token)
      const url = result?.data?.checkout_url
      if (url) {
        window.location.href = url
      } else {
        toast.error('Não foi possível iniciar o checkout. Tente novamente.')
      }
    } catch {
      toast.error('Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <GeneralWrapperStyled>
        <Link
          href={getUriWithOrg(orgslug, '/store')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors mb-7"
        >
          <ArrowLeft size={14} /> Voltar para a loja
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-7">
            {/* Offer header */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                {isSubscription ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ikz-cyan bg-ikz-cyan/10 border border-ikz-cyan/30 rounded-full px-3 py-1">
                    <RefreshCcw size={11} /> Assinatura
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-ikz-bg border border-ikz-border rounded-full px-3 py-1">
                    <SquareCheck size={11} /> Compra única
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-ikz-text tracking-tight">{offer.name}</h1>
              <p className="mt-3 text-gray-400 leading-relaxed text-base">{offer.description}</p>
            </div>

            {/* Included courses/resources */}
            {resources.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                  Conteúdo incluído · {resources.length} {resources.length === 1 ? 'recurso' : 'recursos'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resources.map((r) => (
                    <ResourceCard key={r.resource_uuid} resource={r} orgslug={orgslug} />
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="bg-ikz-surface rounded-xl shadow-lg shadow-black/30 p-5">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Benefícios</h2>
                <ul className="space-y-2.5">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <Sparkles size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right col — sticky pricing card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-lg shadow-black/30 bg-ikz-surface p-6 sticky top-24">
              {/* Price */}
              <div className="mb-5">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {offer.price_type === 'customer_choice' ? 'Pague quanto quiser (mín.)' : isSubscription ? 'Valor da assinatura' : 'Valor da compra'}
                </p>
                <div className={`text-4xl font-black ${isSubscription ? 'text-ikz-cyan' : 'text-ikz-text'}`}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: offer.currency,
                  }).format(offer.amount)}
                </div>
                {isSubscription && (
                  <p className="text-sm text-ikz-cyan font-medium mt-0.5">recorrente</p>
                )}
              </div>

              {/* Checkout */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  isSubscription
                    ? 'bg-ikz-cyan hover:bg-ikz-cyan/90 text-white'
                    : 'bg-ikz-cyan hover:bg-ikz-cyan/90 text-white'
                }`}
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Processando...</>
                ) : (
                  <>{isSubscription ? 'Assinar agora' : 'Obter acesso'}</>
                )}
              </button>

              {!token && (
                <p className="text-xs text-center text-gray-400 mt-3">
                  Você precisará entrar antes do checkout.
                </p>
              )}

              {/* Resource summary */}
              {resources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-ikz-border">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Incluído</p>
                  <div className="space-y-2">
                    {resources.map((r) => {
                      const src = r.thumbnail_image && r.resource_type === 'course'
                        ? getCourseThumbnailMediaDirectory(r.org_uuid, r.resource_uuid, r.thumbnail_image)
                        : null
                      return (
                        <div key={r.resource_uuid} className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-md overflow-hidden bg-ikz-bg shrink-0 flex items-center justify-center shadow-lg shadow-black/30"
                            style={{
                              backgroundImage: src ? `url(${src})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            {!src && resourceIcon(r.resource_type, 13)}
                          </div>
                          <p className="text-xs font-medium text-gray-300 truncate">{r.name}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Trust signals */}
              <div className="mt-5 pt-4 border-t border-ikz-border space-y-1.5">
                <p className="text-xs text-gray-400 flex items-center gap-1.5"><ShoppingBag size={11} /> Checkout seguro via Stripe</p>
                {isSubscription && <p className="text-xs text-gray-400">Cancele quando quiser</p>}
                <p className="text-xs text-gray-400">Acesso imediato após o pagamento</p>
              </div>
            </div>
          </div>
        </div>
      </GeneralWrapperStyled>
    </div>
  )
}
