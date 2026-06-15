import { useEffect, useState } from 'react'
import { getUsuarios, getAssinaturas } from '@/services/admin'
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
import { Button } from '@/components/ui/button'
import { Search, UserX } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [assinaturas, setAssinaturas] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [typeFilter, setTypeFilter] = useState('todos')

  const loadData = async () => {
    try {
      const [users, subs, pacs] = await Promise.all([
        getUsuarios(),
        getAssinaturas(),
        pb.collection('pacientes').getFullList({ expand: 'psicologo_id', sort: '-created' }),
      ])
      setUsuarios(users)
      setAssinaturas(subs)
      setPacientes(pacs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getUserSub = (userId: string) => assinaturas.find((a) => a.usuario_id === userId)

  const handleAnonymize = async (id: string) => {
    if (
      !confirm(
        'Tem certeza que deseja anonimizar este paciente? Esta ação não pode ser desfeita e garantirá o direito ao esquecimento (LGPD).',
      )
    )
      return
    try {
      await pb.send(`/backend/v1/anonymize-patient/${id}`, { method: 'POST' })
      toast({ title: 'Paciente anonimizado com sucesso' })
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro ao anonimizar', description: e.message, variant: 'destructive' })
    }
  }

  const filteredUsers = usuarios.filter((u) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (u.nome_completo || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'todos' || u.status === statusFilter
    const matchesType = typeFilter === 'todos' || u.role === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredPacientes = pacientes.filter((p) => {
    const q = search.toLowerCase()
    return (
      (p.nome_completo || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q)
    )
  })

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Diretório do Sistema</h1>
        <p className="text-muted-foreground">
          Gestão de profissionais, clínicas e pacientes (Acesso LGPD).
        </p>
      </div>

      <Tabs defaultValue="profissionais">
        <TabsList className="mb-4">
          <TabsTrigger value="profissionais">Profissionais & Clínicas</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
        </TabsList>

        <TabsContent value="profissionais" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="psicologo">Psicólogos</SelectItem>
                  <SelectItem value="clinica">Clínicas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Plano Atual</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const sub = getUserSub(u.id)
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-slate-900">
                          {u.nome_completo || u.name}
                        </TableCell>
                        <TableCell className="text-slate-600">{u.email}</TableCell>
                        <TableCell className="capitalize text-slate-600">{u.role}</TableCell>
                        <TableCell>
                          {sub ? (
                            <span className="font-medium text-blue-700">
                              {sub.expand?.plano_id?.nome}
                            </span>
                          ) : (
                            <span className="text-slate-400">Sem Assinatura</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {format(new Date(u.created), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              u.status === 'ativo'
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                : 'border-slate-200 text-slate-600 bg-slate-50'
                            }
                          >
                            {u.status || 'ativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum profissional encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pacientes" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes..."
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
                    <TableHead>Nome do Paciente</TableHead>
                    <TableHead>Email / CPF</TableHead>
                    <TableHead>Psicólogo Vinculado</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead className="text-right">Ações (LGPD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPacientes.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-slate-900">
                        {p.nome_completo}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {p.email || 'Sem email'} <br />
                        <span className="text-xs text-slate-400">{p.cpf || 'Sem CPF'}</span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {p.expand?.psicologo_id?.nome_completo}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {format(new Date(p.created), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnonymize(p.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={p.nome_completo === 'ANONIMIZADO'}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Anonimizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPacientes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum paciente encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
