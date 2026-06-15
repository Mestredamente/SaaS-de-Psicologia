import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getSupervisorProfile, getCasosSupervisao } from '@/services/supervisao'
import { useAuth } from '@/hooks/use-auth'

export default function SupervisorCasos() {
  const { user } = useAuth()
  const [casos, setCasos] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      if (!user) return
      const profile = await getSupervisorProfile(user.id)
      if (profile) {
        setCasos(await getCasosSupervisao(profile.id))
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Casos em Supervisão</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {casos.map((caso: any) => (
          <Card key={caso.id}>
            <CardHeader>
              <CardTitle>{caso.expand?.paciente_id?.nome_completo}</CardTitle>
              <CardDescription>
                Supervisando: {caso.expand?.supervisando_id?.expand?.psicologo_id?.nome_completo}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="font-semibold text-slate-700">Demanda Principal: </span>
                <p className="text-slate-600">{caso.demanda_principal}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Descrição: </span>
                <p className="text-slate-600">{caso.descricao_caso}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Evolução: </span>
                <p className="text-slate-600">{caso.evolucao || 'Nenhum registro.'}</p>
              </div>
              <div className="pt-2 flex justify-between items-center border-t">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${caso.status === 'em_supervisao' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                >
                  {caso.status === 'em_supervisao' ? 'Em Supervisão' : 'Concluído'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {casos.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 py-12 bg-white rounded-xl border border-dashed">
            Nenhum caso sendo supervisionado no momento.
          </div>
        )}
      </div>
    </div>
  )
}
