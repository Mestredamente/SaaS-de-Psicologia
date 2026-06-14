import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchClinicAgendamentos } from '@/services/funcionario'
import { useFuncionario } from '@/hooks/use-funcionario'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

export default function FuncionarioAgenda() {
  const { funcionario, loading: fLoading } = useFuncionario()
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (funcionario?.clinica_id) {
      fetchClinicAgendamentos(funcionario.clinica_id)
        .then(setAgendamentos)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [funcionario])

  if (loading || fLoading) return <div className="p-8 text-center">Carregando agenda...</div>
  if (!funcionario?.permissao_agenda)
    return <div className="p-8 text-center text-red-500">Sem permissão de acesso.</div>

  const filtered = agendamentos.filter(
    (a) =>
      a.expand?.paciente_id?.nome_completo?.toLowerCase().includes(search.toLowerCase()) ||
      a.expand?.psicologo_id?.nome_completo?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agenda da Clínica</h1>
          <p className="text-muted-foreground mt-1">Todos os agendamentos da clínica</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Agendar Nova Consulta
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por paciente ou psicólogo..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Psicólogo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    {format(new Date(apt.data_hora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {apt.expand?.paciente_id?.nome_completo}
                  </TableCell>
                  <TableCell>{apt.expand?.psicologo_id?.nome_completo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{apt.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{apt.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum agendamento encontrado.
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
