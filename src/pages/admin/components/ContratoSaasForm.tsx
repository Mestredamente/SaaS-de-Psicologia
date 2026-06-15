import { useState, useEffect } from 'react'
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getPsicologosParaContrato,
  getClinicasParaContrato,
  createContratoSaas,
} from '@/services/adminContratos'
import { getPlanos } from '@/services/admin'
import { generateContratoSaasHTML } from '@/lib/templates/contratoSaas'
import { useToast } from '@/hooks/use-toast'
import { format, addYears } from 'date-fns'

export function ContratoSaasForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [tipo, setTipo] = useState<'psicologo' | 'clinica'>('psicologo')
  const [contratantes, setContratantes] = useState<any[]>([])
  const [planos, setPlanos] = useState<any[]>([])

  const [contratanteId, setContratanteId] = useState('')
  const [planoId, setPlanoId] = useState('')
  const [numeroContrato, setNumeroContrato] = useState(`CTR-${Date.now().toString().slice(-6)}`)
  const [dataEmissao, setDataEmissao] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dataVencimento, setDataVencimento] = useState(
    format(addYears(new Date(), 1), 'yyyy-MM-dd'),
  )
  const [valorMensal, setValorMensal] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    getPlanos().then(setPlanos)
  }, [])

  useEffect(() => {
    if (tipo === 'psicologo') {
      getPsicologosParaContrato().then(setContratantes)
    } else {
      getClinicasParaContrato().then(setContratantes)
    }
    setContratanteId('')
  }, [tipo])

  useEffect(() => {
    if (planoId) {
      const p = planos.find((x) => x.id === planoId)
      if (p) setValorMensal(p.valor_mensal.toString())
    }
  }, [planoId, planos])

  const handleGenerate = async () => {
    if (!contratanteId || !planoId || !dataInicio || !dataVencimento || !valorMensal) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const contratante = contratantes.find((x) => x.id === contratanteId)
      const contratanteNome = contratante.nome_completo || contratante.nome_fantasia
      const plano = planos.find((x) => x.id === planoId)

      const conteudo = generateContratoSaasHTML({
        contratanteNome,
        planoNome: plano.nome,
        valorMensal: Number(valorMensal),
        dataInicio,
        dataVencimento,
      })

      await createContratoSaas({
        contratante_id: contratanteId,
        contratante_nome: contratanteNome,
        tipo_contratante: tipo,
        numero_contrato: numeroContrato,
        data_emissao: new Date(dataEmissao + 'T12:00:00Z').toISOString(),
        data_inicio: new Date(dataInicio + 'T12:00:00Z').toISOString(),
        data_vencimento: new Date(dataVencimento + 'T12:00:00Z').toISOString(),
        plano_id: planoId,
        valor_mensal: Number(valorMensal),
        status: 'rascunho',
        conteudo,
      })

      toast({ title: 'Contrato gerado com sucesso' })
      onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro ao gerar contrato', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Gerar Novo Contrato SaaS</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="space-y-2">
          <Label>Tipo de Contratante</Label>
          <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="psicologo">Psicólogo</SelectItem>
              <SelectItem value="clinica">Clínica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Contratante</Label>
          <Select value={contratanteId} onValueChange={setContratanteId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {contratantes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome_completo || c.nome_fantasia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Plano</Label>
          <Select value={planoId} onValueChange={setPlanoId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o plano" />
            </SelectTrigger>
            <SelectContent>
              {planos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Valor Mensal (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={valorMensal}
            onChange={(e) => setValorMensal(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Número do Contrato</Label>
          <Input value={numeroContrato} onChange={(e) => setNumeroContrato(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data de Emissão</Label>
          <Input type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data de Vencimento</Label>
          <Input
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleGenerate} disabled={loading}>
          Gerar e Salvar Rascunho
        </Button>
      </DialogFooter>
    </>
  )
}
