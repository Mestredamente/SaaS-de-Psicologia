import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Calendar, Clock, MonitorPlay, Wifi, Headphones } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'

export default function SessoesOnline() {
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
              <Video className="w-6 h-6 text-blue-300" /> Próxima Sessão Online
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

                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg h-14 px-8 shadow-lg shadow-blue-500/20"
                >
                  Entrar na Sala Virtual
                </Button>
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
          <CardContent className="space-y-4">
            <div className="flex gap-3 text-sky-800">
              <Wifi className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                Certifique-se de que sua conexão com a internet está estável.
              </p>
            </div>
            <div className="flex gap-3 text-sky-800">
              <MonitorPlay className="w-5 h-5 shrink-0" />
              <p className="text-sm">Encontre um ambiente silencioso, privado e bem iluminado.</p>
            </div>
            <div className="flex gap-3 text-sky-800">
              <Headphones className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                O uso de fones de ouvido melhora a qualidade do áudio e garante maior privacidade.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader className="border-b">
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
                    className="bg-muted/30 p-4 rounded-lg border flex flex-col items-center text-center"
                  >
                    <Video className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="font-medium text-gray-900">
                      {format(parseISO(h.data_hora), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
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
