import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Calendar,
  AlertCircle,
  Video,
  MapPin,
  Activity,
  DollarSign,
  BookHeart,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, parseISO, isTomorrow, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealtime } from '@/hooks/use-realtime'
import { getCurrentPatient, getPatientStats, getNextSession } from '@/services/patientDashboard'
import pb from '@/lib/pocketbase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [nextSession, setNextSession] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const p = await getCurrentPatient()
      if (p) {
        setPatient(p)
        const [st, next] = await Promise.all([getPatientStats(p.id), getNextSession(p.id)])
        setStats(st)
        setNextSession(next)
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('agendamentos', () => loadData())
  useRealtime('pagamentos', () => loadData())
  useRealtime('diario_sentimental', () => loadData())

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const cancelSession = async (id: string) => {
    try {
      await pb.collection('agendamentos').update(id, { status: 'cancelado' })
      toast({ title: 'Sessão cancelada com sucesso' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao cancelar sessão', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in-up">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground">
          Este portal é dedicado aos pacientes. Faça login com uma conta de paciente.
        </p>
      </div>
    )
  }

  const firstName = patient.nome_completo?.split(' ')[0] || 'Paciente'
  let reminder = null
  if (nextSession) {
    const sessionDate = parseISO(nextSession.data_hora)
    if (isToday(sessionDate)) {
      reminder = `Sua próxima sessão é hoje às ${format(sessionDate, 'HH:mm')}`
    } else if (isTomorrow(sessionDate)) {
      reminder = `Sua próxima sessão é amanhã às ${format(sessionDate, 'HH:mm')}`
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Greeting & Reminder */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Olá, {firstName}. Bem-vinda de volta.
        </h1>
        {reminder && (
          <div className="mt-3 inline-flex items-center gap-2 bg-sky-100 text-sky-800 px-4 py-2 rounded-md font-medium">
            <AlertCircle className="w-4 h-4" />
            {reminder}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Sessões Realizadas este Mês
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{stats?.sessoesMes}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-sky-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-sky-800">Sessões Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-900">{stats?.agendadas}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Valor Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              {formatCurrency(stats?.valorPendente || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-pink-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-pink-800">
              Dias seguidos de diário
            </CardTitle>
            <BookHeart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-900">{stats?.streak}</div>
          </CardContent>
        </Card>
      </div>

      {/* Next Session Highlight */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-sky-600 to-blue-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 opacity-80" /> Próxima Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-100 text-sm">Com</p>
                    <p className="text-xl font-bold">
                      {nextSession.expand?.psicologo_id?.nome_completo}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-none"
                  >
                    {nextSession.tipo}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 opacity-80" />
                    <span>
                      {format(parseISO(nextSession.data_hora), "dd 'de' MMMM", { locale: ptBR })} às{' '}
                      {format(parseISO(nextSession.data_hora), 'HH:mm')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {nextSession.tipo === 'online' ? (
                    <Link
                      to="/sessoes-online"
                      className={cn(
                        buttonVariants({ variant: 'secondary' }),
                        'w-full bg-white text-sky-900 hover:bg-sky-50 flex items-center justify-center gap-2',
                      )}
                    >
                      <Video className="w-4 h-4" />
                      <span>Entrar na Sala</span>
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-sky-900 hover:bg-sky-50"
                    >
                      <MapPin className="w-4 h-4 mr-2" /> Ver Endereço
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/agenda"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full bg-transparent border-white/30 text-white hover:bg-white/10 flex items-center justify-center',
                    )}
                  >
                    Reagendar
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-red-200"
                    onClick={() => cancelSession(nextSession.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sky-100">
                Você não tem nenhuma sessão agendada.
                <div className="mt-4">
                  <Link
                    to="/agenda"
                    className={cn(
                      buttonVariants({ variant: 'secondary' }),
                      'bg-white text-sky-900 hover:bg-sky-50 flex items-center justify-center',
                    )}
                  >
                    Agendar Nova Sessão
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
