import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

let isPatched = false

export function SimulationBanner() {
  const [isSimulating] = useState(!!localStorage.getItem('admin_auth_simulation'))
  const { toast } = useToast()

  useEffect(() => {
    if (isSimulating && !isPatched) {
      const originalSend = pb.send.bind(pb)
      pb.send = async function (path, options) {
        const method = (options?.method || 'GET').toUpperCase()
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          if (
            !path.includes('logs_auditoria') &&
            !path.includes('simulacoes_admin') &&
            !path.includes('/admin/simulate')
          ) {
            toast({
              title: 'Ação bloqueada',
              description:
                'Ação bloqueada em modo de simulação. Use os botões apenas para testar a interface.',
              variant: 'destructive',
            })
            return Promise.reject(
              new Error(
                'Ação bloqueada em modo de simulação. Use os botões apenas para testar a interface.',
              ),
            )
          }
        }
        return originalSend(path, options)
      }
      isPatched = true
    }
  }, [isSimulating, toast])

  if (!isSimulating) return null

  const handleExit = async () => {
    const adminAuthStr = localStorage.getItem('admin_auth_simulation')
    if (adminAuthStr) {
      const adminAuth = JSON.parse(adminAuthStr)
      const simId = localStorage.getItem('sim_id')

      pb.authStore.save(adminAuth.token, adminAuth.record)
      localStorage.removeItem('admin_auth_simulation')

      if (simId) {
        try {
          await pb
            .collection('simulacoes_admin')
            .update(simId, { data_fim: new Date().toISOString() })
        } catch (err) {
          console.error('Failed to update simulation end time', err)
        }
      }
      localStorage.removeItem('sim_id')

      window.location.href = '/admin/visao-usuario'
    }
  }

  const record = pb.authStore.record
  const name = record?.nome_completo || record?.name || record?.email
  const role = record?.role || 'Usuário'

  return (
    <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between z-[100] sticky top-0 shrink-0 shadow-md">
      <div className="font-semibold text-sm md:text-base flex-1 truncate mr-4">
        Modo Simulação — você está vendo como {name} ({role})
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="bg-red-700 hover:bg-red-800 text-white whitespace-nowrap"
        onClick={handleExit}
      >
        Sair da Simulação
      </Button>
    </div>
  )
}
