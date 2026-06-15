import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { CalendarIcon, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getClinicAnalytics, PeriodOption } from '@/services/relatorios'

const PIE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

export default function ClinicaRelatorios() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodOption>('current_year')
  const [data, setData] = useState<Awaited<ReturnType<typeof getClinicAnalytics>> | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const result = await getClinicAnalytics(period)
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
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
            Visão Geral da Clínica
          </h1>
          <p className="text-slate-500 mt-1">Análise consolidada de produtividade e faturamento.</p>
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
            <CardTitle className="text-sm font-medium text-slate-600">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                data.faturamentoTotal,
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Psicólogo Destaque</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div
              className="text-xl font-bold text-slate-800 truncate"
              title={data.psicologoMaisProdutivo}
            >
              {data.psicologoMaisProdutivo}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ocupação Média</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{data.taxaOcupacao.toFixed(1)}%</div>
            <p className="text-xs text-slate-400 mt-1">Estimativa de capacidade</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Inadimplência Média
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {data.inadimplenciaMedia.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Do total de recebíveis</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Faturamento por Profissional
            </CardTitle>
            <CardDescription>Distribuição da receita no período.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {data.faturamentoChart.length === 0 ? (
                <p className="text-slate-500">Sem dados para exibir.</p>
              ) : (
                <ChartContainer config={{}} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={data.faturamentoChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {data.faturamentoChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(value)
                      }
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Sessões por Especialidade
            </CardTitle>
            <CardDescription>Volume de atendimentos categorizados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data.especialidadeChart.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-500">Sem dados para exibir.</p>
                </div>
              ) : (
                <ChartContainer config={{}} className="h-full w-full">
                  <BarChart
                    data={data.especialidadeChart}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={100}
                      tick={{ fill: '#475569', fontSize: 12 }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#0ea5e9"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                      name="Sessões"
                    >
                      {data.especialidadeChart.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[(index + 1) % PIE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-100 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Tabela de Produtividade
          </CardTitle>
          <CardDescription>Desempenho detalhado de cada profissional da clínica.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[300px]">Nome do Psicólogo</TableHead>
                <TableHead className="text-center">Sessões no Mês</TableHead>
                <TableHead className="text-center">Taxa de Comparecimento</TableHead>
                <TableHead className="text-right">Valor Faturado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    Nenhum profissional encontrado no período.
                  </TableCell>
                </TableRow>
              ) : (
                data.tableData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-slate-700">{row.nome}</TableCell>
                    <TableCell className="text-center">{row.sessoes}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.taxa >= 80 ? 'bg-emerald-500' : row.taxa >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(row.taxa, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-left">
                          {row.taxa.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(row.faturamento)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
