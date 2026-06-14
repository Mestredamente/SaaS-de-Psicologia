import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState<string>(new Date().getMonth().toString())
  const [patient, setPatient] = useState<any>(null)

  const [rescheduleData, setRescheduleData] = useState<{
    id: string
    date: string
    time: string
  } | null>(null)
  const [rescheduling, setRescheduling] = useState(false)

  const { toast } = useToast()

  const loadData = async () => {
    const p = await getCurrentPatient()
    if (!p) return setLoading(false)
    setPatient(p)
    try {
      const records = await pb.collection('agendamentos').getFullList({
        filter: `paciente_id="${p.id}"`,
        sort: '-data_hora',
      })
      setAgendamentos(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleReschedule = async () => {
    if (!rescheduleData) return
    setRescheduling(true)
    try {
      const novaDataHora = new Date(
        `${rescheduleData.date}T${rescheduleData.time}:00`,
      ).toISOString()
      await pb.collection('agendamentos').update(rescheduleData.id, {
        status: 'reagendado',
        data_hora: novaDataHora.replace('T', ' ').substring(0, 19) + 'Z',
      })
      toast({ title: 'Agendamento reagendado com sucesso' })
      setRescheduleData(null)
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao reagendar', variant: 'destructive' })
    } finally {
      setRescheduling(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      agendado: 'bg-blue-500 hover:bg-blue-600',
      confirmado: 'bg-green-500 hover:bg-green-600',
      realizado: 'bg-gray-500 hover:bg-gray-600',
      cancelado: 'bg-red-500 hover:bg-red-600',
      reagendado: 'bg-yellow-500 hover:bg-yellow-600',
    }
    return colors[status] || 'bg-gray-500'
  }

  const filtered = agendamentos
    .filter((a) => {
      const d = parseISO(a.data_hora)
      return d.getMonth().toString() === month
    })
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())

  if (loading) return <div>Carregando...</div>
  if (!patient) return <div>Acesso restrito.</div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Agenda</h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie suas sessões.</p>
        </div>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o mês" />
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
                    <p className="text-sm text-muted-foreground capitalize">Sessão {a.tipo}</p>
                  </div>

                  {['agendado', 'confirmado', 'reagendado'].includes(a.status) && (
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rescheduleData} onOpenChange={(open) => !open && setRescheduleData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Sessão</DialogTitle>
            <DialogDescription>Escolha a nova data e horário para sua sessão.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={rescheduleData?.date || ''}
                onChange={(e) =>
                  setRescheduleData((prev) => (prev ? { ...prev, date: e.target.value } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={rescheduleData?.time || ''}
                onChange={(e) =>
                  setRescheduleData((prev) => (prev ? { ...prev, time: e.target.value } : null))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleData(null)}>
              Cancelar
            </Button>
            <Button onClick={handleReschedule} disabled={rescheduling}>
              Confirmar Reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
