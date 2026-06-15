import { useEffect, useState } from 'react'
import { getPlanos, updatePlano } from '@/services/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Edit, Check, Users, Building } from 'lucide-react'

export default function AdminPlanos() {
  const [planos, setPlanos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlano, setSelectedPlano] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await getPlanos()
      setPlanos(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlano) return
    try {
      await updatePlano(selectedPlano.id, {
        nome: selectedPlano.nome,
        valor_mensal: selectedPlano.valor_mensal,
        max_psicologos: selectedPlano.max_psicologos,
        max_pacientes: selectedPlano.max_pacientes,
        max_funcionarios: selectedPlano.max_funcionarios,
      })
      toast({ title: 'Plano atualizado com sucesso' })
      setIsEditOpen(false)
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Planos de Assinatura</h1>
        <p className="text-muted-foreground">Gerencie os planos, limites e preços da plataforma.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {planos.map((plano) => (
          <Card key={plano.id} className="relative overflow-hidden border-slate-200 flex flex-col">
            <div
              className={`absolute top-0 w-full h-1 ${plano.status === 'ativo' ? 'bg-blue-600' : 'bg-slate-300'}`}
            />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-slate-800">{plano.nome}</CardTitle>
                  <CardDescription className="mt-1">{plano.descricao}</CardDescription>
                </div>
                <Badge
                  variant={plano.status === 'ativo' ? 'default' : 'secondary'}
                  className={
                    plano.status === 'ativo' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''
                  }
                >
                  {plano.status}
                </Badge>
              </div>
              <div className="mt-4 text-3xl font-bold text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  plano.valor_mensal,
                )}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div className="text-sm font-medium text-slate-900">Limites:</div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" /> {plano.max_psicologos}{' '}
                    Psicólogo(s)
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" /> {plano.max_pacientes} Pacientes
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" /> {plano.max_funcionarios}{' '}
                    Funcionário(s)
                  </li>
                </ul>
                <div className="text-sm font-medium text-slate-900 pt-4 border-t">
                  Recursos Inclusos:
                </div>
                <div
                  className="text-sm text-slate-600"
                  dangerouslySetInnerHTML={{ __html: plano.recursos }}
                />
              </div>
              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => {
                  setSelectedPlano(plano)
                  setIsEditOpen(true)
                }}
              >
                <Edit className="w-4 h-4 mr-2" /> Editar Limites
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plano - {selectedPlano?.nome}</DialogTitle>
          </DialogHeader>
          {selectedPlano && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Plano</Label>
                  <Input
                    value={selectedPlano.nome}
                    onChange={(e) => setSelectedPlano({ ...selectedPlano, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Mensal (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedPlano.valor_mensal}
                    onChange={(e) =>
                      setSelectedPlano({
                        ...selectedPlano,
                        valor_mensal: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Psicólogos</Label>
                  <Input
                    type="number"
                    value={selectedPlano.max_psicologos}
                    onChange={(e) =>
                      setSelectedPlano({
                        ...selectedPlano,
                        max_psicologos: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Pacientes</Label>
                  <Input
                    type="number"
                    value={selectedPlano.max_pacientes}
                    onChange={(e) =>
                      setSelectedPlano({
                        ...selectedPlano,
                        max_pacientes: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Funcionários</Label>
                  <Input
                    type="number"
                    value={selectedPlano.max_funcionarios}
                    onChange={(e) =>
                      setSelectedPlano({
                        ...selectedPlano,
                        max_funcionarios: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Check className="w-4 h-4 mr-2" /> Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
