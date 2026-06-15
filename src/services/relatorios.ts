import pb from '@/lib/pocketbase/client'
import { startOfMonth, endOfMonth, subMonths, format, eachMonthOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type PeriodOption = 'current_month' | 'last_3_months' | 'last_6_months' | 'current_year'

export function getDatesFromPeriod(period: PeriodOption) {
  let startDate = new Date()
  let endDate = new Date()
  if (period === 'current_month') {
    startDate = startOfMonth(new Date())
    endDate = endOfMonth(new Date())
  } else if (period === 'last_3_months') {
    startDate = startOfMonth(subMonths(new Date(), 2))
    endDate = endOfMonth(new Date())
  } else if (period === 'last_6_months') {
    startDate = startOfMonth(subMonths(new Date(), 5))
    endDate = endOfMonth(new Date())
  } else if (period === 'current_year') {
    startDate = new Date(new Date().getFullYear(), 0, 1)
    endDate = new Date(new Date().getFullYear(), 11, 31)
  }
  return { startDate, endDate }
}

export async function getPsychologistAnalytics(userId: string, period: PeriodOption) {
  const perfil = await pb
    .collection('perfis_psicologos')
    .getFirstListItem(`user_id="${userId}"`)
    .catch(() => null)
  if (!perfil) throw new Error('Perfil não encontrado')

  const { startDate, endDate } = getDatesFromPeriod(period)
  const startStr = format(startDate, 'yyyy-MM-dd 00:00:00')
  const endStr = format(endDate, 'yyyy-MM-dd 23:59:59')

  const [agendamentos, pacientes, financeiro] = await Promise.all([
    pb.collection('agendamentos').getFullList({
      filter: `psicologo_id = "${perfil.id}" && data_hora >= "${startStr}" && data_hora <= "${endStr}"`,
      expand: 'paciente_id',
    }),
    pb.collection('pacientes').getFullList({
      filter: `psicologo_id = "${perfil.id}"`,
    }),
    pb.collection('financeiro').getFullList({
      filter: `psicologo_id = "${perfil.id}" && data_vencimento >= "${startStr}" && data_vencimento <= "${endStr}"`,
    }),
  ])

  const realized = agendamentos.filter((a) => a.status === 'realizado')
  const totalSessoes = realized.length

  const novosPacientes = pacientes.filter(
    (p) => new Date(p.created) >= startDate && new Date(p.created) <= endDate,
  ).length

  const totalScheduled = agendamentos.filter((a) =>
    ['realizado', 'cancelado', 'agendado', 'confirmado'].includes(a.status),
  ).length
  const taxaComparecimento = totalScheduled > 0 ? (totalSessoes / totalScheduled) * 100 : 0

  const sessaoFinanceiro = financeiro.filter(
    (f) => f.categoria === 'sessao' && f.status === 'recebido',
  )
  const ticketMedio =
    sessaoFinanceiro.length > 0
      ? sessaoFinanceiro.reduce((sum, f) => sum + f.valor, 0) / sessaoFinanceiro.length
      : 0

  const months = eachMonthOfInterval({ start: startDate, end: endDate })

  const sessoesPorMes = months.map((month) => {
    const monthStr = format(month, 'MMM/yy', { locale: ptBR })
    const count = realized.filter(
      (a) =>
        new Date(a.data_hora).getMonth() === month.getMonth() &&
        new Date(a.data_hora).getFullYear() === month.getFullYear(),
    ).length
    return { month: monthStr, sessoes: count }
  })

  const evolucaoCarteira = months.map((month) => {
    const monthStr = format(month, 'MMM/yy', { locale: ptBR })
    const activeCount = pacientes.filter(
      (p) => new Date(p.created) <= endOfMonth(month) && p.status === 'ativo',
    ).length
    return { month: monthStr, ativos: activeCount }
  })

  const receitaVsMeta = months.map((month) => {
    const monthStr = format(month, 'MMM/yy', { locale: ptBR })
    const receita = financeiro
      .filter(
        (f) =>
          f.status === 'recebido' &&
          new Date(f.data_recebimento || f.data_vencimento).getMonth() === month.getMonth() &&
          new Date(f.data_recebimento || f.data_vencimento).getFullYear() === month.getFullYear(),
      )
      .reduce((sum, f) => sum + f.valor, 0)
    return { month: monthStr, receita, meta: 5000 }
  })

  const patientSessions = realized.reduce(
    (acc, a) => {
      acc[a.paciente_id] = (acc[a.paciente_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topPacientes = Object.entries(patientSessions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const p = pacientes.find((p) => p.id === id)
      return { name: p?.nome_completo || 'Desconhecido', count }
    })

  const now = new Date()
  const churnList = pacientes
    .filter((p) => p.status === 'ativo')
    .map((p) => {
      const pAgends = realized.filter((a) => a.paciente_id === p.id)
      if (pAgends.length === 0) return null
      const lastAgend = pAgends.sort(
        (a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime(),
      )[0]
      const daysSinceLast = Math.floor(
        (now.getTime() - new Date(lastAgend.data_hora).getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysSinceLast > 60)
        return { id: p.id, name: p.nome_completo, daysSinceLast, lastSession: lastAgend.data_hora }
      return null
    })
    .filter(Boolean)

  return {
    totalSessoes,
    novosPacientes,
    taxaComparecimento,
    ticketMedio,
    sessoesPorMes,
    evolucaoCarteira,
    receitaVsMeta,
    topPacientes,
    churnList,
  }
}

export async function getClinicAnalytics(period: PeriodOption) {
  const { startDate, endDate } = getDatesFromPeriod(period)
  const startStr = format(startDate, 'yyyy-MM-dd 00:00:00')
  const endStr = format(endDate, 'yyyy-MM-dd 23:59:59')

  const [agendamentos, financeiro, psicologos] = await Promise.all([
    pb.collection('agendamentos').getFullList({
      filter: `data_hora >= "${startStr}" && data_hora <= "${endStr}"`,
      expand: 'psicologo_id',
    }),
    pb.collection('financeiro').getFullList({
      filter: `data_vencimento >= "${startStr}" && data_vencimento <= "${endStr}"`,
      expand: 'psicologo_id',
    }),
    pb.collection('perfis_psicologos').getFullList(),
  ])

  const recebidos = financeiro.filter((f) => f.status === 'recebido')
  const faturamentoTotal = recebidos.reduce((sum, f) => sum + f.valor, 0)

  const inadimplentes = financeiro.filter((f) => ['pendente', 'atrasado'].includes(f.status))
  const totalFinanceiro = financeiro.length
  const inadimplenciaMedia =
    totalFinanceiro > 0 ? (inadimplentes.length / totalFinanceiro) * 100 : 0

  const realized = agendamentos.filter((a) => a.status === 'realizado')

  const numPsychologists = new Set(agendamentos.map((a) => a.psicologo_id)).size || 1

  const patientSessions = realized.reduce(
    (acc, a) => {
      acc[a.psicologo_id] = (acc[a.psicologo_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  let mostProductive = { name: 'Nenhum', count: 0 }
  Object.entries(patientSessions).forEach(([id, count]) => {
    if (count > mostProductive.count) {
      const p = psicologos.find((p) => p.id === id)
      mostProductive = { name: p?.nome_completo || 'Desconhecido', count }
    }
  })

  const faturamentoPorPsi = recebidos.reduce(
    (acc, f) => {
      const nome = f.expand?.psicologo_id?.nome_completo || 'Outros'
      acc[nome] = (acc[nome] || 0) + f.valor
      return acc
    },
    {} as Record<string, number>,
  )

  const faturamentoChart = Object.entries(faturamentoPorPsi).map(([name, value]) => ({
    name,
    value,
  }))

  const especialidadeCounts = realized.reduce(
    (acc, a) => {
      const esp = a.expand?.psicologo_id?.especialidade || 'Geral'
      acc[esp] = (acc[esp] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const especialidadeChart = Object.entries(especialidadeCounts).map(([name, count]) => ({
    name,
    count,
  }))

  const tableData = psicologos
    .filter((p) => agendamentos.some((a) => a.psicologo_id === p.id))
    .map((p) => {
      const pAgends = agendamentos.filter((a) => a.psicologo_id === p.id)
      const pRealized = pAgends.filter((a) => a.status === 'realizado').length
      const pScheduled = pAgends.filter((a) =>
        ['realizado', 'cancelado', 'agendado', 'confirmado'].includes(a.status),
      ).length
      const pAttendance = pScheduled > 0 ? (pRealized / pScheduled) * 100 : 0

      const pFaturado = recebidos
        .filter((f) => f.psicologo_id === p.id)
        .reduce((sum, f) => sum + f.valor, 0)

      return {
        id: p.id,
        nome: p.nome_completo,
        sessoes: pRealized,
        faturamento: pFaturado,
        taxa: pAttendance,
      }
    })

  const taxaOcupacao =
    Math.min(100, Math.round((realized.length / (numPsychologists * 160)) * 100)) || 0

  return {
    faturamentoTotal,
    psicologoMaisProdutivo: mostProductive.name,
    taxaOcupacao,
    inadimplenciaMedia,
    faturamentoChart,
    especialidadeChart,
    tableData,
  }
}
