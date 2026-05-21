'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { pageTransition } from '@/lib/ikazin/motion'

export default function IkazinTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}
