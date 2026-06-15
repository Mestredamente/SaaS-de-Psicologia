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
import {
  getMinhaSupervisao,
  getSessoesMinhaSupervisao,
  getCasosMinhaSupervisao,
} from '@/services/supervisao'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'

export default function MinhaSupervisao() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      const sup = await getMinhaSupervisao(user.id)
      if (!sup) return
      const sessoes = await getSessoesMinhaSupervisao(sup.id)
      const casos = await getCasosMinhaSupervisao(sup.id)
      setData({ sup, sessoes, casos })
    }
    load()
  }, [user])

  if (!data)
    return (
      <div className="p-8 text-center text-slate-500">
        Você não possui registro ativo de supervisão.
      </div>
    )

  const proximaSessao = data.sessoes.find(
    (s: any) => new Date(s.data_hora) > new Date() && s.status === 'agendada',
  )
  const supervisorName = data.sup.expand?.supervisor_id?.expand?.psicologo_id?.nome_completo

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Painel do Supervisando</h1>
        <p className="text-slate-600 mb-4">
          Acompanhe sua evolução e as sessões agendadas com seu supervisor.
        </p>

        <div className="bg-sky-50 border border-sky-100 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-sky-800">Próxima sessão com {supervisorName}</p>
            <p className="text-xl font-bold text-sky-900 mt-1">
              {proximaSessao
                ? format(new Date(proximaSessao.data_hora), "dd 'de' MMMM, 'às' HH:mm")
                : 'Nenhuma sessão agendada'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.sessoes.map((s: any) => (
                <div key={s.id} className="p-3 border rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-700">
                      {format(new Date(s.data_hora), 'dd/MM/yyyy HH:mm')}
                    </span>
                    <span className="text-xs uppercase bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                      {s.status}
                    </span>
                  </div>
                  {s.observacoes && (
                    <div className="mt-2 text-sm text-slate-600 bg-white p-2 rounded border border-dashed">
                      <span className="font-medium block text-xs text-slate-400 uppercase mb-1">
                        Anotações do Supervisor
                      </span>
                      {s.observacoes}
                    </div>
                  )}
                </div>
              ))}
              {data.sessoes.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhuma sessão registrada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Casos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.casos.map((caso: any) => (
                  <TableRow key={caso.id}>
                    <TableCell className="font-medium">
                      {caso.expand?.paciente_id?.nome_completo}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${caso.status === 'em_supervisao' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {caso.status === 'em_supervisao' ? 'Ativo' : 'Concluído'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {data.casos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-slate-500 py-6">
                      Nenhum caso em supervisão.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
