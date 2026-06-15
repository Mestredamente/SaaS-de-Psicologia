import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardRouter() {
  const { perfil, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full text-muted-foreground animate-pulse">
        Carregando painel...
      </div>
    )
  }

  if (!user || user.role !== 'psicologo') {
    return <Navigate to="/" replace />
  }

  if (perfil?.clinica_id) {
    return <Navigate to="/dashboard/psicologo/vinculado" replace />
  }

  return <Navigate to="/dashboard/psicologo/autonomo" replace />
}
