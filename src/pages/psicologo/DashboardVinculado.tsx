import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { Users, Calendar, Activity } from 'lucide-react'

export default function DashboardVinculado() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel Vinculado</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo(a), {user?.name || 'Psicólogo(a)'}. Você está conectado à sua clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-indigo-100 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Meus Pacientes</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Agenda Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-purple-100 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Prontuários a Preencher
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
