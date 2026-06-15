import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNotificacoes } from '@/hooks/use-notificacoes'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Calendar, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function Notificacoes() {
  const { notificacoes, loading, handleMarkAsRead, handleMarkAllAsRead, unreadCount } =
    useNotificacoes()
  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [periodFilter, setPeriodFilter] = useState<string>('todos')

  const filteredNotificacoes = useMemo(() => {
    let filtered = notificacoes

    if (statusFilter !== 'todas') {
      filtered = filtered.filter((n) => n.status === statusFilter)
    }

    if (periodFilter !== 'todos') {
      const now = new Date()
      const msPerDay = 24 * 60 * 60 * 1000
      filtered = filtered.filter((n) => {
        const diff = now.getTime() - new Date(n.data_envio).getTime()
        const days = diff / msPerDay
        if (periodFilter === '7d') return days <= 7
        if (periodFilter === '30d') return days <= 30
        return true
      })
    }

    return filtered
  }, [notificacoes, statusFilter, periodFilter])

  const getIconInfo = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
      case 'urgente':
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' }
      case 'sucesso':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' }
      default:
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central de Notificações</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe todos os alertas e mensagens do sistema.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" className="shrink-0">
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="p-4 border-b bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle className="text-lg">Histórico</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="nao_lida">Não Lidas</SelectItem>
                  <SelectItem value="lida">Lidas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo o período</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando notificações...</div>
          ) : filteredNotificacoes.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-900">Nenhuma notificação encontrada.</p>
              <p className="text-sm text-slate-500 mt-1">Tente ajustar seus filtros de busca.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotificacoes.map((n) => {
                const { icon: Icon, color, bg } = getIconInfo(n.tipo)
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'p-4 sm:p-5 flex gap-4 transition-colors hover:bg-slate-50',
                      n.status === 'nao_lida' ? 'bg-slate-50/70' : '',
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                        bg,
                      )}
                    >
                      <Icon className={cn('w-5 h-5', color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 mb-1">
                        <h4
                          className={cn(
                            'font-medium truncate',
                            n.status === 'nao_lida' ? 'text-slate-900' : 'text-slate-700',
                          )}
                        >
                          {n.titulo}
                        </h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(n.data_envio), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-sm leading-relaxed',
                          n.status === 'nao_lida' ? 'text-slate-700' : 'text-slate-500',
                        )}
                      >
                        {n.mensagem}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        {n.link_acao && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-primary font-medium"
                            asChild
                          >
                            <Link to={n.link_acao}>Ver detalhes</Link>
                          </Button>
                        )}
                        {n.status === 'nao_lida' && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-slate-500 hover:text-slate-900"
                            onClick={() => handleMarkAsRead(n.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
