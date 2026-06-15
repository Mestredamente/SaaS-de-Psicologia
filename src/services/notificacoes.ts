import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Notificacao extends RecordModel {
  usuario_id: string
  tipo: 'sistema' | 'usuario' | 'alerta' | 'urgente' | 'sucesso'
  titulo: string
  mensagem: string
  status: 'lida' | 'nao_lida'
  link_acao?: string
  data_envio: string
}

export const getNotificacoes = async (
  params: { filter?: string; sort?: string; page?: number; perPage?: number } = {},
) => {
  return pb
    .collection<Notificacao>('notificacoes')
    .getList(params.page || 1, params.perPage || 50, {
      filter: params.filter,
      sort: params.sort || '-data_envio',
    })
}

export const markAsRead = async (id: string) => {
  return pb.collection('notificacoes').update(id, { status: 'lida' })
}

export const markAllAsRead = async (userId: string) => {
  const unread = await pb.collection('notificacoes').getFullList({
    filter: `usuario_id = '${userId}' && status = 'nao_lida'`,
  })

  const promises = unread.map((n) => pb.collection('notificacoes').update(n.id, { status: 'lida' }))
  await Promise.all(promises)
}

export const completeOnboarding = async (userId: string) => {
  return pb.collection('users').update(userId, { onboarding_completed: true })
}
