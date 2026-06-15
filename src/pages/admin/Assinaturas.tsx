import { useEffect, useState } from 'react'
import { getAssinaturas, getTenants, updateAssinaturaStatus } from '@/services/admin'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Search, Ban, Play, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminAssinaturas() {
  const [assinaturas, setAssinaturas] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
      toast({ title: `Status alterado para ${status}` })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' })
    }
  }

  const getTenantName = (userId: string) => {
    const tenant = tenants.find((t) => t.usuario_id === userId)
    return tenant?.nome_fantasia || 'N/A'
  }

  const filtered = assinaturas.filter((a) => {
    const tenantName = getTenantName(a.usuario_id).toLowerCase()
    const userName = a.expand?.usuario_id?.nome_completo?.toLowerCase() || ''
    const email = a.expand?.usuario_id?.email?.toLowerCase() || ''
    const q = search.toLowerCase()
    return tenantName.includes(q) || userName.includes(q) || email.includes(q)
  })

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie o faturamento e acesso dos clientes.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente / Tenant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{getTenantName(a.usuario_id)}</div>
                    <div className="text-xs text-slate-500">
                      {a.expand?.usuario_id?.nome_completo}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{a.expand?.usuario_id?.email}</TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {a.expand?.plano_id?.nome}
                  </TableCell>
                  <TableCell className="capitalize text-slate-600">{a.tipo_usuario}</TableCell>
                  <TableCell className="text-slate-600">
                    {format(new Date(a.data_vencimento), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        a.status === 'ativa'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : a.status === 'trial'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : a.status === 'suspensa'
                              ? 'border-orange-200 bg-orange-50 text-orange-700'
                              : 'border-rose-200 bg-rose-50 text-rose-700'
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
                          className="h-8 text-orange-600 border-orange-200 hover:bg-orange-50"
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
                          <XCircle className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma assinatura encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
