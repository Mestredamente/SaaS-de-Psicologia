import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotificacoes } from '@/hooks/use-notificacoes'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function NotificationHeader() {
  const { notificacoes, unreadCount, handleMarkAsRead } = useNotificacoes()
  const navigate = useNavigate()

  const recent = notificacoes.slice(0, 5)

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return 'bg-yellow-500'
      case 'urgente':
        return 'bg-red-500'
      case 'sucesso':
        return 'bg-green-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificações
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              {unreadCount} não lida{unreadCount !== 1 && 's'}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {recent.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação recente.
            </div>
          ) : (
            recent.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  if (n.status === 'nao_lida') handleMarkAsRead(n.id)
                  if (n.link_acao) navigate(n.link_acao)
                }}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', getTypeColor(n.tipo))} />
                    <span
                      className={cn(
                        'font-medium text-sm',
                        n.status === 'nao_lida' ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {n.titulo}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(n.data_envio), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-xs line-clamp-2',
                    n.status === 'nao_lida' ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {n.mensagem}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="outline" className="w-full text-xs" asChild>
            <Link to="/notificacoes">Ver todas as notificações</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
