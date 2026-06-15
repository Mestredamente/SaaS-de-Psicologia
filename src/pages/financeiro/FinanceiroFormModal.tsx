import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFinanceiro } from '@/services/financeiro'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export function FinanceiroFormModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [psicologoId, setPsicologoId] = useState<string>('')

  const [formData, setFormData] = useState({
    tipo: 'receita',
    categoria: 'sessao',
    descricao: '',
    valor: '',
    data_vencimento: new Date().toISOString().slice(0, 10),
    status: 'pendente',
    paciente_id: 'none',
    forma_pagamento: '',
  })

  useEffect(() => {
    if (!open) return
    if (pb.authStore.model?.id) {
      pb.collection('perfis_psicologos')
        .getFirstListItem(`user_id = "${pb.authStore.model.id}"`)
        .then((p) => setPsicologoId(p.id))
        .catch(() => {})
    }
    pb.collection('pacientes')
      .getFullList({ sort: 'nome_completo' })
      .then(setPacientes)
      .catch(() => {})
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!psicologoId) {
      toast({
        title: 'Erro',
        description: 'Perfil de psicólogo não encontrado para o usuário logado.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      await createFinanceiro({
        ...formData,
        tipo: formData.tipo as any,
        categoria: formData.categoria as any,
        status: formData.status as any,
        valor: parseFloat(formData.valor.replace(',', '.')),
        psicologo_id: psicologoId,
        paciente_id: formData.paciente_id === 'none' ? undefined : formData.paciente_id,
        data_recebimento: formData.status === 'recebido' ? new Date().toISOString() : undefined,
      })
      toast({ title: 'Sucesso', description: 'Lançamento criado com sucesso.' })
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao criar lançamento.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({ ...formData, tipo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(v) => setFormData({ ...formData, categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessao">Sessão / Consulta</SelectItem>
                  <SelectItem value="plano">Plano / Pacote</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Sessão de Terapia - Maria"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Input
                required
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paciente (Opcional)</Label>
              <Select
                value={formData.paciente_id}
                onValueChange={(v) => setFormData({ ...formData, paciente_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Lançamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
