import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar,
  Users,
  Activity,
  DollarSign,
  Clock,
  MapPin,
  Video,
  ArrowRight,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getDashboardStats,
  getUpcomingAppointments,
  getRecentPatients,
  getActivityChartData,
  type DashboardStats,
  type Appointment,
  type Patient,
  type ChartData,
} from '@/services/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])

  const loadData = async () => {
    try {
      const [newStats, newAppointments, newPatients, newChartData] = await Promise.all([
        getDashboardStats(),
        getUpcomingAppointments(),
        getRecentPatients(),
        getActivityChartData(),
      ])
      setStats(newStats)
      setAppointments(newAppointments)
      setPatients(newPatients)
      setChartData(newChartData)
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('appointments', () => {
    loadData()
  })
  useRealtime('patients', () => {
    loadData()
  })

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      {
        label: string
        variant: 'default' | 'secondary' | 'outline' | 'destructive'
        color?: string
      }
    > = {
      confirmado: {
        label: 'Confirmado',
        variant: 'default',
        color: 'bg-emerald-500 hover:bg-emerald-600',
      },
      pendente: { label: 'Pendente', variant: 'secondary' },
      cancelado: { label: 'Cancelado', variant: 'destructive' },
      concluido: { label: 'Concluído', variant: 'outline' },
    }
    const mapped = map[status] || { label: status, variant: 'outline' }
    return (
      <Badge className={mapped.color} variant={mapped.variant}>
        {mapped.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-96 md:col-span-4" />
          <Skeleton className="h-96 md:col-span-3" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Olá, {user?.name?.split(' ')[0] || 'Doutor(a)'}
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          {stats?.todayCount === 0
            ? 'Você não tem atendimentos agendados para hoje.'
            : `Você tem ${stats?.todayCount} atendimento${stats?.todayCount === 1 ? '' : 's'} hoje.`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-card-effect border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atendimentos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.todayCount}</div>
          </CardContent>
        </Card>

        <Card className="hover-card-effect border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.activePatients}</div>
          </CardContent>
        </Card>

        <Card className="hover-card-effect border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessões Esta Semana
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.weekSessions}</div>
          </CardContent>
        </Card>

        <Card className="hover-card-effect border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats?.monthRevenue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Next Appointments */}
        <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-lg font-semibold">Próximos Atendimentos</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary/80"
            >
              <Link to="/agenda">
                Ver agenda <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum atendimento próximo.
              </div>
            ) : (
              <div className="divide-y">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {apt.expand?.patient?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{apt.expand?.patient?.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-3">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3.5 w-3.5" />{' '}
                            {format(parseISO(apt.date_time), 'HH:mm')}
                          </span>
                          <span className="flex items-center">
                            {apt.type === 'online' ? (
                              <Video className="mr-1 h-3.5 w-3.5" />
                            ) : (
                              <MapPin className="mr-1 h-3.5 w-3.5" />
                            )}
                            <span className="capitalize">{apt.type}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">{getStatusBadge(apt.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="lg:col-span-3 border-none shadow-sm flex flex-col">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg font-semibold">Sessões Realizadas</CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            <ChartContainer
              config={{ sessoes: { label: 'Sessões', color: 'hsl(var(--primary))' } }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar
                    dataKey="sessoes"
                    fill="var(--color-sessoes)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="lg:col-span-7 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-lg font-semibold">Últimos Pacientes Atendidos</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary/80"
            >
              <Link to="/pacientes">
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {patients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhum paciente recente.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 divide-y md:divide-y-0 md:divide-x">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-5 flex flex-col items-center text-center hover:bg-muted/30 transition-colors group"
                  >
                    <Avatar className="h-16 w-16 mb-3 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                        {patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-gray-900 truncate w-full mb-1">
                      {patient.name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Última sessão:{' '}
                      {patient.last_session
                        ? format(parseISO(patient.last_session), "dd 'de' MMMM", { locale: ptBR })
                        : 'Nunca'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                      onClick={() => navigate(`/prontuarios/${patient.id}`)}
                    >
                      Acessar Prontuário
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
