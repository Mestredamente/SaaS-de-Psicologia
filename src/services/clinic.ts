import pb from '@/lib/pocketbase/client'

export async function fetchClinicDashboardData() {
  const clinicas = await pb.collection('clinicas').getFullList({ filter: 'status="ativo"' })
  const clinica = clinicas[0]
  if (!clinica) throw new Error('Nenhuma clínica ativa encontrada')

  const psicologos_vinculos = await pb.collection('psicologos_clinica').getFullList({
    filter: `clinica_id="${clinica.id}" && status="ativo"`,
    expand: 'psicologo_id',
  })

  const psicologosIds = psicologos_vinculos.map((v) => v.psicologo_id)

  let atendimentos: any[] = []
  if (psicologosIds.length > 0) {
    const filters = psicologosIds.map((id) => `psicologo_id="${id}"`).join('||')
    const lastMonth = new Date()
    lastMonth.setDate(lastMonth.getDate() - 30)
    const dateStr = lastMonth.toISOString().replace('T', ' ')

    atendimentos = await pb.collection('atendimentos').getFullList({
      filter: `(${filters}) && data_hora >= "${dateStr}"`,
      expand: 'paciente_id,psicologo_id',
      sort: 'data_hora',
    })
  }

  return {
    clinica,
    psicologos_vinculos,
    atendimentos,
  }
}
