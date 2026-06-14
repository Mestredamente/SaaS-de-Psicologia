import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'

export default function Perfil() {
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    cpf: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: '',
    email_nf: '',
    cnpj: '',
    emitir_nf: false,
    responsavel_nome: '',
    responsavel_cpf: '',
  })

  useEffect(() => {
    getCurrentPatient().then((p) => {
      if (p) {
        setPatient(p)
        setFormData({
          nome_completo: p.nome_completo || '',
          email: p.email || '',
          telefone: p.telefone || '',
          cpf: p.cpf || '',
          cep: p.cep || '',
          endereco: p.endereco || '',
          cidade: p.cidade || '',
          estado: p.estado || '',
          email_nf: p.email_nf || '',
          cnpj: p.cnpj || '',
          emitir_nf: p.emitir_nf || false,
          responsavel_nome: p.responsavel_nome || '',
          responsavel_cpf: p.responsavel_cpf || '',
        })
      }
      setLoading(false)
    })
  }, [])

  const handleCepChange = async (val: string) => {
    setFormData((p) => ({ ...p, cep: val }))
    const cleanCep = val.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData((p) => ({
            ...p,
            endereco: data.logradouro,
            cidade: data.localidade,
            estado: data.uf,
          }))
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  const maskCpf = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14)
  }

  const maskCnpj = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18)
  }

  const handleSave = async () => {
    if (!patient) return
    setSaving(true)
    try {
      await pb.collection('pacientes').update(patient.id, formData)
      toast({ title: 'Perfil atualizado com sucesso!' })
    } catch (e) {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Carregando...</div>
  if (!patient) return <div>Paciente não encontrado.</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais e de faturamento.
        </p>
      </div>

      {patient.is_menor && (
        <div className="bg-amber-100 text-amber-800 p-4 rounded-md font-medium border border-amber-200">
          Atendimento de menor de idade com autorização de responsável.
        </div>
      )}

      <Tabs defaultValue="pessoais" className="w-full">
        <TabsList className="mb-6 flex flex-wrap bg-transparent gap-2 h-auto">
          <TabsTrigger
            value="pessoais"
            className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 rounded-full px-4 border border-transparent data-[state=active]:border-sky-200"
          >
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger
            value="endereco"
            className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 rounded-full px-4 border border-transparent data-[state=active]:border-sky-200"
          >
            Endereço
          </TabsTrigger>
          <TabsTrigger
            value="pagamento"
            className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 rounded-full px-4 border border-transparent data-[state=active]:border-sky-200"
          >
            Dados de Pagamento
          </TabsTrigger>
          {patient.is_menor && (
            <TabsTrigger
              value="responsavel"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 rounded-full px-4 border border-transparent data-[state=active]:border-amber-200"
            >
              Responsável
            </TabsTrigger>
          )}
        </TabsList>

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <TabsContent value="pessoais" className="space-y-4 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: maskCpf(e.target.value) })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pagamento" className="space-y-4 m-0">
              <div className="flex items-center space-x-2 mb-4 p-4 border rounded-md bg-muted/20">
                <Checkbox
                  id="nf"
                  checked={formData.emitir_nf}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, emitir_nf: checked as boolean })
                  }
                />
                <Label htmlFor="nf" className="cursor-pointer">
                  Desejo que seja emitida Nota Fiscal para meus pagamentos
                </Label>
              </div>

              {formData.emitir_nf && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>E-mail para envio da NF</Label>
                    <Input
                      type="email"
                      value={formData.email_nf}
                      onChange={(e) => setFormData({ ...formData, email_nf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ (Opcional)</Label>
                    <Input
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {patient.is_menor && (
              <TabsContent value="responsavel" className="space-y-4 m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Responsável</Label>
                    <Input value={formData.responsavel_nome} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF do Responsável</Label>
                    <Input value={formData.responsavel_cpf} readOnly className="bg-muted" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Estes dados são preenchidos apenas pelo seu psicólogo.
                </p>
              </TabsContent>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
