import { useState, useEffect } from 'react'
import { getFinanceiroAtrasado, getFinanceiro, FinanceiroRecord } from '@/services/financeiro'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export function useFinanceiro() {
  const [data, setData] = useState<FinanceiroRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  const load = async () => {
    if (!isAuthenticated) return
    try {
      const res = await getFinanceiro()
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [isAuthenticated])

  useRealtime('financeiro', () => {
    load()
  })

  return { data, loading, reload: load }
}

export function useFinanceiroAtrasado() {
  const [hasAtrasado, setHasAtrasado] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const check = async () => {
    if (!isAuthenticated) return
    if (user?.role !== 'psicologo' && user?.role !== 'clinica') return
    try {
      const res = await getFinanceiroAtrasado()
      setHasAtrasado(res.totalItems > 0)
    } catch (e) {
      // ignore silently
    }
  }

  useEffect(() => {
    check()
  }, [isAuthenticated, user?.role])

  useRealtime('financeiro', () => {
    check()
  })

  return { hasAtrasado }
}
