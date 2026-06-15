import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { format, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FinanceiroRecord } from '@/services/financeiro'

const chartConfig = {
  receita: {
    label: 'Receita',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

const pieColors = [
  '#10b981',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#f43f5e',
  '#f59e0b',
  '#ef4444',
]

export function RelatoriosFinanceiros({ data }: { data: FinanceiroRecord[] }) {
  const last6Months = Array.from({ length: 6 })
    .map((_, i) => subMonths(new Date(), 5 - i))
    .reverse()

  const barData = last6Months.map((date) => {
    const monthStr = format(date, 'yyyy-MM')
    const total = data
      .filter(
        (d) =>
          d.tipo === 'receita' && d.status === 'recebido' && d.data_vencimento.startsWith(monthStr),
      )
      .reduce((a, c) => a + c.valor, 0)
    return {
      name: format(date, 'MMM/yy', { locale: ptBR }),
      receita: total,
    }
  })

  const receitasRecebidas = data.filter((d) => d.tipo === 'receita' && d.status === 'recebido')
  const receitasPorPacienteMap = receitasRecebidas.reduce(
    (acc, curr) => {
      const name = curr.expand?.paciente_id?.nome_completo || 'Outros'
      acc[name] = (acc[name] || 0) + curr.valor
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(receitasPorPacienteMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const atrasados = data.filter((d) => d.status === 'atrasado' && d.tipo === 'receita')
  const inadimplentesMap = atrasados.reduce(
    (acc, curr) => {
      const pName = curr.expand?.paciente_id?.nome_completo || 'Sem Paciente'
      if (!acc[pName]) acc[pName] = { nome: pName, valor: 0, dias: 0 }
      acc[pName].valor += curr.valor
      const diff = Math.floor(
        (new Date().getTime() - parseISO(curr.data_vencimento).getTime()) / (1000 * 3600 * 24),
      )
      if (diff > acc[pName].dias) acc[pName].dias = diff
      return acc
    },
    {} as Record<string, any>,
  )
  const inadimplentes = Object.values(inadimplentesMap).sort((a: any, b: any) => b.valor - a.valor)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Receitas (Últimos 6 Meses)</CardTitle>
          <CardDescription>Recebimentos confirmados</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receita por Paciente</CardTitle>
          <CardDescription>Distribuição de recebimentos</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {pieData.length > 0 ? (
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      value,
                    )
                  }
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Dados insuficientes
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-sm border-red-100">
        <CardHeader>
          <CardTitle className="text-red-700">Inadimplência</CardTitle>
          <CardDescription>Pacientes com pagamentos atrasados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inadimplentes.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                Nenhum pagamento em atraso no momento.
              </p>
            ) : (
              inadimplentes.map((item: any, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg bg-red-50/40 border-red-100"
                >
                  <div>
                    <p className="font-semibold text-red-900">{item.nome}</p>
                    <p className="text-sm text-red-600">Atraso de até {item.dias} dias</p>
                  </div>
                  <div className="text-lg font-bold text-red-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      item.valor,
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
