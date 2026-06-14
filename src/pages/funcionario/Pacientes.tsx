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
import { fetchClinicPacientes } from '@/services/funcionario'
import { useFuncionario } from '@/hooks/use-funcionario'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function FuncionarioPacientes() {
  const { funcionario, loading: fLoading } = useFuncionario()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (funcionario?.clinica_id) {
      fetchClinicPacientes(funcionario.clinica_id)
        .then(setPacientes)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [funcionario])

  if (loading || fLoading) return <div className="p-8 text-center">Carregando pacientes...</div>
  if (!funcionario?.permissao_pacientes)
    return <div className="p-8 text-center text-red-500">Sem permissão de acesso.</div>

  const filtered = pacientes.filter(
    (p) =>
      p.nome_completo?.toLowerCase().includes(search.toLowerCase()) ||
      p.expand?.psicologo_id?.nome_completo?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pacientes</h1>
        <p className="text-muted-foreground mt-1">Central de pacientes da clínica</p>
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
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Psicólogo Resp.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome_completo}</TableCell>
                  <TableCell>{p.telefone || '-'}</TableCell>
                  <TableCell>{p.expand?.psicologo_id?.nome_completo}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'ativo' ? 'default' : 'secondary'}>
                      {p.status || 'ativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Nenhum paciente encontrado.
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
