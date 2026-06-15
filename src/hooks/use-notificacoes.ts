import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export function useNotificacoes() {
  const { user } = useAuth()
  const [notificacoes, setNotificacoes] = useState<any[]>([])

  const loadNotificacoes = useCallback(async () => {
    if (!user) return
    try {
      const records = await pb.collection('notificacoes').getFullList({
        filter: `usuario_id="${user.id}"`,
        sort: '-data_envio',
      })
      setNotificacoes(records)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }, [user])

  useEffect(() => {
    loadNotificacoes()
  }, [loadNotificacoes])

  useRealtime('notificacoes', () => {
    loadNotificacoes()
  })

  const unreadCount = notificacoes.filter((n) => n.status === 'nao_lida').length

  const handleMarkAsRead = async (id: string) => {
    try {
      await pb.collection('notificacoes').update(id, { status: 'lida' })
      await loadNotificacoes()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notificacoes.filter((n) => n.status === 'nao_lida')
      for (const n of unread) {
        await pb.collection('notificacoes').update(n.id, { status: 'lida' })
      }
      await loadNotificacoes()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  return { notificacoes, unreadCount, handleMarkAsRead, handleMarkAllAsRead, loadNotificacoes }
}
