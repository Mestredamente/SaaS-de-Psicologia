import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

export default function AdminTermos() {
  const [termos, setTermos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ tipo: 'lgpd_geral', versao: '1.0', conteudo: '' })

  const loadData = async () => {
    try {
      const records = await pb.collection('termos_consentimento').getFullList({ sort: '-created' })
      setTermos(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const previous = termos.filter((t) => t.tipo === formData.tipo && t.status === 'ativo')
      for (const p of previous) {
        await pb.collection('termos_consentimento').update(p.id, { status: 'inativo' })
      }
      await pb.collection('termos_consentimento').create({
        ...formData,
        status: 'ativo',
        data_publicacao: new Date().toISOString(),
      })
      toast({ title: 'Termo publicado com sucesso' })
      setOpen(false)
      loadData()
      setFormData({ tipo: 'lgpd_geral', versao: '1.0', conteudo: '' })
    } catch (err: any) {
      toast({ title: 'Erro ao criar', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Termos e Consentimentos
          </h1>
          <p className="text-muted-foreground">
            Gestão de termos da LGPD e regulamentações do CFP.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Termo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Versão de Termo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Termo</label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lgpd_geral">LGPD Geral</SelectItem>
                      <SelectItem value="tratamento_dados">Tratamento de Dados</SelectItem>
                      <SelectItem value="terapia_online">Terapia Online</SelectItem>
                      <SelectItem value="menor_idade">Menor de Idade</SelectItem>
                      <SelectItem value="compartilhamento_supervisao">
                        Compartilhamento para Supervisão
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Versão</label>
                  <Input
                    value={formData.versao}
                    onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                    required
                    placeholder="Ex: 2.0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Conteúdo do Termo (HTML aceito)</label>
                <Textarea
                  className="min-h-[250px]"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Publicar Nova Versão
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Data Publicação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {termos.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium capitalize">
                    {t.tipo.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>v{t.versao}</TableCell>
                  <TableCell>{format(new Date(t.data_publicacao), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'ativo' ? 'default' : 'secondary'}>
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {termos.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum termo cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
