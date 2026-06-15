import pb from '@/lib/pocketbase/client'

export const getActiveTerms = async () => {
  return pb.collection('termos_consentimento').getFullList({
    filter: "status = 'ativo'",
  })
}

export const getPatientConsents = async (pacienteId: string) => {
  return pb.collection('consentimentos_paciente').getFullList({
    filter: `paciente_id = '${pacienteId}'`,
    expand: 'termo_id',
  })
}

export const acceptTerms = async (pacienteId: string, termos: any[]) => {
  const promises = termos.map((t) =>
    pb.collection('consentimentos_paciente').create({
      paciente_id: pacienteId,
      termo_id: t.id,
      versao: t.versao,
      data_aceite: new Date().toISOString(),
      status: 'aceito',
    }),
  )
  return Promise.all(promises)
}

export const checkPsychologistCompliance = async (userId: string) => {
  try {
    const profile = await pb
      .collection('perfis_psicologos')
      .getFirstListItem(`user_id = '${userId}'`)
    const pacientes = await pb
      .collection('pacientes')
      .getFullList({ filter: `psicologo_id = '${profile.id}' && status = 'ativo'`, fields: 'id' })
    if (!pacientes.length) return { isCompliant: true, pendingCount: 0 }

    const activeTerms = await getActiveTerms()
    const lgpdTerm = activeTerms.find((t) => t.tipo === 'lgpd_geral')
    if (!lgpdTerm) return { isCompliant: true, pendingCount: 0 }

    const consentimentos = await pb.collection('consentimentos_paciente').getFullList({
      filter: `termo_id = '${lgpdTerm.id}' && status = 'aceito' && versao = '${lgpdTerm.versao}'`,
      fields: 'paciente_id',
    })

    const acceptedIds = new Set(consentimentos.map((c) => c.paciente_id))
    const pendingCount = pacientes.filter((p) => !acceptedIds.has(p.id)).length

    return { isCompliant: pendingCount === 0, pendingCount }
  } catch {
    return { isCompliant: true, pendingCount: 0 }
  }
}
