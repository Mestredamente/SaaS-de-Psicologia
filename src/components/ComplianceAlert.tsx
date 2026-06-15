import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { checkPsychologistCompliance } from '@/services/compliance'
import { useAuth } from '@/hooks/use-auth'

export function ComplianceAlert() {
  const { user } = useAuth()
  const [data, setData] = useState({ isCompliant: true, pendingCount: 0 })

  useEffect(() => {
    if (user?.role === 'psicologo') {
      checkPsychologistCompliance(user.id).then(setData)
    }
  }, [user])

  if (data.isCompliant || data.pendingCount === 0) return null

  return (
    <Alert variant="destructive" className="mb-4 bg-amber-50 text-amber-900 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Atenção à Conformidade (LGPD)</AlertTitle>
      <AlertDescription>
        Você possui {data.pendingCount} paciente(s) ativo(s) que ainda não aceitou(aram) a versão
        mais recente dos Termos de Consentimento (LGPD). Por favor, oriente-os a acessar o Portal do
        Paciente para atualizar seus cadastros.
      </AlertDescription>
    </Alert>
  )
}
