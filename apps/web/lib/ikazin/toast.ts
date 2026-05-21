/**
 * IKAZIN.IO — Toast API (wrapper sobre sonner).
 *
 * USO:
 *   import { toast } from '@/lib/ikazin/toast'
 *   toast.success('Build concluído!', { description: 'Próximo: Build 8' })
 *   toast.error('Falha ao salvar', { action: { label: 'Tentar', onClick: retry } })
 *
 * O provider visual (Toaster) está montado em IkazinProviders.tsx.
 */

import { toast as sonnerToast, type ExternalToast } from 'sonner'

export type ToastOptions = ExternalToast

function success(message: string, options?: ToastOptions): string | number {
  return sonnerToast.success(message, options)
}

function error(message: string, options?: ToastOptions): string | number {
  return sonnerToast.error(message, options)
}

function warning(message: string, options?: ToastOptions): string | number {
  return sonnerToast.warning(message, options)
}

function info(message: string, options?: ToastOptions): string | number {
  return sonnerToast.info(message, options)
}

function loading(message: string, options?: ToastOptions): string | number {
  return sonnerToast.loading(message, options)
}

function promiseToast<T>(
  promise: Promise<T>,
  msgs: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) },
): Promise<T> | string | number {
  return sonnerToast.promise(promise, msgs) as Promise<T> | string | number
}

function dismiss(id?: string | number): void {
  sonnerToast.dismiss(id)
}

export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  promise: promiseToast,
  dismiss,
}
