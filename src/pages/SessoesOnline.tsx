import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Calendar, Clock, HelpCircle } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { format, parseISO, startOfDay, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'

const enterRoom = async (agendamento: any, role: string, navigate: any) => {
  let sessao
  try {
    sessao = await pb
      .collection('sessoes_online')
      .getFirstListItem(`agendamento_id="${agendamento.id}"`)
  } catch (e) {
    sessao = await pb.collection('sessoes_online').create({
      agendamento_id: agendamento.id,
      psicologo_id: agendamento.psicologo_id,
      paciente_id: agendamento.paciente_id,
      link_sala: `sala-${agendamento.id}`,
      status: 'aguardando',
    })
  }

  if (role === 'psicologo' && sessao.status === 'aguardando') {
    sessao = await pb.collection('sessoes_online').update(sessao.id, {
      status: 'em_andamento',
      hora_inicio: new Date().toISOString(),
    })
  }

  navigate(
    role === 'paciente' ? `/paciente/sala-virtual/${sessao.id}` : `/sala-virtual/${sessao.id}`,
  )
}

export default function SessoesOnline() {
  const { user } = useAuth()
  const isPsych = user?.role === 'psicologo'

  if (isPsych) return <PsychSessoes user={user} />
  return <PatientSessoes user={user} />
}

function PsychSessoes({ user }: { user: any }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const p = await pb.collection('perfis_psicologos').getFirstListItem(`user_id="${user.id}"`)
        const today = startOfDay(new Date()).toISOString()
        const nextWeek = addDays(new Date(), 7).toISOString()

        const agendamentos = await pb.collection('agendamentos').getFullList({
          filter: `psicologo_id="${p.id}" && tipo="online" && data_hora >= "${today}" && data_hora <= "${nextWeek}" && (status="agendado" || status="confirmado" || status="reagendado")`,
          sort: 'data_hora',
          expand: 'paciente_id',
        })
        setSessions(agendamentos)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessões Online</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas salas virtuais para os próximos 7 dias.
        </p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-slate-800">Próximas Sessões ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <EmptyState
              icon={Video}
              title="Sua agenda está livre."
              description="Nenhuma sessão online agendada para os próximos 7 dias."
            />
          ) : (
            <div className="divide-y">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-lg text-slate-900">
                      {s.expand?.paciente_id?.nome_completo}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />{' '}
                        {format(parseISO(s.data_hora), 'dd/MM/yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />{' '}
                        {format(parseISO(s.data_hora), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => enterRoom(s, 'psicologo', navigate)}
                    size="lg"
                    className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
                  >
                    <Video className="w-4 h-4 mr-2" /> Iniciar Sala
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PatientSessoes({ user }: { user: any }) {
  const navigate = useNavigate()
  const [nextSession, setNextSession] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getCurrentPatient()
      if (!p) return setLoading(false)

      const now = new Date().toISOString()

      try {
        const next = await pb
          .collection('agendamentos')
          .getFirstListItem(
            `paciente_id="${p.id}" && tipo="online" && data_hora >= "${now}" && (status="agendado" || status="confirmado" || status="reagendado")`,
            { sort: 'data_hora', expand: 'psicologo_id' },
          )
        setNextSession(next)
      } catch {
        /* intentionally ignored */
      }

      try {
        const hist = await pb.collection('agendamentos').getFullList({
          filter: `paciente_id="${p.id}" && tipo="online" && status="realizado"`,
          sort: '-data_hora',
        })
        setHistory(hist)
      } catch {
        /* intentionally ignored */
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessões Online</h1>
        <p className="text-muted-foreground mt-1">
          Acesse sua sala virtual e veja o histórico de atendimentos online.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-md overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-300" /> Próxima sessão online
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            {nextSession ? (
              <div className="space-y-6">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Psicóloga</p>
                  <p className="text-2xl font-bold">
                    {nextSession.expand?.psicologo_id?.nome_completo}
                  </p>
                </div>

                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-300" />
                    <span className="font-medium text-lg">
                      {format(parseISO(nextSession.data_hora), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-300" />
                    <span className="font-medium text-lg">
                      {format(parseISO(nextSession.data_hora), 'HH:mm')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => enterRoom(nextSession, 'paciente', navigate)}
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg h-14 px-8 shadow-lg shadow-blue-500/20"
                  >
                    Entrar na Sala
                  </Button>
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <HelpCircle className="w-6 h-6 text-blue-300 hover:text-white transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white text-slate-800 border-none shadow-xl">
                      <p className="font-medium">
                        Requer câmera e microfone habilitados no navegador
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <p className="text-blue-200 text-lg">Você não possui sessões online agendadas.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-sky-50">
          <CardHeader>
            <CardTitle className="text-lg text-sky-900">Preparação para a Sessão</CardTitle>
            <CardDescription>Dicas para uma boa experiência</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sky-800 font-medium leading-relaxed">
              Use fones de ouvido, procure um local tranquilo, teste sua câmera e microfone antes da
              sessão.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle>Histórico de Sessões Online</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {history.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma sessão online realizada.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                      <Video className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-800">
                      {format(parseISO(h.data_hora), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                      {format(parseISO(h.data_hora), 'HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
