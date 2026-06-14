import pb from '@/lib/pocketbase/client'

export const getCurrentPsicologo = async (userId: string) => {
  try {
    const records = await pb
      .collection('perfis_psicologos')
      .getFullList({ filter: `user_id = '${userId}'` })
    return records[0]
  } catch (e) {
    return null
  }
}

export const getMyProntuarios = async (psicologoId: string) => {
  return pb.collection('prontuarios').getFullList({
    filter: `psicologo_id = '${psicologoId}'`,
    expand: 'paciente_id',
  })
}

export const getProntuario = async (id: string) => {
  return pb.collection('prontuarios').getOne(id, { expand: 'paciente_id,psicologo_id' })
}

export const updateProntuario = async (id: string, data: any) => {
  return pb.collection('prontuarios').update(id, data)
}

export const summarizeTexto = async (texto: string) => {
  return pb.send<{ resumo: string }>('/backend/v1/prontuarios/summarize', {
    method: 'POST',
    body: JSON.stringify({ texto }),
  })
}

export const createSugestao = async (data: any) => {
  return pb.collection('sugestoes_ia_prontuario').create(data)
}

export const updateSugestao = async (id: string, data: any) => {
  return pb.collection('sugestoes_ia_prontuario').update(id, data)
}
