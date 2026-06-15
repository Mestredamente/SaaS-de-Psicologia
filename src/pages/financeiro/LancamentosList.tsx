import { useState } from 'react'
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
import { Check } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { updateFinanceiro, FinanceiroRecord } from '@/services/financeiro'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LancamentosList({
  data,
  loading,
  limit,
  hideFilters,
}: {
  data: FinanceiroRecord[]
  loading: boolean
  limit?: number
  hideFilters?: boolean
}) {
  const { toast } = useToast()
  const [filterStatus, setFilterStatus] = useState('todos')

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-md">
        Carregando lançamentos...
      </div>
    )
  }

  let filtered = data
  if (filterStatus !== 'todos') {
    filtered = filtered.filter((d) => d.status === filterStatus)
  }
  if (limit) {
    filtered = filtered.slice(0, limit)
  }

  const handleMarkAsReceived = async (id: string) => {
    try {
      await updateFinanceiro(id, { status: 'recebido', data_recebimento: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Lançamento atualizado para recebido.' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar lançamento.',
        variant: 'destructive',
      })
    }
  }

  const statusColors: any = {
    recebido: 'bg-emerald-100 text-emerald-800',
    pendente: 'bg-amber-100 text-amber-800',
    atrasado: 'bg-red-100 text-red-800',
    cancelado: 'bg-slate-100 text-slate-800',
  }

  return (
    <div className="space-y-4">
      {!hideFilters && (
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {format(parseISO(item.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">{item.descricao}</TableCell>
                  <TableCell>{item.expand?.paciente_id?.nome_completo || '-'}</TableCell>
                  <TableCell
                    className={
                      item.tipo === 'despesa'
                        ? 'text-red-600 font-medium'
                        : 'text-emerald-600 font-medium'
                    }
                  >
                    {item.tipo === 'despesa' ? '- ' : ''}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      item.valor,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`capitalize ${statusColors[item.status]}`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(item.status === 'pendente' || item.status === 'atrasado') &&
                      item.tipo === 'receita' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsReceived(item.id)}
                          title="Marcar como recebido"
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
