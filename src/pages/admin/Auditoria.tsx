import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Search, ShieldAlert } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'

export default function AdminAuditoria() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const records = await pb.collection('logs_auditoria').getList(1, 100, {
        sort: '-data_hora',
        expand: 'usuario_id',
      })
      setLogs(records.items)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter(
    (l) =>
      l.acao.toLowerCase().includes(search.toLowerCase()) ||
      l.tabela_afetada.toLowerCase().includes(search.toLowerCase()),
  )

  const isSensitive = (tabela: string, acao: string) => {
    if (tabela === 'prontuarios') return true
    if (tabela === 'pagamentos' && acao === 'update') return true
    if (acao === 'anonymize') return true
    return false
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Logs de Auditoria</h1>
        <p className="text-muted-foreground">
          Monitoramento de acessos e alterações no sistema para compliance LGPD.
        </p>
      </div>

      <div className="flex bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logs..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>Reg. ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => {
                const sensitive = isSensitive(l.tabela_afetada, l.acao)
                return (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(l.data_hora), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {l.expand?.usuario_id?.email || l.usuario_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {l.tipo_usuario}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {sensitive && <ShieldAlert className="w-4 h-4 text-red-500" />}
                        <span
                          className={`capitalize ${sensitive ? 'font-medium text-red-700' : ''}`}
                        >
                          {l.acao}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{l.tabela_afetada}</TableCell>
                    <TableCell className="text-sm font-mono text-slate-500">
                      {l.registro_id.slice(0, 8)}...
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum log encontrado.
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
