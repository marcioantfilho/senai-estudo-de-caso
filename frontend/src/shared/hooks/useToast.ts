import { useContext } from 'react'
import { ToastContext } from '../components/toast-context'

export function useToast() {
  return useContext(ToastContext)
}
