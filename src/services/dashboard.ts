import pb from '@/lib/pocketbase/client'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  subDays,
  eachDayOfInterval,
} from 'date-fns'

export interface DashboardStats {
  todayCount: number
  activePatients: number
  weekSessions: number
  monthRevenue: number
}

export interface Appointment {
  id: string
  date_time: string
  type: 'presencial' | 'online'
  status: 'confirmado' | 'pendente' | 'cancelado' | 'concluido'
  fee: number
  expand?: {
    patient?: {
      id: string
      name: string
    }
  }
}

export interface Patient {
  id: string
  name: string
  last_session: string
}

export interface ChartData {
  date: string
  sessoes: number
}

const fmtDate = (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss')

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()

  // Today's appointments
  const startToday = fmtDate(startOfDay(now))
  const endToday = fmtDate(endOfDay(now))
  const todayList = await pb.collection('appointments').getList(1, 1, {
    filter: `date_time >= "${startToday}" && date_time <= "${endToday}" && status != "cancelado"`,
  })

  // Active patients
  const activeList = await pb.collection('patients').getList(1, 1, {
    filter: `status = "ativo"`,
  })

  // This week's sessions
  const startWeek = fmtDate(startOfWeek(now, { weekStartsOn: 1 }))
  const endWeek = fmtDate(endOfWeek(now, { weekStartsOn: 1 }))
  const weekList = await pb.collection('appointments').getList(1, 1, {
    filter: `date_time >= "${startWeek}" && date_time <= "${endWeek}" && status != "cancelado"`,
  })

  // Month revenue
  const startMonth = fmtDate(startOfMonth(now))
  const monthAppointments = await pb.collection('appointments').getFullList({
    filter: `date_time >= "${startMonth}" && (status = "concluido" || status = "confirmado")`,
  })
  const revenue = monthAppointments.reduce((sum, apt) => sum + (apt.fee || 0), 0)

  return {
    todayCount: todayList.totalItems,
    activePatients: activeList.totalItems,
    weekSessions: weekList.totalItems,
    monthRevenue: revenue,
  }
}

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const nowStr = fmtDate(new Date())
  return await pb
    .collection('appointments')
    .getList(1, 3, {
      filter: `date_time >= "${nowStr}" && status != "cancelado"`,
      sort: 'date_time',
      expand: 'patient',
    })
    .then((res) => res.items as unknown as Appointment[])
}

export async function getRecentPatients(): Promise<Patient[]> {
  return await pb
    .collection('patients')
    .getList(1, 5, {
      sort: '-last_session',
    })
    .then((res) => res.items as unknown as Patient[])
}

export async function getActivityChartData(): Promise<ChartData[]> {
  const now = new Date()
  const past7Days = startOfDay(subDays(now, 6))
  const startStr = fmtDate(past7Days)

  const appointments = await pb.collection('appointments').getFullList({
    filter: `date_time >= "${startStr}" && status != "cancelado"`,
  })

  const days = eachDayOfInterval({ start: past7Days, end: now })

  return days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const count = appointments.filter((apt) => apt.date_time.startsWith(dayStr)).length
    return {
      date: format(day, 'dd/MM'),
      sessoes: count,
    }
  })
}
