import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageCircle } from 'lucide-react'
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
  const [wppConfig, setWppConfig] = useState<any>(null)
  const [wppPreviewType, setWppPreviewType] = useState('confirmacao')
  const [loading, setLoading] = useState(true)

  const [mockCalendars] = useState([
    { id: 'primary', name: 'Profissional - agenda@psicologia.com' },
    { id: 'personal', name: 'Pessoal' },
  ])

  const previewTemplates: Record<string, string> = {
    confirmacao:
      'Olá João, sua sessão com a Dra. Maria foi agendada para 25/10/2026 às 14:00. Tipo: online. Endereço: Link do Meet. Responda CANCELAR se precisar desmarcar.',
    lembrete_consulta:
      'Olá João, lembramos que você tem uma sessão agendada amanhã dia 25/10/2026 às 14:00 com a Dra. Maria. Tipo: online. Endereço: Link do Meet. Responda CONFIRMAR para confirmar ou CANCELAR para cancelar.',
    reagendamento:
      'Olá João, sua sessão com a Dra. Maria foi reagendada para 26/10/2026 às 15:00. Tipo: online. Link: Link do Meet. Responda CONFIRMAR para confirmar.',
    cancelamento:
      'Olá João, sua sessão do dia 25/10/2026 às 14:00 com a Dra. Maria foi cancelada. Entre em contato para reagendar.',
  }

  useEffect(() => {
    if (!user) return
    const loadSettings = async () => {
      try {
        const sync = await pb
          .collection('google_calendar_sync')
          .getFirstListItem(`usuario_id="${user.id}"`)
          .catch(() => null)
        setSyncData(sync)

        const wpp = await pb
          .collection('whatsapp_config')
          .getFirstListItem(`usuario_id="${user.id}"`)
          .catch(() => ({
            telefone: '',
            lembrete_24h: true,
            confirmacao_agendamento: true,
            notificacao_reagendamento: true,
            notificacao_cancelamento: true,
          }))
        setWppConfig(wpp)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
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

  const handleWppUpdate = async (field: string, value: any) => {
    const newData = { ...wppConfig, [field]: value }
    setWppConfig(newData)
    try {
      if (wppConfig.id) {
        await pb.collection('whatsapp_config').update(wppConfig.id, { [field]: value })
      } else {
        const r = await pb.collection('whatsapp_config').create({ usuario_id: user.id, ...newData })
        setWppConfig(r)
      }
      toast({ title: 'Configurações do WhatsApp salvas' })
    } catch (e) {
      toast({ title: 'Erro ao salvar configurações', variant: 'destructive' })
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
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              Notificações WhatsApp
            </CardTitle>
            <CardDescription>
              Configure o envio automático de mensagens para seus pacientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="telefone">Seu Número de Telefone (DDD + Número)</Label>
                <Input
                  id="telefone"
                  placeholder="Ex: 11999999999"
                  value={wppConfig?.telefone || ''}
                  onChange={(e) => setWppConfig({ ...wppConfig, telefone: e.target.value })}
                  onBlur={(e) => handleWppUpdate('telefone', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Usado como remente caso integre com API oficial no futuro.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Gatilhos de Envio Automático</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-base font-normal">
                      Ativar lembrete automático 24 horas antes da consulta
                    </Label>
                  </div>
                  <Switch
                    checked={wppConfig?.lembrete_24h}
                    onCheckedChange={(val) => handleWppUpdate('lembrete_24h', val)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-base font-normal">
                      Ativar confirmação automática ao agendar
                    </Label>
                  </div>
                  <Switch
                    checked={wppConfig?.confirmacao_agendamento}
                    onCheckedChange={(val) => handleWppUpdate('confirmacao_agendamento', val)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-base font-normal">
                      Ativar notificação de reagendamento
                    </Label>
                  </div>
                  <Switch
                    checked={wppConfig?.notificacao_reagendamento}
                    onCheckedChange={(val) => handleWppUpdate('notificacao_reagendamento', val)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <Label className="text-base font-normal">
                      Ativar notificação de cancelamento
                    </Label>
                  </div>
                  <Switch
                    checked={wppConfig?.notificacao_cancelamento}
                    onCheckedChange={(val) => handleWppUpdate('notificacao_cancelamento', val)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Preview da Mensagem</h3>
                <Select value={wppPreviewType} onValueChange={setWppPreviewType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmacao">Confirmação</SelectItem>
                    <SelectItem value="lembrete_consulta">Lembrete 24h</SelectItem>
                    <SelectItem value="reagendamento">Reagendamento</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-green-50 p-4 rounded-xl rounded-tl-none max-w-[80%] text-green-950 shadow-sm border border-green-100">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {previewTemplates[wppPreviewType]}
                </p>
                <div className="text-[10px] text-green-700/60 text-right mt-1 font-medium">
                  10:42
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
