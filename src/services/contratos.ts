import pb from '@/lib/pocketbase/client'

export interface ContratoTerapeutico {
  id: string
  psicologo_id: string
  paciente_id: string
  numero_contrato: string
  data_emissao: string
  status: 'rascunho' | 'enviado' | 'assinado' | 'cancelado'
  conteudo: string
  data_assinatura?: string
  created: string
  updated: string
  expand?: {
    paciente_id?: any
    psicologo_id?: any
  }
}

export const getContratos = (psicologoId: string) =>
  pb.collection('contratos_terapeuticos').getFullList<ContratoTerapeutico>({
    filter: `psicologo_id = "${psicologoId}"`,
    expand: 'paciente_id,psicologo_id',
    sort: '-created',
  })

export const getContrato = (id: string) =>
  pb.collection('contratos_terapeuticos').getOne<ContratoTerapeutico>(id, {
    expand: 'paciente_id,psicologo_id',
  })

export const createContrato = (data: Partial<ContratoTerapeutico>) =>
  pb.collection('contratos_terapeuticos').create<ContratoTerapeutico>(data)

export const updateContrato = (id: string, data: Partial<ContratoTerapeutico>) =>
  pb.collection('contratos_terapeuticos').update<ContratoTerapeutico>(id, data)

export const deleteContrato = (id: string) => pb.collection('contratos_terapeuticos').delete(id)
