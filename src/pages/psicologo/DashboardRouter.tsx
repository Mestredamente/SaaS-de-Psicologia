import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardRouter() {
  const { perfil, user } = useAuth()

  if (!user || user.role !== 'psicologo') {
    return <Navigate to="/" replace />
  }

  if (perfil?.clinica_id) {
    return <Navigate to="/dashboard/psicologo/vinculado" replace />
  }

  return <Navigate to="/dashboard/psicologo/autonomo" replace />
}
