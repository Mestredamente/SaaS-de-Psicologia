import { AlertCircle, WifiOff, FolderX, Lock, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorType = 'connection' | 'not_found' | 'access_denied' | 'save' | 'session_expired'

interface ErrorMessageProps {
  type: ErrorType
  className?: string
  onRetry?: () => void
}

export function ErrorMessage({ type, className = '', onRetry }: ErrorMessageProps) {
  const config = {
    connection: {
      icon: WifiOff,
      title: 'Erro de Conexão',
      text: 'Estamos com dificuldades para conectar. Verifique sua internet e tente novamente.',
    },
    not_found: {
      icon: FolderX,
      title: 'Não Encontrado',
      text: 'Nada encontrado por aqui. Que tal adicionar um novo registro?',
    },
    access_denied: {
      icon: Lock,
      title: 'Acesso Negado',
      text: 'Você não tem permissão para acessar esta área. Entre com outro perfil ou fale com o administrador.',
    },
    save: {
      icon: AlertCircle,
      title: 'Erro ao Salvar',
      text: 'Não conseguimos salvar agora. Tente novamente em alguns instantes.',
    },
    session_expired: {
      icon: Clock,
      title: 'Sessão Expirada',
      text: 'Sua sessão expirou. Faça login novamente para continuar.',
    },
  }

  const { icon: Icon, title, text } = config[type]

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-2xl border border-red-100 animate-in fade-in ${className}`}
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-red-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-red-700 font-medium max-w-md mb-6 leading-relaxed">{text}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="text-red-700 border-red-200 bg-white hover:bg-red-50 hover:text-red-800 rounded-full font-semibold transition-colors"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
