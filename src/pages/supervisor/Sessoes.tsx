import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getSupervisorProfile,
  getSessoesSupervisao,
  getSupervisandos,
  createSessaoSupervisao,
} from '@/services/supervisao'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'

export default function SupervisorSessoes() {
  const { user } = useAuth()
  const [sessoes, setSessoes] = useState<any[]>([])
  const [supervisandos, setSupervisandos] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [open, setOpen] = useState(false)

  // form state
  const [supervisandoId, setSupervisandoId] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [tipo, setTipo] = useState('individual')
  const [observacoes, setObservacoes] = useState('')

  async function loadData() {
    if (!user) return
    const prof = await getSupervisorProfile(user.id)
    if (prof) {
      setProfile(prof)
      setSupervisandos(await getSupervisandos(prof.id))
      setSessoes(await getSessoesSupervisao(prof.id))
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleCreate = async () => {
    if (!supervisandoId || !dataHora) return
    await createSessaoSupervisao({
      supervisor_id: profile.id,
      supervisando_id: supervisandoId,
      data_hora: new Date(dataHora).toISOString(),
      tipo,
      status: 'agendada',
      observacoes,
    })
    setOpen(false)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Sessões de Supervisão</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nova Sessão</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Sessão</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Supervisando</Label>
                <Select value={supervisandoId} onValueChange={setSupervisandoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisandos.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.expand?.psicologo_id?.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Data e Hora</Label>
                <Input
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="grupo">Grupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Observações Iniciais</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>
              <Button onClick={handleCreate} className="mt-2">
                Salvar Sessão
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Supervisando</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessoes.map((sessao: any) => (
                <TableRow key={sessao.id}>
                  <TableCell>{format(new Date(sessao.data_hora), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {sessao.expand?.supervisando_id?.expand?.psicologo_id?.nome_completo}
                  </TableCell>
                  <TableCell className="capitalize">{sessao.tipo}</TableCell>
                  <TableCell className="capitalize">{sessao.status}</TableCell>
                </TableRow>
              ))}
              {sessoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                    Nenhuma sessão encontrada.
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
