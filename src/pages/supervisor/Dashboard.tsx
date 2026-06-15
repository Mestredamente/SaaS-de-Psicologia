import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarDays, BookOpen, Clock } from 'lucide-react'
import {
  getSupervisorProfile,
  getSupervisandos,
  getSessoesSupervisao,
  getCasosSupervisao,
} from '@/services/supervisao'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function SupervisorDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      const profile = await getSupervisorProfile(user.id)
      if (!profile) return

      const supervisandos = await getSupervisandos(profile.id)
      const sessoes = await getSessoesSupervisao(profile.id)
      const casos = await getCasosSupervisao(profile.id)

      setData({ profile, supervisandos, sessoes, casos })
    }
    loadData()
  }, [user])

  if (!data) return <div className="p-8">Carregando...</div>

  const sessoesEsteMes = data.sessoes.filter(
    (s: any) => new Date(s.data_hora).getMonth() === new Date().getMonth(),
  ).length
  const proximaSessao = data.sessoes.find(
    (s: any) => new Date(s.data_hora) > new Date() && s.status === 'agendada',
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Bem-vindo, {user?.name} — Supervisão Clínica
        </h1>
        <p className="text-slate-500">Acompanhe seus supervisandos e a evolução dos casos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervisandos Ativos</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.supervisandos.filter((s: any) => s.status === 'em_andamento').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Realizadas Este Mês</CardTitle>
            <CalendarDays className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessoesEsteMes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos em Supervisão</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.casos.filter((c: any) => c.status === 'em_supervisao').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Sessão</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proximaSessao ? format(new Date(proximaSessao.data_hora), 'dd/MM HH:mm') : '--'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supervisandos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.supervisandos.slice(0, 5).map((sup: any) => (
                  <TableRow key={sup.id}>
                    <TableCell className="font-medium">
                      {sup.expand?.psicologo_id?.nome_completo}
                    </TableCell>
                    <TableCell>{format(new Date(sup.data_inicio), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="capitalize">{sup.status.replace('_', ' ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessões Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Supervisando</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sessoes.slice(0, 5).map((sessao: any) => (
                  <TableRow key={sessao.id}>
                    <TableCell>{format(new Date(sessao.data_hora), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {sessao.expand?.supervisando_id?.expand?.psicologo_id?.nome_completo}
                    </TableCell>
                    <TableCell className="capitalize">{sessao.tipo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
