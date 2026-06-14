import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { ContratoTerapeutico, getContrato, updateContrato } from '@/services/contratos'
import { format } from 'date-fns'

export default function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [contrato, setContrato] = useState<ContratoTerapeutico | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const res = await getContrato(id)
        setContrato(res)
      } catch (e) {
        console.error(e)
        toast({
          title: 'Erro',
          description: 'Contrato não encontrado ou sem permissão.',
          variant: 'destructive',
        })
        navigate('/contratos-terapeuticos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, toast])

  const handleUpdateStatus = async (status: ContratoTerapeutico['status']) => {
    if (!contrato) return
    setUpdating(true)
    try {
      const data: Partial<ContratoTerapeutico> = { status }
      if (status === 'assinado') {
        data.data_assinatura = new Date().toISOString()
      }

      const res = await updateContrato(contrato.id, data)
      setContrato((prev) => (prev ? { ...prev, ...res, expand: prev.expand } : null))
      toast({ title: 'Sucesso', description: `Status do contrato atualizado para ${status}.` })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao atualizar o status do contrato.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rascunho':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'enviado':
        return <Badge className="bg-blue-500">Enviado</Badge>
      case 'assinado':
        return <Badge className="bg-green-500">Assinado</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando detalhes do contrato...
      </div>
    )
  if (!contrato) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            Contrato {contrato.numero_contrato}
            {getStatusBadge(contrato.status)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Paciente: {contrato.expand?.paciente_id?.nome_completo || 'N/A'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/contratos-terapeuticos')}>
          Voltar para Lista
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-slate-50 p-5 rounded-lg border">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Data de Emissão
          </p>
          <p className="font-medium text-slate-900">
            {format(new Date(contrato.data_emissao), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        {contrato.data_assinatura && (
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Assinado em
            </p>
            <p className="font-medium text-green-700">
              {format(new Date(contrato.data_assinatura), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {contrato.status === 'rascunho' && (
            <Button
              disabled={updating}
              onClick={() => handleUpdateStatus('enviado')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Enviar ao Paciente
            </Button>
          )}
          {contrato.status === 'enviado' && (
            <Button
              disabled={updating}
              onClick={() => handleUpdateStatus('assinado')}
              className="bg-green-600 hover:bg-green-700"
            >
              Marcar como Assinado
            </Button>
          )}
          {contrato.status !== 'cancelado' && contrato.status !== 'assinado' && (
            <Button
              disabled={updating}
              variant="destructive"
              onClick={() => handleUpdateStatus('cancelado')}
            >
              Cancelar Contrato
            </Button>
          )}
        </div>
      </div>

      {/* Formal Document Preview */}
      <Card className="bg-white shadow-lg border-t-8 border-t-teal-700 rounded-xl overflow-hidden print:shadow-none print:border-none">
        <CardContent className="p-8 md:p-16">
          <div className="font-serif text-slate-900 leading-loose whitespace-pre-wrap text-justify prose prose-slate max-w-none">
            {contrato.conteudo}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
