import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { CalendarIcon, TrendingUp, Users, DollarSign, Activity, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { getPsychologistAnalytics, PeriodOption } from '@/services/relatorios'

export default function Relatorios() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodOption>('current_year')
  const [data, setData] = useState<Awaited<ReturnType<typeof getPsychologistAnalytics>> | null>(
    null,
  )

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      try {
        const result = await getPsychologistAnalytics(user.id, period)
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, period])

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Relatórios e Análises
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe seu desempenho clínico e financeiro.</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-500" />
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodOption)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
              <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
              <SelectItem value="current_year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Sessões Realizadas</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{data.totalSessoes}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Novos Pacientes</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{data.novosPacientes}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Taxa de Comparecimento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {data.taxaComparecimento.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                data.ticketMedio,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Sessões por Mês</CardTitle>
            <CardDescription>Volume de atendimentos realizados no período.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{ sessoes: { label: 'Sessões', color: 'hsl(var(--primary))' } }}
                className="h-full w-full"
              >
                <BarChart
                  data={data.sessoesPorMes}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sessoes" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Evolução da Carteira
            </CardTitle>
            <CardDescription>Pacientes ativos ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{ ativos: { label: 'Pacientes Ativos', color: 'hsl(var(--primary))' } }}
                className="h-full w-full"
              >
                <LineChart
                  data={data.evolucaoCarteira}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="ativos"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0ea5e9' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Receita vs Meta</CardTitle>
            <CardDescription>Acompanhamento financeiro mensal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  receita: { label: 'Receita', color: 'hsl(var(--primary))' },
                  meta: { label: 'Meta', color: 'hsl(var(--muted))' },
                }}
                className="h-full w-full"
              >
                <AreaChart
                  data={data.receitaVsMeta}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    strokeWidth={2}
                  />
                  <Line
                    type="step"
                    dataKey="meta"
                    stroke="#cbd5e1"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">
                Top 5 Pacientes
              </CardTitle>
              <CardDescription>Maior volume de sessões no período.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPacientes.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum dado encontrado.</p>
                ) : (
                  data.topPacientes.map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{p.name}</span>
                      </div>
                      <span className="text-sm text-slate-500 font-medium">{p.count} sessões</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-red-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Risco de Evasão (Churn)
              </CardTitle>
              <CardDescription>Pacientes ativos sem sessão há mais de 60 dias.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.churnList.length === 0 ? (
                  <p className="text-sm text-emerald-600 font-medium">
                    Nenhum paciente em risco de evasão.
                  </p>
                ) : (
                  data.churnList.map((p, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100 gap-2"
                    >
                      <span className="text-sm font-medium text-slate-800">{p.name}</span>
                      <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-md font-medium whitespace-nowrap">
                        {p.daysSinceLast} dias ausente
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
