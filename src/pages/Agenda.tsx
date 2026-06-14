import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Plus } from 'lucide-react'

export default function Agenda() {
  const { user } = useAuth()
  const isPsychologist = user?.role === 'psicologo'
  const isPatient = user?.role === 'paciente'

  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState<string>(new Date().getMonth().toString())

  const [psyProfile, setPsiProfile] = useState<any>(null)
  const [patientsList, setPatientsList] = useState<any[]>([])
  const [syncSettings, setSyncSettings] = useState<any>(null)

  const [rescheduleData, setRescheduleData] = useState<any>(null)
  const [editData, setEditData] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      if (isPatient) {
        const p = await getCurrentPatient()
        if (!p) return setLoading(false)
        const records = await pb
          .collection('agendamentos')
          .getFullList({
            filter: `paciente_id="${p.id}"`,
            sort: '-data_hora',
            expand: 'psicologo_id',
          })
        setAgendamentos(records)
      } else if (isPsychologist) {
        const perfil = await pb
          .collection('perfis_psicologos')
          .getFirstListItem(`user_id="${user.id}"`)
        setPsiProfile(perfil)
        const [records, patients, sync] = await Promise.all([
          pb
            .collection('agendamentos')
            .getFullList({
              filter: `psicologo_id="${perfil.id}"`,
              sort: '-data_hora',
              expand: 'paciente_id',
            }),
          pb.collection('pacientes').getFullList({ filter: `psicologo_id="${perfil.id}"` }),
          pb
            .collection('google_calendar_sync')
            .getFirstListItem(`usuario_id="${user.id}" && status="ativo"`)
            .catch(() => null),
        ])
        setAgendamentos(records)
        setPatientsList(patients)
        setSyncSettings(sync)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handlePatientReschedule = async () => {
    if (!rescheduleData) return
    setSaving(true)
    try {
      const novaDataHora = new Date(
        `${rescheduleData.date}T${rescheduleData.time}:00`,
      ).toISOString()
      await pb.collection('agendamentos').update(rescheduleData.id, {
        status: 'reagendado',
        data_hora: novaDataHora.replace('T', ' ').substring(0, 19) + 'Z',
      })
      toast({ title: 'Sessão reagendada' })
      setRescheduleData(null)
      loadData()
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handlePsySave = async () => {
    if (!editData) return
    setSaving(true)
    try {
      const isoDate = new Date(`${editData.date}T${editData.time}:00`).toISOString()
      const data = {
        paciente_id: editData.paciente_id,
        psicologo_id: psyProfile.id,
        data_hora: isoDate.replace('T', ' ').substring(0, 19) + 'Z',
        tipo: editData.tipo,
        status: editData.status,
        valor: 0,
      }
      let record
      if (editData.id) record = await pb.collection('agendamentos').update(editData.id, data)
      else record = await pb.collection('agendamentos').create(data)

      if (editData.syncGoogle && syncSettings) {
        await pb.send('/backend/v1/google-calendar/sync-event', {
          method: 'POST',
          body: JSON.stringify({ agendamento_id: record.id }),
        })
      }
      toast({ title: 'Salvo com sucesso' })
      setEditData(null)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (s: string) =>
    ({
      agendado: 'bg-blue-500',
      confirmado: 'bg-green-500',
      realizado: 'bg-gray-500',
      cancelado: 'bg-red-500',
      reagendado: 'bg-yellow-500',
    })[s] || 'bg-gray-500'

  const filtered = agendamentos.filter((a) => parseISO(a.data_hora).getMonth().toString() === month)

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Agenda</h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie suas sessões.</p>
        </div>
        <div className="flex items-center gap-2">
          {isPsychologist && (
            <Button
              onClick={() =>
                setEditData({
                  date: format(new Date(), 'yyyy-MM-dd'),
                  time: '09:00',
                  tipo: 'online',
                  status: 'agendado',
                  paciente_id: '',
                  syncGoogle: syncSettings?.auto_sync_novos || false,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
            </Button>
          )}
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }).map((_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {format(new Date(2020, i, 1), 'MMMM', { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Nenhuma sessão neste mês.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold">
                        {format(parseISO(a.data_hora), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        às {format(parseISO(a.data_hora), 'HH:mm')}
                      </span>
                      <Badge
                        className={`${getStatusColor(a.status)} text-white border-none uppercase text-[10px]`}
                      >
                        {a.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      Sessão {a.tipo} •{' '}
                      {isPsychologist
                        ? a.expand?.paciente_id?.nome_completo
                        : a.expand?.psicologo_id?.nome_completo}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isPatient && ['agendado', 'confirmado', 'reagendado'].includes(a.status) && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setRescheduleData({
                            id: a.id,
                            date: format(parseISO(a.data_hora), 'yyyy-MM-dd'),
                            time: format(parseISO(a.data_hora), 'HH:mm'),
                          })
                        }
                      >
                        Reagendar
                      </Button>
                    )}
                    {isPsychologist && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEditData({
                            id: a.id,
                            date: format(parseISO(a.data_hora), 'yyyy-MM-dd'),
                            time: format(parseISO(a.data_hora), 'HH:mm'),
                            tipo: a.tipo,
                            status: a.status,
                            paciente_id: a.paciente_id,
                            syncGoogle: syncSettings?.auto_sync_atualizacoes || false,
                          })
                        }
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isPatient && (
        <Dialog open={!!rescheduleData} onOpenChange={(open) => !open && setRescheduleData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reagendar Sessão</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={rescheduleData?.date || ''}
                  onChange={(e) => setRescheduleData((p: any) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={rescheduleData?.time || ''}
                  onChange={(e) => setRescheduleData((p: any) => ({ ...p, time: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRescheduleData(null)}>
                Cancelar
              </Button>
              <Button onClick={handlePatientReschedule} disabled={saving}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isPsychologist && (
        <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editData?.id ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            </DialogHeader>
            {editData && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select
                    value={editData.paciente_id}
                    onValueChange={(v) => setEditData((p: any) => ({ ...p, paciente_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsList.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData((p: any) => ({ ...p, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={editData.time}
                      onChange={(e) => setEditData((p: any) => ({ ...p, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={editData.tipo}
                      onValueChange={(v) => setEditData((p: any) => ({ ...p, tipo: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editData.status}
                      onValueChange={(v) => setEditData((p: any) => ({ ...p, status: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="realizado">Realizado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {syncSettings && (
                  <div className="flex items-center space-x-2 pt-4 mt-2 border-t">
                    <Checkbox
                      id="sync-google"
                      checked={editData.syncGoogle}
                      onCheckedChange={(v) => setEditData((p: any) => ({ ...p, syncGoogle: !!v }))}
                    />
                    <Label htmlFor="sync-google" className="cursor-pointer">
                      Enviar para Google Calendar
                    </Label>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditData(null)}>
                Cancelar
              </Button>
              <Button onClick={handlePsySave} disabled={saving}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
