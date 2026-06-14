import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, Activity } from 'lucide-react'
import { useFuncionario } from '@/hooks/use-funcionario'
import { fetchFuncionarioDashboard } from '@/services/funcionario'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export default function FuncionarioDashboard() {
  const { funcionario, loading: loadingFunc } = useFuncionario()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (funcionario?.clinica_id) {
      fetchFuncionarioDashboard(funcionario.clinica_id, !!funcionario.permissao_financeiro)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false))
    } else if (!loadingFunc) {
      setLoading(false)
    }
  }, [funcionario, loadingFunc])

  if (loading || loadingFunc) return <div className="p-8 text-center">Carregando painel...</div>
  if (!funcionario)
    return <div className="p-8 text-center">Perfil de funcionário não encontrado.</div>

  const clinicaNome = funcionario.expand?.clinica_id?.nome_fantasia || 'Clínica'

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo, {funcionario.nome_completo.split(' ')[0]} — {clinicaNome}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Atendimentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.atendimentosHoje || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total agendado para hoje</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Agendamentos Pendentes
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data?.agendamentosPendentes || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Novos Pacientes</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.novosPacientes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastrados esta semana</p>
          </CardContent>
        </Card>

        {funcionario.permissao_financeiro && (
          <Card className="shadow-sm bg-emerald-50 border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Faturamento do Dia
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  data?.faturamento || 0,
                )}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Consultas realizadas/confirmadas</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Próximos Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.proximos?.length > 0 ? (
              data.proximos.map((apt: any) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{apt.expand?.paciente_id?.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">
                      Psi: {apt.expand?.psicologo_id?.nome_completo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {format(new Date(apt.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <div className="flex gap-2 justify-end mt-1">
                      <Badge variant="outline">{apt.tipo}</Badge>
                      <Badge variant="secondary">{apt.status}</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum atendimento programado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
