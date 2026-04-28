'use client'
import { getUriWithoutOrg } from '@services/config/config'
import { AlertTriangle, HomeIcon, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

function ErrorUI(params: { message?: string, submessage?: string }) {
  const router = useRouter()

  function reloadPage() {
    router.refresh()
    window.location.reload()
  }

  return (
    <div className="flex flex-col py-10 mx-auto antialiased items-center space-y-6 bg-ikz-bg text-ikz-text">
      <div className="flex flex-row items-center space-x-5 rounded-xl">
        <AlertTriangle className="text-ikz-cyan" size={45} />
        <div className='flex flex-col'>
          <p className="text-3xl font-bold text-ikz-cyan">{params.message ? params.message : 'Algo deu errado'}</p>
          <p className="text-lg font-bold text-ikz-text">{params.submessage ? params.submessage : ''}</p>
        </div>
      </div>
      <div className='flex space-x-4'>
        <button
          onClick={() => reloadPage()}
          className="flex space-x-2 items-center rounded-full px-4 py-1 text-white bg-ikz-cyan hover:opacity-90 transition-all ease-linear shadow-lg"
        >
          <RefreshCcw className="text-white" size={17} />
          <span className="text-md font-bold">Tentar novamente</span>
        </button>
        <Link
          href={getUriWithoutOrg('/home')}
          className="flex space-x-2 items-center rounded-full px-4 py-1 text-ikz-text bg-ikz-surface border border-ikz-border hover:border-ikz-cyan/60 transition-all ease-linear shadow-lg"
        >
          <HomeIcon className="text-ikz-cyan" size={17} />
          <span className="text-md font-bold">Voltar ao início</span>
        </Link>
      </div>
    </div>
  )
}

export default ErrorUI
