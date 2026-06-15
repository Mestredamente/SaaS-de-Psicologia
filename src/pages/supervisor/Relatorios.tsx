import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getSupervisorProfile, getSessoesSupervisao, getSupervisandos } from '@/services/supervisao'
import { useAuth } from '@/hooks/use-auth'
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SupervisorRelatorios() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      if (!user) return
      const profile = await getSupervisorProfile(user.id)
      if (!profile) return

      const sessoes = await getSessoesSupervisao(profile.id)
      const supervisandos = await getSupervisandos(profile.id)

      const relData = supervisandos.map((sup) => {
        const count = sessoes.filter((s) => s.supervisando_id === sup.id).length
        return {
          nome: sup.expand?.psicologo_id?.nome_completo?.split(' ')[0] || 'Desconhecido',
          sessoes: count,
        }
      })

      setData(relData)
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Relatórios de Supervisão</h1>
        <p className="text-slate-500">Métricas gerais de acompanhamento de seus supervisandos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessões por Supervisando</CardTitle>
          <CardDescription>
            Total de sessões agendadas ou realizadas por profissional supervisionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="nome"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="sessoes" fill="#059669" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Sem dados suficientes.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
