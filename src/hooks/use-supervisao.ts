import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import pb from '@/lib/pocketbase/client'

export function useSupervisao() {
  const { user } = useAuth()
  const [isSupervisor, setIsSupervisor] = useState(false)
  const [isSupervisando, setIsSupervisando] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'psicologo') {
      setIsSupervisor(false)
      setIsSupervisando(false)
      setLoading(false)
      return
    }

    async function checkRoles() {
      try {
        const perfil = await pb
          .collection('perfis_psicologos')
          .getFirstListItem(`user_id="${user.id}"`)

        try {
          await pb.collection('supervisores').getFirstListItem(`psicologo_id="${perfil.id}"`)
          setIsSupervisor(true)
        } catch {
          setIsSupervisor(false)
        }

        try {
          await pb.collection('supervisandos').getFirstListItem(`psicologo_id="${perfil.id}"`)
          setIsSupervisando(true)
        } catch {
          setIsSupervisando(false)
        }
      } catch {
        setIsSupervisor(false)
        setIsSupervisando(false)
      } finally {
        setLoading(false)
      }
    }

    checkRoles()
  }, [user])

  return { isSupervisor, isSupervisando, loading }
}
