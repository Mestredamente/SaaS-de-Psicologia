import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookHeart, Loader2, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PacienteDiario() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState<any>(null)
  const [diarios, setDiarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    try {
      const p = await pb.collection('pacientes').getOne(id)
      setPaciente(p)

      const d = await pb.collection('diario_sentimental').getFullList({
        filter: `paciente_id="${id}"`,
        sort: '-data',
      })
      setDiarios(d)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('diario_sentimental', () => {
    loadData()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!paciente) {
    return <div className="p-6">Paciente não encontrado.</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/pacientes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Diário Sentimental</h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <BookHeart className="w-4 h-4" />
            {paciente.nome_completo}
          </p>
        </div>
      </div>

      {diarios.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-500 flex flex-col items-center">
            <BookHeart className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">Nenhum registro encontrado</p>
            <p>Este paciente ainda não escreveu no diário sentimental.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {diarios.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      {format(new Date(d.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                      Registrado às {format(new Date(d.created), 'HH:mm')}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white px-3 py-1">
                      <span className="text-muted-foreground mr-1">Humor:</span>
                      <span className="capitalize font-semibold text-slate-700">{d.humor}</span>
                    </Badge>
                    <Badge variant="outline" className="bg-white px-3 py-1">
                      <span className="text-muted-foreground mr-1">Intensidade:</span>
                      <span className="font-semibold text-slate-700">{d.intensidade}/10</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {d.anotacoes ? (
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {d.anotacoes}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">
                    O paciente não deixou anotações detalhadas para este dia.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
