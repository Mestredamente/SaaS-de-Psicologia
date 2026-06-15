import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { isThisMonth, parseISO } from 'date-fns'
import { FinanceiroRecord } from '@/services/financeiro'

export function ResumoCards({ data, loading }: { data: FinanceiroRecord[]; loading: boolean }) {
  if (loading) {
    return <div className="text-sm text-muted-foreground p-4">Carregando métricas...</div>
  }

  const receitas = data.filter((d) => d.tipo === 'receita')

  const receitaMes = receitas
    .filter((r) => isThisMonth(parseISO(r.data_vencimento)))
    .reduce((acc, curr) => acc + curr.valor, 0)

  const pendente = receitas
    .filter((r) => r.status === 'pendente')
    .reduce((acc, curr) => acc + curr.valor, 0)

  const atrasada = receitas
    .filter((r) => r.status === 'atrasado')
    .reduce((acc, curr) => acc + curr.valor, 0)

  const recebidoMes = receitas
    .filter(
      (r) =>
        r.status === 'recebido' && r.data_recebimento && isThisMonth(parseISO(r.data_recebimento)),
    )
    .reduce((acc, curr) => acc + curr.valor, 0)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm border-emerald-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Recebido (Mês)</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(recebidoMes)}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-indigo-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Receita Prevista (Mês)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(receitaMes)}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Receita Pendente</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(pendente)}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-red-100 bg-red-50/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-600">Receita Atrasada</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(atrasada)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
