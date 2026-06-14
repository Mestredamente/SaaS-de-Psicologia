import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function Configuracoes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [syncData, setSyncData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mockCalendars] = useState([
    { id: 'primary', name: 'Profissional - agenda@psicologia.com' },
    { id: 'personal', name: 'Pessoal' },
  ])

  useEffect(() => {
    if (!user) return
    pb.collection('google_calendar_sync')
      .getFirstListItem(`usuario_id="${user.id}"`)
      .then((record) => {
        setSyncData(record)
      })
      .catch(() => {
        setSyncData(null)
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleConnect = async () => {
    try {
      const record = await pb.collection('google_calendar_sync').create({
        usuario_id: user.id,
        tipo_usuario: user.role === 'clinica' ? 'clinica' : 'psicologo',
        status: 'ativo',
        google_calendar_id: 'primary',
        auto_sync_novos: true,
        auto_sync_atualizacoes: true,
        ultima_sincronizacao: new Date().toISOString(),
      })
      setSyncData(record)
      toast({ title: 'Conta Google conectada com sucesso!' })
    } catch (e) {
      toast({ title: 'Erro ao conectar', variant: 'destructive' })
    }
  }

  const handleDisconnect = async () => {
    if (!syncData) return
    try {
      await pb.collection('google_calendar_sync').delete(syncData.id)
      setSyncData(null)
      toast({ title: 'Conta desconectada' })
    } catch (e) {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' })
    }
  }

  const handleUpdate = async (data: any) => {
    if (!syncData) return
    try {
      const record = await pb.collection('google_calendar_sync').update(syncData.id, data)
      setSyncData(record)
      toast({ title: 'Configurações atualizadas' })
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas preferências e integrações.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Integrações</h2>

        <Card>
          <CardHeader>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Sincronize seus agendamentos com sua agenda do Google.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!syncData ? (
              <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700 text-white">
                Conectar conta Google
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium text-green-700">Status: Ativo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Última sincronização:{' '}
                      {new Date(syncData.ultima_sincronizacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Desconectar
                  </Button>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Calendário para sincronização</label>
                    <Select
                      value={syncData.google_calendar_id}
                      onValueChange={(val) => handleUpdate({ google_calendar_id: val })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um calendário" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCalendars.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between border-b pb-4 pt-4">
                    <div className="space-y-0.5 pr-4">
                      <label className="text-base font-medium">
                        Sincronizar automaticamente novos agendamentos
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Novos agendamentos serão enviados ao Google Calendar por padrão.
                      </p>
                    </div>
                    <Switch
                      checked={syncData.auto_sync_novos}
                      onCheckedChange={(val) => handleUpdate({ auto_sync_novos: val })}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5 pr-4">
                      <label className="text-base font-medium">
                        Sincronizar reagendamentos e cancelamentos
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Atualizações na agenda refletirão automaticamente no Google Calendar.
                      </p>
                    </div>
                    <Switch
                      checked={syncData.auto_sync_atualizacoes}
                      onCheckedChange={(val) => handleUpdate({ auto_sync_atualizacoes: val })}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
