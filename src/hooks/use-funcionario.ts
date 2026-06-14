import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from './use-auth'

export function useFuncionario() {
  const { user } = useAuth()
  const [funcionario, setFuncionario] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'funcionario') {
      pb.collection('funcionarios')
        .getFirstListItem(`user_id="${user.id}"`, { expand: 'clinica_id' })
        .then(setFuncionario)
        .catch((err) => {
          console.error(err)
          setFuncionario(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
      setFuncionario(null)
    }
  }, [user])

  return { funcionario, loading }
}
