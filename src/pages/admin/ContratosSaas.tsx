import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Search, Eye } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getContratosSaas, ContratoSaas } from '@/services/adminContratos'
import { getPlanos } from '@/services/admin'
import { ContratoSaasForm } from './components/ContratoSaasForm'
import { ContratoSaasPreview } from './components/ContratoSaasPreview'
import { format } from 'date-fns'

export default function ContratosSaas() {
  const [contratos, setContratos] = useState<ContratoSaas[]>([])
  const [planos, setPlanos] = useState<any[]>([])
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [tipoFiltro, setTipoFiltro] = useState('todos')
  const [planoFiltro, setPlanoFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedContrato, setSelectedContrato] = useState<ContratoSaas | null>(null)

  const loadData = async () => {
    const data = await getContratosSaas()
    setContratos(data)
  }

  useEffect(() => {
    loadData()
    getPlanos().then(setPlanos)
  }, [])

  const filtered = contratos.filter((c) => {
    if (statusFiltro !== 'todos' && c.status !== statusFiltro) return false
    if (tipoFiltro !== 'todos' && c.tipo_contratante !== tipoFiltro) return false
    if (planoFiltro !== 'todos' && c.plano_id !== planoFiltro) return false
    if (
      busca &&
      !c.contratante_nome.toLowerCase().includes(busca.toLowerCase()) &&
      !c.numero_contrato.toLowerCase().includes(busca.toLowerCase())
    )
      return false
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Contratos SaaS</h1>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por contratante ou nº..."
              className="pl-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="assinado">Assinado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo Contratante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Tipos</SelectItem>
              <SelectItem value="psicologo">Psicólogo</SelectItem>
              <SelectItem value="clinica">Clínica</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planoFiltro} onValueChange={setPlanoFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Planos</SelectItem>
              {planos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Contratante</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.numero_contrato}</TableCell>
                  <TableCell>{c.contratante_nome}</TableCell>
                  <TableCell className="capitalize">{c.tipo_contratante}</TableCell>
                  <TableCell>{c.expand?.plano_id?.nome || '-'}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      c.valor_mensal,
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(c.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === 'assinado'
                          ? 'default'
                          : c.status === 'cancelado'
                            ? 'destructive'
                            : c.status === 'enviado'
                              ? 'secondary'
                              : 'outline'
                      }
                      className={c.status === 'assinado' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedContrato(c)}>
                      <Eye className="w-4 h-4 mr-2" /> Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Nenhum contrato encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <ContratoSaasForm
            onSuccess={() => {
              setIsFormOpen(false)
              loadData()
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedContrato} onOpenChange={(o) => !o && setSelectedContrato(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          {selectedContrato && (
            <ContratoSaasPreview
              contrato={selectedContrato}
              onClose={() => setSelectedContrato(null)}
              onUpdate={() => {
                setSelectedContrato(null)
                loadData()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
