import pb from '@/lib/pocketbase/client'

export const getPlanos = async () => {
  return pb.collection('planos_assinatura').getFullList({ sort: '-valor_mensal' })
}

export const updatePlano = async (id: string, data: any) => {
  return pb.collection('planos_assinatura').update(id, data)
}

export const getAssinaturas = async () => {
  return pb
    .collection('assinaturas')
    .getFullList({ expand: 'plano_id,usuario_id', sort: '-created' })
}

export const updateAssinaturaStatus = async (id: string, status: string) => {
  return pb.collection('assinaturas').update(id, { status })
}

export const getUsuarios = async () => {
  return pb
    .collection('users')
    .getFullList({ filter: "role = 'psicologo' || role = 'clinica'", sort: '-created' })
}

export const getTenants = async () => {
  return pb.collection('tenants').getFullList({ expand: 'usuario_id' })
}
