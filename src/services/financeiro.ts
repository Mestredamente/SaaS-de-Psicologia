import pb from '@/lib/pocketbase/client'

export interface FinanceiroRecord {
  id: string
  psicologo_id: string
  paciente_id?: string
  agendamento_id?: string
  tipo: 'receita' | 'despesa'
  categoria: 'sessao' | 'plano' | 'material' | 'outro'
  descricao: string
  valor: number
  status: 'pendente' | 'recebido' | 'atrasado' | 'cancelado'
  data_vencimento: string
  data_recebimento?: string
  forma_pagamento?: string
  observacoes?: string
  created: string
  updated: string
  expand?: {
    paciente_id?: any
    psicologo_id?: any
  }
}

export const getFinanceiro = async () => {
  return pb.collection('financeiro').getFullList<FinanceiroRecord>({
    expand: 'paciente_id',
    sort: '-data_vencimento',
  })
}

export const getFinanceiroAtrasado = async () => {
  const filter = `status = 'atrasado'`
  return pb.collection('financeiro').getList<FinanceiroRecord>(1, 1, { filter })
}

export const createFinanceiro = async (data: Partial<FinanceiroRecord>) => {
  return pb.collection('financeiro').create<FinanceiroRecord>(data)
}

export const updateFinanceiro = async (id: string, data: Partial<FinanceiroRecord>) => {
  return pb.collection('financeiro').update<FinanceiroRecord>(id, data)
}

export const deleteFinanceiro = async (id: string) => {
  return pb.collection('financeiro').delete(id)
}
