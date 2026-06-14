import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'

export default function Diario() {
  const [patient, setPatient] = useState<any>(null)
  const [diarios, setDiarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    humor: '',
    intensidade: '3',
    anotacoes: '',
  })

  const load = async () => {
    const p = await getCurrentPatient()
    if (!p) return setLoading(false)
    setPatient(p)
    try {
      const records = await pb.collection('diario_sentimental').getFullList({
        filter: `paciente_id="${p.id}"`,
        sort: '-data',
      })
      setDiarios(records)
    } catch {
      /* intentionally ignored */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.humor) return toast({ title: 'Selecione um humor', variant: 'destructive' })
    setSaving(true)
    try {
      await pb.collection('diario_sentimental').create({
        paciente_id: patient.id,
        data: new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z',
        humor: formData.humor,
        intensidade: parseInt(formData.intensidade),
        anotacoes: formData.anotacoes,
      })
      toast({ title: 'Registro adicionado com sucesso!' })
      setFormData({ humor: '', intensidade: '3', anotacoes: '' })
      load()
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const entry = diarios.find(
      (x) => format(parseISO(x.data), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'),
    )
    return { date: format(d, 'dd/MM'), intensidade: entry ? entry.intensidade : null }
  })

  if (loading) return <div>Carregando...</div>
  if (!patient) return <div>Acesso restrito.</div>

  const emojis: any = { ótimo: '🤩', bom: '🙂', neutro: '😐', ruim: '😔', péssimo: '😫' }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Diário Sentimental</h1>
        <p className="text-muted-foreground mt-1">
          Registre como você se sente todos os dias para acompanhar sua evolução.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm bg-pink-50/30">
          <CardHeader>
            <CardTitle>Novo Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Como você está se sentindo hoje?</Label>
                <Select
                  value={formData.humor}
                  onValueChange={(v) => setFormData({ ...formData, humor: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {['ótimo', 'bom', 'neutro', 'ruim', 'péssimo'].map((h) => (
                      <SelectItem key={h} value={h}>
                        {emojis[h]} {h.charAt(0).toUpperCase() + h.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Intensidade (1 a 5)</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    className="w-full accent-pink-500"
                    value={formData.intensidade}
                    onChange={(e) => setFormData({ ...formData, intensidade: e.target.value })}
                  />
                  <span className="font-bold w-4 text-center">{formData.intensidade}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Anotações (opcional)</Label>
                <Textarea
                  placeholder="Escreva algo sobre o seu dia..."
                  value={formData.anotacoes}
                  onChange={(e) => setFormData({ ...formData, anotacoes: e.target.value })}
                  className="resize-none h-24"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar no Diário'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm h-[320px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evolução do Humor (Últimos 14 dias)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))' }} />
                  <Line
                    type="monotone"
                    dataKey="intensidade"
                    stroke="#db2777"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#db2777' }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Últimos Registros</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {diarios.slice(0, 7).map((d) => (
                  <div key={d.id} className="p-4 flex items-start gap-4">
                    <div className="text-3xl">{emojis[d.humor]}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold capitalize text-gray-900">
                          {d.humor} (Nível {d.intensidade})
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(d.data), "dd 'de' MMM", { locale: ptBR })}
                        </span>
                      </div>
                      {d.anotacoes && (
                        <p className="text-sm text-gray-600 line-clamp-2">{d.anotacoes}</p>
                      )}
                    </div>
                  </div>
                ))}
                {diarios.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum registro ainda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
