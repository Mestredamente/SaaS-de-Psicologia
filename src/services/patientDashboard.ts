import pb from '@/lib/pocketbase/client'
import { addDays, startOfMonth, endOfMonth, startOfDay } from 'date-fns'

export async function getCurrentPatient() {
  const userId = pb.authStore.record?.id
  if (!userId) return null
  try {
    return await pb.collection('pacientes').getFirstListItem(`user_id="${userId}"`, {
      expand: 'psicologo_id',
    })
  } catch (e) {
    return null
  }
}

export async function getPatientStats(patientId: string) {
  const start = startOfMonth(new Date()).toISOString()
  const end = endOfMonth(new Date()).toISOString()

  const sessoesMes = await pb
    .collection('agendamentos')
    .getFullList({
      filter: `paciente_id="${patientId}" && status="realizado" && data_hora >= "${start}" && data_hora <= "${end}"`,
    })
    .catch(() => [])

  const agendadas = await pb
    .collection('agendamentos')
    .getFullList({
      filter: `paciente_id="${patientId}" && (status="agendado" || status="confirmado" || status="reagendado")`,
    })
    .catch(() => [])

  const pendentes = await pb
    .collection('pagamentos')
    .getFullList({
      filter: `paciente_id="${patientId}" && (status="pendente" || status="atrasado")`,
    })
    .catch(() => [])

  const valorPendente = pendentes.reduce((acc, p) => acc + p.valor, 0)

  const diarios = await pb
    .collection('diario_sentimental')
    .getFullList({
      filter: `paciente_id="${patientId}"`,
      sort: '-data',
    })
    .catch(() => [])

  let streak = 0
  let current = startOfDay(new Date())

  for (const d of diarios) {
    const dDate = startOfDay(new Date(d.data))
    if (dDate.getTime() === current.getTime()) {
      if (streak === 0) streak = 1
    } else if (dDate.getTime() === addDays(current, -1).getTime()) {
      streak++
      current = dDate
    } else if (dDate.getTime() < addDays(current, -1).getTime()) {
      break
    }
  }

  return {
    sessoesMes: sessoesMes.length,
    agendadas: agendadas.length,
    valorPendente,
    streak,
  }
}

export async function getNextSession(patientId: string) {
  const now = new Date().toISOString()
  try {
    return await pb
      .collection('agendamentos')
      .getFirstListItem(
        `paciente_id="${patientId}" && data_hora >= "${now}" && (status="agendado" || status="confirmado" || status="reagendado")`,
        { sort: 'data_hora', expand: 'psicologo_id' },
      )
  } catch {
    return null
  }
}
