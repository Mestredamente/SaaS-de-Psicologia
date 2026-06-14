import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { ContratoTerapeutico, getContratos } from '@/services/contratos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function Contratos() {
  const { user } = useAuth()
  const [contratos, setContratos] = useState<ContratoTerapeutico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const perfis = await pb
          .collection('perfis_psicologos')
          .getList(1, 1, { filter: `user_id = "${user?.id}"` })
        if (perfis.items.length > 0) {
          const res = await getContratos(perfis.items[0].id)
          setContratos(res)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) load()
  }, [user?.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rascunho':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'enviado':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Enviado</Badge>
      case 'assinado':
        return <Badge className="bg-green-500 hover:bg-green-600">Assinado</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Contratos Terapêuticos</h1>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link to="/contratos-terapeuticos/novo">Gerar Novo Contrato</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando contratos...</p>
          ) : contratos.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum contrato encontrado. Comece gerando um novo contrato para seus pacientes.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número do Contrato</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-slate-700">
                        {c.numero_contrato}
                      </TableCell>
                      <TableCell>{c.expand?.paciente_id?.nome_completo || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(c.data_emissao), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/contratos-terapeuticos/${c.id}`}>Visualizar</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
