import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAssinaturas, getTenants } from '@/services/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Activity, DollarSign, AlertCircle, Ban, Play, Clock } from 'lucide-react'
import { updateAssinaturaStatus } from '@/services/admin'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [assinaturas, setAssinaturas] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [subs, tnts] = await Promise.all([getAssinaturas(), getTenants()])
      setAssinaturas(subs)
      setTenants(tnts)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAssinaturaStatus(id, status)
      toast({ title: `Assinatura ${status}` })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  const getTenantName = (userId: string) => {
    const tenant = tenants.find((t) => t.usuario_id === userId)
    return tenant?.nome_fantasia || 'N/A'
  }

  const ativas = assinaturas.filter((a) => a.status === 'ativa')
  const trial = assinaturas.filter((a) => a.status === 'trial')

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const vencendoEsteMes = assinaturas.filter((a) => {
    const vDate = new Date(a.data_vencimento)
    return vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear
  })

  const faturamento = ativas.reduce((acc, a) => acc + (a.expand?.plano_id?.valor_mensal || 0), 0)

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard Administrativo
        </h1>
        <p className="text-muted-foreground">Visão geral do sistema e assinaturas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Assinaturas Ativas</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{ativas.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Em Trial</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{trial.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Vencendo Este Mês</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{vencendoEsteMes.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Faturamento Estimado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                faturamento,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Assinaturas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant (Usuário)</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assinaturas.slice(0, 5).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {getTenantName(a.usuario_id)}
                    <span className="block text-xs text-muted-foreground">
                      {a.expand?.usuario_id?.email}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize text-slate-600">{a.tipo_usuario}</TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {a.expand?.plano_id?.nome}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {format(new Date(a.data_vencimento), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.status === 'ativa'
                          ? 'default'
                          : a.status === 'trial'
                            ? 'secondary'
                            : a.status === 'suspensa'
                              ? 'outline'
                              : 'destructive'
                      }
                      className={
                        a.status === 'ativa'
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : a.status === 'trial'
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : ''
                      }
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {a.status === 'ativa' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(a.id, 'suspensa')}
                          className="h-8"
                        >
                          <Ban className="w-4 h-4 mr-1" /> Suspender
                        </Button>
                      )}
                      {(a.status === 'suspensa' || a.status === 'cancelada') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(a.id, 'ativa')}
                          className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <Play className="w-4 h-4 mr-1" /> Reativar
                        </Button>
                      )}
                      {a.status !== 'cancelada' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(a.id, 'cancelada')}
                          className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
