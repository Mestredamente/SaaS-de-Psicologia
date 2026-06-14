import pb from '@/lib/pocketbase/client'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  eachDayOfInterval,
} from 'date-fns'

export interface DashboardStats {
  todayCount: number
  activePatients: number
  weekSessions: number
  monthRevenue: number
  psychologistName: string
}

export interface Atendimento {
  id: string
  data_hora: string
  tipo: 'presencial' | 'online'
  status: 'agendado' | 'realizado' | 'cancelado'
  valor: number
  expand?: {
    paciente_id?: {
      id: string
      nome_completo: string
    }
  }
}

export interface Paciente {
  id: string
  nome_completo: string
  ultimo_atendimento?: string
}

export interface ChartData {
  date: string
  sessoes: number
}

const fmtDate = (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss')

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()

  const startTodayStr = fmtDate(startOfDay(now))
  const endTodayStr = fmtDate(endOfDay(now))

  const todayList = await pb.collection('atendimentos').getList(1, 1, {
    filter: `data_hora >= "${startTodayStr}" && data_hora <= "${endTodayStr}" && status = "agendado"`,
  })

  const activeList = await pb.collection('pacientes').getList(1, 1, {
    filter: `status = "ativo"`,
  })

  const startWeekStr = fmtDate(subDays(startOfDay(now), 7))
  const endWeekStr = fmtDate(endOfDay(now))
  const weekList = await pb.collection('atendimentos').getList(1, 1, {
    filter: `data_hora >= "${startWeekStr}" && data_hora <= "${endWeekStr}" && status = "realizado"`,
  })

  const sMonth = fmtDate(startOfMonth(now))
  const eMonth = fmtDate(endOfMonth(now))
  const monthAppointments = await pb.collection('atendimentos').getFullList({
    filter: `data_hora >= "${sMonth}" && data_hora <= "${eMonth}" && status = "realizado"`,
  })
  const revenue = monthAppointments.reduce((sum, apt) => sum + (apt.valor || 0), 0)

  let psychologistName = 'Doutor(a)'
  if (pb.authStore.record?.id) {
    try {
      const perfil = await pb
        .collection('perfis_psicologos')
        .getFirstListItem(`user_id = "${pb.authStore.record.id}"`)
      if (perfil?.nome_completo) {
        psychologistName = perfil.nome_completo
      }
    } catch {
      /* intentionally ignored */
    }
  }

  return {
    todayCount: todayList.totalItems,
    activePatients: activeList.totalItems,
    weekSessions: weekList.totalItems,
    monthRevenue: revenue,
    psychologistName,
  }
}

export async function getUpcomingAppointments(): Promise<Atendimento[]> {
  const nowStr = fmtDate(new Date())
  const endToday = fmtDate(endOfDay(new Date()))

  return await pb
    .collection('atendimentos')
    .getList(1, 3, {
      filter: `data_hora >= "${nowStr}" && data_hora <= "${endToday}" && status = "agendado"`,
      sort: 'data_hora',
      expand: 'paciente_id',
    })
    .then((res) => res.items as unknown as Atendimento[])
}

export async function getRecentPatients(): Promise<Paciente[]> {
  const recentApts = await pb.collection('atendimentos').getList(1, 20, {
    filter: `status = "realizado"`,
    sort: '-data_hora',
    expand: 'paciente_id',
  })

  const patientsMap = new Map<string, Paciente>()

  for (const apt of recentApts.items) {
    const paciente = apt.expand?.paciente_id
    if (paciente && !patientsMap.has(paciente.id)) {
      patientsMap.set(paciente.id, {
        id: paciente.id,
        nome_completo: paciente.nome_completo,
        ultimo_atendimento: apt.data_hora,
      })
    }
    if (patientsMap.size >= 5) break
  }

  return Array.from(patientsMap.values())
}

export async function getActivityChartData(): Promise<ChartData[]> {
  const now = new Date()
  const past7Days = startOfDay(subDays(now, 6))
  const startStr = fmtDate(past7Days)

  const appointments = await pb.collection('atendimentos').getFullList({
    filter: `data_hora >= "${startStr}" && status = "realizado"`,
  })

  const days = eachDayOfInterval({ start: past7Days, end: now })

  return days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const count = appointments.filter((apt) => apt.data_hora.startsWith(dayStr)).length
    return {
      date: format(day, 'dd/MM'),
      sessoes: count,
    }
  })
}
