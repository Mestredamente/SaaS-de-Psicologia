import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createContrato } from '@/services/contratos'

export default function NovoContrato() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [psicologo, setPsicologo] = useState<any>(null)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<string>('')
  const [conteudo, setConteudo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const perfis = await pb
          .collection('perfis_psicologos')
          .getList(1, 1, { filter: `user_id = "${user?.id}"` })
        if (perfis.items.length > 0) {
          const perfil = perfis.items[0]
          setPsicologo(perfil)
          const pacs = await pb
            .collection('pacientes')
            .getFullList({ filter: `psicologo_id = "${perfil.id}"`, sort: 'nome_completo' })
          setPacientes(pacs)
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (user?.id) load()
  }, [user?.id])

  useEffect(() => {
    if (selectedPaciente && psicologo) {
      const paciente = pacientes.find((p) => p.id === selectedPaciente)
      if (paciente) {
        const template = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS

I. DAS PARTES
Contratante (Paciente): ${paciente.nome_completo || 'N/A'}
CPF: ${paciente.cpf || 'N/A'}
Endereço: ${paciente.endereco || 'N/A'}

Contratada (Psicólogo(a)): ${psicologo.nome_completo || 'N/A'}
CRP: ${psicologo.crp || 'N/A'}

II. DO OBJETO
O presente contrato tem como objeto a prestação de serviços de psicoterapia, com a finalidade de promover a saúde mental e bem-estar do Contratante.

III. DAS SESSÕES E FREQUÊNCIA
As sessões terão duração média de 50 minutos, ocorrendo com frequência [inserir frequência, ex: semanal].

IV. DOS HONORÁRIOS
O valor estipulado para cada sessão é de R$ [inserir valor], a ser pago via [inserir forma de pagamento].

V. DO CANCELAMENTO E REAGENDAMENTO
Cancelamentos ou reagendamentos devem ser solicitados com antecedência mínima de 24 horas. O não comparecimento ou aviso fora deste prazo poderá acarretar a cobrança integral da sessão.

VI. DO SIGILO PROFISSIONAL E LIMITES
As informações trocadas em sessão são de caráter estritamente confidencial, conforme preceitua o Código de Ética Profissional do Psicólogo.
Exceções ao sigilo ocorrem somente em situações previstas em lei, como risco iminente de vida ao paciente ou a terceiros, ou por expressa determinação judicial.

VII. DO CONSENTIMENTO
O(a) Contratante declara ter lido, compreendido e concordado com todas as cláusulas deste documento, reconhecendo que a psicoterapia é um processo colaborativo e que o compromisso de ambas as partes é essencial para o progresso do tratamento.

E por estarem de acordo, firmam o presente contrato.

Local e Data: _________________________________________

Assinatura do Paciente: _________________________________
Assinatura do Psicólogo(a): _____________________________`
        setConteudo(template)
      }
    }
  }, [selectedPaciente, pacientes, psicologo])

  const handleSave = async () => {
    if (!selectedPaciente) {
      toast({ title: 'Atenção', description: 'Selecione um paciente.', variant: 'destructive' })
      return
    }
    if (!conteudo.trim()) {
      toast({
        title: 'Atenção',
        description: 'O conteúdo do contrato não pode estar vazio.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const numeroContrato = `CT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(
        Math.random() * 10000,
      )
        .toString()
        .padStart(4, '0')}`

      const res = await createContrato({
        psicologo_id: psicologo.id,
        paciente_id: selectedPaciente,
        numero_contrato: numeroContrato,
        data_emissao: new Date().toISOString(),
        status: 'rascunho',
        conteudo,
      })

      toast({ title: 'Sucesso', description: 'Contrato gerado como rascunho com sucesso.' })
      navigate(`/contratos-terapeuticos/${res.id}`)
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar',
        description: e.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Gerar Novo Contrato</h1>
        <Button variant="outline" onClick={() => navigate('/contratos-terapeuticos')}>
          Cancelar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Select value={selectedPaciente} onValueChange={setSelectedPaciente}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente para pré-preencher o modelo..." />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Conteúdo do Contrato (Modelo Editável)
              <Tooltip>
                <TooltipTrigger type="button" tabIndex={-1}>
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>O paciente precisa aceitar para prosseguir conforme a LGPD</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Textarea
              className="min-h-[500px] font-serif leading-relaxed text-sm md:text-base p-4"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="O modelo será preenchido automaticamente ao selecionar o paciente. Você pode ajustá-lo conforme necessário..."
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || !selectedPaciente}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {loading ? 'Salvando...' : 'Salvar Contrato (Rascunho)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
