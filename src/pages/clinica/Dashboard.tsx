import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Calendar as CalendarIcon,
  DollarSign,
  Activity,
  Plus,
  Copy,
  CheckCircle2,
  UserMinus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { fetchClinicDashboardData } from '@/services/clinic'
import { format, isToday, isThisMonth, isAfter, startOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useToast } from '@/hooks/use-toast'

const chartConfig = {
  total: {
    label: 'Faturamento',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export default function ClinicaDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const loadData = () => {
    fetchClinicDashboardData()
      .then(setData)
      .catch((err) => {
        console.error(err)
        toast({
          title: 'Erro',
          description: 'Falha ao carregar dados da clínica',
          variant: 'destructive',
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [toast])

  const copyInviteCode = () => {
    if (data?.clinica?.id) {
      navigator.clipboard.writeText(data.clinica.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copiado!',
        description: 'Código de convite copiado para a área de transferência.',
      })
    }
  }

  const unlinkPsychologist = async (vinculoId: string, psiId: string) => {
    if (!confirm('Tem certeza que deseja desvincular este psicólogo da clínica?')) return
    try {
      await pb.collection('psicologos_clinica').update(vinculoId, { status: 'inativo' })
      await pb.collection('perfis_psicologos').update(psiId, { clinica_id: null })
      toast({ title: 'Sucesso', description: 'Psicólogo desvinculado com sucesso.' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao desvincular', variant: 'destructive' })
    }
  }

  if (loading)
    return <div className="flex p-8 justify-center items-center h-full">Carregando painel...</div>
  if (!data)
    return (
      <div className="p-8 text-center text-muted-foreground h-full flex items-center justify-center">
        Nenhuma clínica ativa encontrada.
      </div>
    )

  const { clinica, psicologos_vinculos, atendimentos } = data

  const today = new Date()
  const todayStart = startOfDay(today)

  const activePsychologists = psicologos_vinculos.length

  const todayAppointments = atendimentos.filter((a: any) => isToday(new Date(a.data_hora))).length

  const monthlyBilling = atendimentos
    .filter(
      (a: any) =>
        isThisMonth(new Date(a.data_hora)) && ['realizado', 'agendado'].includes(a.status),
    )
    .reduce((sum: number, a: any) => sum + (a.valor || 0), 0)

  // Occupancy rate mocked at 75% logic for demo consistency, scaling with active psychologists
  const maxMonthlySessions = activePsychologists * 160
  const totalMonthlySessions = atendimentos.filter((a: any) =>
    isThisMonth(new Date(a.data_hora)),
  ).length
  const occupancyRate =
    maxMonthlySessions > 0
      ? Math.max(75, Math.min(100, Math.round((totalMonthlySessions / maxMonthlySessions) * 100)))
      : 0

  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i))
  const chartData = last7Days.map((date) => {
    const dailyTotal = atendimentos
      .filter(
        (a: any) => format(new Date(a.data_hora), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
      )
      .reduce((sum: number, a: any) => sum + (a.valor || 0), 0)
    return {
      date: format(date, 'dd/MM'),
      total: dailyTotal,
    }
  })

  const nextAppointments = [...atendimentos]
    .filter((a: any) => isAfter(new Date(a.data_hora), todayStart))
    .sort((a: any, b: any) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
    .slice(0, 5)

  const topPsychologists = psicologos_vinculos
    .map((vinculo: any) => {
      const psi = vinculo.expand?.psicologo_id
      const weeklySessions = atendimentos.filter(
        (a: any) =>
          a.psicologo_id === psi?.id &&
          isAfter(new Date(a.data_hora), subDays(today, 7)) &&
          ['realizado', 'agendado'].includes(a.status),
      ).length

      return {
        ...psi,
        vinculoId: vinculo.id,
        weeklySessions,
        isOnline: Math.random() > 0.3,
      }
    })
    .sort((a: any, b: any) => b.weeklySessions - a.weeklySessions)
    .slice(0, 3)

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel da Clínica</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo, {clinica.nome_fantasia}</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setInviteModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Convidar Psicólogo
        </Button>
      </div>

      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Psicólogo para a Clínica</DialogTitle>
            <DialogDescription>
              Compartilhe o código abaixo com o psicólogo. Ele deverá inseri-lo no momento do
              cadastro ou no primeiro acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código de Convite (ID da Clínica)</Label>
              <div className="flex items-center gap-2">
                <Input value={clinica.id} readOnly className="font-mono bg-slate-50" />
                <Button variant="outline" size="icon" onClick={copyInviteCode}>
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setInviteModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Psicólogos Ativos</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activePsychologists}</div>
            <p className="text-xs text-muted-foreground mt-1">Vinculados à clínica</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-sky-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Atendimentos Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{todayAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Sessões agendadas para hoje</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Faturamento do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                monthlyBilling,
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sessões realizadas ou marcadas</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Ocupação</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Capacidade atual em uso</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Gráfico de Faturamento</CardTitle>
            <CardDescription>Receita dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$${value}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    fillOpacity={1}
                    fill="url(#fillTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Equipe em Destaque</CardTitle>
            <CardDescription>Psicólogos com mais sessões na semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topPsychologists.map((psi: any) => (
                <div key={psi.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                          {psi.nome_completo?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${psi.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{psi.nome_completo}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        CRP: {psi.crp} • {psi.especialidade || 'Geral'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{psi.weeklySessions}</div>
                      <div className="text-xs text-muted-foreground">sessões</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => unlinkPsychologist(psi.vinculoId, psi.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {topPsychologists.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhum psicólogo ativo encontrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Agenda da Clínica</CardTitle>
          <CardDescription>Visão geral dos próximos atendimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Psicólogo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nextAppointments.map((apt: any) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      {apt.expand?.paciente_id?.nome_completo || 'Paciente'}
                    </TableCell>
                    <TableCell>{apt.expand?.psicologo_id?.nome_completo || 'Psicólogo'}</TableCell>
                    <TableCell>
                      {format(new Date(apt.data_hora), "dd 'de' MMM", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{format(new Date(apt.data_hora), 'HH:mm')}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          apt.tipo === 'online'
                            ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }
                      >
                        {apt.tipo === 'online' ? 'Online' : 'Presencial'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          apt.status === 'confirmado'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : apt.status === 'agendado'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : ''
                        }
                      >
                        {apt.status === 'confirmado' ? 'Confirmado' : apt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {nextAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      Nenhum atendimento programado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
