import { useCallback, useRef, useState } from 'react'

/** Executa uma ação por vez: um clique duplo envia um só pedido, e `pending` desabilita o botão. */
export function useAsyncAction() {
  const runningRef = useRef(false)
  const [pending, setPending] = useState(false)

  const run = useCallback(async (action: () => Promise<void>) => {
    if (runningRef.current) {
      return
    }
    runningRef.current = true
    setPending(true)
    try {
      await action()
    } finally {
      runningRef.current = false
      setPending(false)
    }
  }, [])

  return { pending, run }
}
