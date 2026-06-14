import pb from '@/lib/pocketbase/client'

export async function fetchFuncionarioDashboard(clinicaId: string, temFin: boolean) {
  const vinculos = await pb.collection('psicologos_clinica').getFullList({
    filter: `clinica_id="${clinicaId}" && status="ativo"`,
  })
  const psiIds = vinculos.map((v) => v.psicologo_id)

  if (psiIds.length === 0) {
    return {
      atendimentosHoje: 0,
      agendamentosPendentes: 0,
      novosPacientes: 0,
      faturamento: 0,
      proximos: [],
    }
  }

  const filterPsi = psiIds.map((id) => `psicologo_id="${id}"`).join('||')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)

  const todayStr = today.toISOString().replace('T', ' ')
  const tomorrowStr = tomorrow.toISOString().replace('T', ' ')
  const lastWeekStr = lastWeek.toISOString().replace('T', ' ')

  const [hojeReq, pendentesReq, pacientesReq, proximosReq] = await Promise.all([
    pb.collection('atendimentos').getFullList({
      filter: `(${filterPsi}) && data_hora >= "${todayStr}" && data_hora < "${tomorrowStr}"`,
    }),
    pb.collection('atendimentos').getFullList({
      filter: `(${filterPsi}) && status="agendado"`,
    }),
    pb.collection('pacientes').getFullList({
      filter: `(${filterPsi}) && created >= "${lastWeekStr}"`,
    }),
    pb.collection('atendimentos').getFullList({
      filter: `(${filterPsi}) && data_hora >= "${todayStr}"`,
      sort: 'data_hora',
      expand: 'paciente_id,psicologo_id',
    }),
  ])

  let faturamento = 0
  if (temFin) {
    faturamento = hojeReq
      .filter((a) => ['realizado', 'confirmado'].includes(a.status))
      .reduce((sum, a) => sum + (a.valor || 0), 0)
  }

  return {
    atendimentosHoje: hojeReq.length,
    agendamentosPendentes: pendentesReq.length,
    novosPacientes: pacientesReq.length,
    faturamento,
    proximos: proximosReq.slice(0, 5),
  }
}

export async function fetchClinicPacientes(clinicaId: string) {
  const vinculos = await pb.collection('psicologos_clinica').getFullList({
    filter: `clinica_id="${clinicaId}" && status="ativo"`,
  })
  const psiIds = vinculos.map((v) => v.psicologo_id)
  if (psiIds.length === 0) return []

  const filterPsi = psiIds.map((id) => `psicologo_id="${id}"`).join('||')
  return pb.collection('pacientes').getFullList({
    filter: filterPsi,
    expand: 'psicologo_id',
  })
}

export async function fetchClinicAgendamentos(clinicaId: string) {
  const vinculos = await pb.collection('psicologos_clinica').getFullList({
    filter: `clinica_id="${clinicaId}" && status="ativo"`,
  })
  const psiIds = vinculos.map((v) => v.psicologo_id)
  if (psiIds.length === 0) return []

  const filterPsi = psiIds.map((id) => `psicologo_id="${id}"`).join('||')
  return pb.collection('atendimentos').getFullList({
    filter: filterPsi,
    expand: 'paciente_id,psicologo_id',
    sort: '-data_hora',
  })
}
