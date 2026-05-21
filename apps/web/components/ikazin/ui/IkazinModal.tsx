'use client'

import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { modalContent } from '@/lib/ikazin/motion'
import { color } from '@/lib/ikazin/tokens'

export type ModalSize = 'sm' | 'md' | 'lg'

export type IkazinModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: ModalSize
  closeOnBackdrop?: boolean
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export default function IkazinModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: IkazinModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ animationDuration: '200ms' }}
        />
        <Dialog.Content
          onInteractOutside={(e) => { if (!closeOnBackdrop) e.preventDefault() }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ animationDuration: '200ms' }}
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate={open ? 'visible' : 'hidden'}
            className={[
              'relative w-full overflow-hidden rounded-[20px] shadow-2xl',
              sizeMap[size],
            ].join(' ')}
            style={{
              background: color.surface,
              border: `1px solid ${color.border.DEFAULT}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${color.border.DEFAULT}` }}
            >
              <Dialog.Title className="text-base font-semibold text-zinc-100">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {description && (
              <Dialog.Description className="sr-only">{description}</Dialog.Description>
            )}

            {/* Body */}
            <div className="p-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div
                className="px-5 py-4"
                style={{ borderTop: `1px solid ${color.border.DEFAULT}` }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
