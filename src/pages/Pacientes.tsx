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
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Users, BookHeart, Activity } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { format, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Pacientes() {
  const { user } = useAuth()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [diarios, setDiarios] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      // 1. Get psicologo profile
      const psicologo = await pb
        .collection('perfis_psicologos')
        .getFirstListItem(`user_id="${user.id}"`)

      // 2. Get pacientes
      const pRecords = await pb.collection('pacientes').getFullList({
        filter: `psicologo_id="${psicologo.id}"`,
        sort: 'nome_completo',
      })
      setPacientes(pRecords)

      // 3. Get diarios
      if (pRecords.length > 0) {
        const pacienteIds = pRecords.map((p) => `paciente_id="${p.id}"`).join(' || ')
        const dRecords = await pb.collection('diario_sentimental').getFullList({
          filter: pacienteIds,
          sort: '-data',
        })

        const latestDiarios: Record<string, any> = {}
        for (const d of dRecords) {
          if (
            !latestDiarios[d.paciente_id] ||
            new Date(d.data) > new Date(latestDiarios[d.paciente_id].data)
          ) {
            latestDiarios[d.paciente_id] = d
          }
        }
        setDiarios(latestDiarios)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('diario_sentimental', () => {
    loadData()
  })

  useRealtime('pacientes', () => {
    loadData()
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meus Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seus pacientes e a atividade do diário sentimental.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : pacientes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p>Nenhum paciente encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Entrada no Diário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.map((p) => {
                  const diario = diarios[p.id]
                  const isNew =
                    diario && differenceInHours(new Date(), new Date(diario.created)) < 24

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-slate-900">
                        {p.nome_completo}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === 'ativo' ? 'default' : 'secondary'}
                          className={
                            p.status === 'ativo'
                              ? 'bg-teal-100 text-teal-800 hover:bg-teal-100'
                              : ''
                          }
                        >
                          {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {diario ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-700 flex items-center gap-1.5 font-medium">
                              <Activity className="w-4 h-4 text-slate-400" />
                              {format(new Date(diario.data), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            {isNew && (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 animate-pulse">
                                Novo
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Sem registros</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 text-teal-700 border-teal-200 hover:bg-teal-50"
                          >
                            <Link to={`/pacientes/${p.id}/diario`}>
                              <BookHeart className="w-4 h-4 mr-1.5" />
                              Ver Diário
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
