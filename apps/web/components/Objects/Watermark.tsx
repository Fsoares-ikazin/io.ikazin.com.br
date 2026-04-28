import Link from 'next/link'
import React from 'react'
import { useOrg } from '../Contexts/OrgContext'
import { useTranslation } from 'react-i18next'
import { usePlan } from '@components/Hooks/usePlan'

function Watermark() {
    const { t } = useTranslation()
    const org = useOrg() as any

    const plan = usePlan()
    const isFreeUser = plan === 'free'
    const watermarkConfig = org?.config?.config?.customization?.general?.watermark ?? org?.config?.config?.general?.watermark
    // Free SaaS plan always shows. All other modes (OSS/EE/paid) respect admin setting (default on).
    const showWatermark = isFreeUser || watermarkConfig !== false

    if (showWatermark) {
        return (
            <div className='fixed bottom-8 right-8 z-50'>
                <Link href={`https://ikazin.com.br`} className="flex items-center cursor-pointer bg-white/80 backdrop-blur-lg text-gray-700 rounded-2xl p-2 light-shadow text-xs px-5 font-semibold space-x-2">
                    <p>{t('common.made_with')}</p>
                    <img src="/logo.png" alt="Ikazin.io" width={95} className="object-contain" />
                </Link>
            </div>
        )
    }
    return null
}

export default Watermark