import pb from '@/lib/pocketbase/client'

export const getSupervisorProfile = async (userId: string) => {
  const perfil = await pb.collection('perfis_psicologos').getFirstListItem(`user_id="${userId}"`)
  return pb.collection('supervisores').getFirstListItem(`psicologo_id="${perfil.id}"`)
}

export const getSupervisandos = async (supervisorId: string) => {
  return pb.collection('supervisandos').getFullList({
    filter: `supervisor_id="${supervisorId}"`,
    expand: 'psicologo_id',
  })
}

export const getSessoesSupervisao = async (supervisorId: string) => {
  return pb.collection('sessoes_supervisao').getFullList({
    filter: `supervisor_id="${supervisorId}"`,
    sort: '-data_hora',
    expand: 'supervisando_id.psicologo_id',
  })
}

export const getCasosSupervisao = async (supervisorId: string) => {
  return pb.collection('casos_supervisao').getFullList({
    filter: `supervisando_id.supervisor_id="${supervisorId}"`,
    expand: 'supervisando_id.psicologo_id,paciente_id',
  })
}

export const createSessaoSupervisao = async (data: any) => {
  return pb.collection('sessoes_supervisao').create(data)
}

// Para o Supervisando (Minha Supervisão)
export const getMinhaSupervisao = async (userId: string) => {
  try {
    const perfil = await pb.collection('perfis_psicologos').getFirstListItem(`user_id="${userId}"`)
    const supervisando = await pb
      .collection('supervisandos')
      .getFirstListItem(`psicologo_id="${perfil.id}"`, {
        expand: 'supervisor_id.psicologo_id',
      })
    return supervisando
  } catch {
    return null
  }
}

export const getSessoesMinhaSupervisao = async (supervisandoId: string) => {
  return pb.collection('sessoes_supervisao').getFullList({
    filter: `supervisando_id="${supervisandoId}"`,
    sort: '-data_hora',
    expand: 'supervisor_id.psicologo_id',
  })
}

export const getCasosMinhaSupervisao = async (supervisandoId: string) => {
  return pb.collection('casos_supervisao').getFullList({
    filter: `supervisando_id="${supervisandoId}"`,
    expand: 'paciente_id',
  })
}
