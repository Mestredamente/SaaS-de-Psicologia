import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'

export default function Prontuario() {
  const [prontuario, setProntuario] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getCurrentPatient()
      if (!p) return setLoading(false)

      try {
        const pr = await pb
          .collection('prontuarios_paciente')
          .getFirstListItem(`paciente_id="${p.id}"`)
        setProntuario(pr)
      } catch {
        /* intentionally ignored */
      }

      try {
        const hist = await pb.collection('agendamentos').getFullList({
          filter: `paciente_id="${p.id}" && status="realizado"`,
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
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Prontuário</h1>
          <p className="text-muted-foreground mt-1">Acompanhamento do seu tratamento.</p>
        </div>
        <Badge variant="outline" className="bg-muted text-muted-foreground border-dashed">
          Somente leitura
        </Badge>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="bg-sky-50/50 border-b">
          <CardTitle className="text-xl text-sky-900">Resumo do Tratamento</CardTitle>
          <CardDescription>Escrito por sua psicóloga</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {prontuario?.resumo_publico ? (
            <div
              className="prose max-w-none prose-sky"
              dangerouslySetInnerHTML={{ __html: prontuario.resumo_publico }}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum resumo disponível no momento.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm mt-8">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Histórico de Sessões Realizadas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma sessão realizada ainda.
            </p>
          ) : (
            <div className="divide-y">
              {history.map((s, idx) => (
                <div key={s.id} className="p-6 flex items-center justify-between hover:bg-muted/20">
                  <div>
                    <p className="font-semibold text-gray-900">Sessão {history.length - idx}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(s.data_hora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {s.tipo}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
