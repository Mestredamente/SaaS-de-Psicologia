import pb from '@/lib/pocketbase/client'

export interface ContratoSaas {
  id: string
  numero_contrato: string
  contratante_id: string
  contratante_nome: string
  tipo_contratante: 'psicologo' | 'clinica'
  plano_id: string
  valor_mensal: number
  status: 'rascunho' | 'enviado' | 'assinado' | 'cancelado'
  data_emissao: string
  data_inicio: string
  data_vencimento: string
  conteudo: string
  data_assinatura?: string
  ip_assinatura?: string
  expand?: {
    plano_id?: { nome: string }
  }
}

export const getContratosSaas = () =>
  pb
    .collection('contratos_saas')
    .getFullList<ContratoSaas>({ expand: 'plano_id', sort: '-created' })
export const createContratoSaas = (data: any) => pb.collection('contratos_saas').create(data)
export const updateContratoSaas = (id: string, data: any) =>
  pb.collection('contratos_saas').update(id, data)
export const getPsicologosParaContrato = () => pb.collection('perfis_psicologos').getFullList()
export const getClinicasParaContrato = () => pb.collection('clinicas').getFullList()
