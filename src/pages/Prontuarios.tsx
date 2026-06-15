import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  Sparkles,
  Loader2,
  ArrowLeft,
  Check,
  X,
  User,
  Calendar,
  Save,
  PlusCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Prontuarios() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [prontuariosList, setProntuariosList] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(!id)
  const [consents, setConsents] = useState<any[]>([])
  const [activeTerms, setActiveTerms] = useState<any[]>([])

  // Editor State
  const [prontuario, setProntuario] = useState<any>(null)
  const [conteudo, setConteudo] = useState('')
  const [resumo, setResumo] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // AI Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestionText, setSuggestionText] = useState('')
  const [suggestionId, setSuggestionId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      loadProntuarios()
    } else {
      loadProntuario(id)
    }
  }, [id])

  const loadProntuarios = async () => {
    setLoadingList(true)
    try {
      const records = await pb.collection('prontuarios').getFullList({
        expand: 'paciente_id',
        sort: '-created',
      })
      setProntuariosList(records)

      const terms = await pb
        .collection('termos_consentimento')
        .getFullList({ filter: "status='ativo'" })
      setActiveTerms(terms)
      const pacIds = Array.from(new Set(records.map((r) => r.paciente_id)))
      if (pacIds.length > 0) {
        const c = await pb.collection('consentimentos_paciente').getFullList({
          filter: pacIds.map((id) => `paciente_id='${id}'`).join(' || '),
        })
        setConsents(c)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingList(false)
    }
  }

  const isCompliant = (pacienteId: string) => {
    const lgpd = activeTerms.find((t) => t.tipo === 'lgpd_geral')
    if (!lgpd) return true
    return consents.some(
      (c) =>
        c.paciente_id === pacienteId &&
        c.termo_id === lgpd.id &&
        c.versao === lgpd.versao &&
        c.status === 'aceito',
    )
  }

  const loadProntuario = async (recordId: string) => {
    try {
      const record = await pb.collection('prontuarios').getOne(recordId, {
        expand: 'paciente_id',
      })
      setProntuario(record)
      setConteudo(record.conteudo || '')
      setResumo(record.resumo || '')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao carregar prontuário',
        description: 'Não foi possível encontrar este registro.',
        variant: 'destructive',
      })
    }
  }

  const handleSaveProntuario = async () => {
    if (!prontuario) return
    setIsSaving(true)
    try {
      await pb.collection('prontuarios').update(prontuario.id, {
        conteudo,
      })
      toast({
        title: 'Salvo com sucesso',
        description: 'As anotações foram atualizadas.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateSummary = async () => {
    if (!conteudo.trim()) {
      toast({
        title: 'Conteúdo vazio',
        description: 'Escreva algumas anotações antes de gerar o resumo.',
        variant: 'destructive',
      })
      return
    }

    setIsSheetOpen(true)
    setIsGenerating(true)
    setSuggestionText('')
    setSuggestionId(null)

    try {
      // 1. Generate via AI Agent
      const res = await pb.send('/backend/v1/ai/summarize-prontuario', {
        method: 'POST',
        body: JSON.stringify({ texto: conteudo }),
        headers: { 'Content-Type': 'application/json' },
      })

      const generatedText = res.resumo

      // 2. Save pending suggestion
      const suggestionRecord = await pb.collection('sugestoes_ia_prontuario').create({
        prontuario_id: prontuario.id,
        psicologo_id: prontuario.psicologo_id,
        texto_original: conteudo,
        resumo_sugerido: generatedText,
        status: 'pendente',
      })

      setSuggestionText(generatedText)
      setSuggestionId(suggestionRecord.id)
    } catch (error: any) {
      setIsSheetOpen(false)
      toast({
        title: 'Erro na geração',
        description:
          error.message || 'A inteligência artificial não pôde processar o resumo agora.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApproveSuggestion = async () => {
    if (!suggestionId || !prontuario) return

    try {
      // Update the suggestion to approved
      await pb.collection('sugestoes_ia_prontuario').update(suggestionId, {
        status: 'aprovado',
        resumo_sugerido: suggestionText, // In case user edited it in the sheet
      })

      // Update the actual prontuario
      const updatedProntuario = await pb.collection('prontuarios').update(prontuario.id, {
        resumo: suggestionText,
      })

      setResumo(suggestionText)
      setIsSheetOpen(false)

      toast({
        title: 'Resumo incorporado',
        description: 'O resumo foi salvo no prontuário com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Ocorreu um erro ao salvar o resumo.',
        variant: 'destructive',
      })
    }
  }

  const handleDiscardSuggestion = async () => {
    if (!suggestionId) {
      setIsSheetOpen(false)
      return
    }

    try {
      await pb.collection('sugestoes_ia_prontuario').update(suggestionId, {
        status: 'descartado',
      })
      setIsSheetOpen(false)
      toast({
        description: 'A sugestão foi descartada.',
      })
    } catch (error) {
      setIsSheetOpen(false)
    }
  }

  const handleCreateMock = async () => {
    setLoadingList(true)
    try {
      let profile
      try {
        profile = await pb
          .collection('perfis_psicologos')
          .getFirstListItem(`user_id = "${user?.id}"`)
      } catch {
        profile = await pb.collection('perfis_psicologos').create({
          user_id: user?.id,
          nome_completo: user?.name || 'Psicólogo Teste',
          email: user?.email || 'teste@teste.com',
          crp: '00/00000',
        })
      }

      const paciente = await pb.collection('pacientes').create({
        nome_completo: 'Maria Oliveira (Exemplo)',
        psicologo_id: profile.id,
        status: 'ativo',
      })

      await pb.collection('prontuarios').create({
        paciente_id: paciente.id,
        psicologo_id: profile.id,
        conteudo:
          'A paciente compareceu à sessão relatando alta carga de estresse no ambiente de trabalho durante a última semana. Mencionou episódios de insônia e pensamentos acelerados. Discutimos estratégias de enfrentamento focadas na respiração diafragmática e estabelecemos a meta de tentar praticar mindfulness por 10 minutos diários antes de dormir.',
      })

      loadProntuarios()
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingList(false)
    }
  }

  if (!id) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Prontuários Clínicos
            </h1>
            <p className="text-muted-foreground mt-1">
              Acesse o histórico e evoluções de seus pacientes.
            </p>
          </div>
          <Button onClick={handleCreateMock} variant="outline" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Criar Exemplo
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loadingList ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : prontuariosList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p>Nenhum prontuário encontrado.</p>
              </div>
            ) : (
              <div className="divide-y">
                {prontuariosList.map((p) => (
                  <Link
                    key={p.id}
                    to={`/prontuarios/${p.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {p.expand?.paciente_id?.nome_completo || 'Paciente Desconhecido'}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Atualizado em{' '}
                          {format(new Date(p.updated), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {!isCompliant(p.paciente_id) && (
                        <Badge variant="destructive" className="text-[10px] px-2 h-5">
                          LGPD Pendente
                        </Badge>
                      )}
                      {p.resumo && (
                        <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                          Resumido
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!prontuario) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/prontuarios">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Evolução Clínica</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4" />
              {prontuario.expand?.paciente_id?.nome_completo}
            </p>
          </div>
        </div>

        <Button onClick={handleSaveProntuario} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Anotações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Editor Area */}
        <Card className="shadow-sm border-slate-200 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-slate-50/50 rounded-t-xl border-b">
            <div>
              <CardTitle className="text-lg">Anotações da Sessão</CardTitle>
              <CardDescription>Registro livre dos temas abordados.</CardDescription>
            </div>
            <Button
              onClick={handleGenerateSummary}
              variant="secondary"
              className="bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 border border-teal-200 shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar resumo com IA
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Digite aqui as anotações do atendimento..."
              className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 text-base leading-relaxed p-6 resize-none"
            />
          </CardContent>
        </Card>

        {/* Structured Summary Area */}
        {resumo && (
          <Card className="shadow-sm border-teal-100 bg-teal-50/30 lg:col-span-2 animate-fade-in-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-teal-900">
                <FileText className="w-5 h-5 text-teal-600" />
                Resumo Estruturado
              </CardTitle>
              <CardDescription>
                Resumo clínico gerado por inteligência artificial e aprovado por você.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-teal max-w-none text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {resumo}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Suggestion Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-full border-l border-teal-100 bg-slate-50 flex flex-col p-0">
          <div className="p-6 border-b bg-white">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-teal-800">
                <Sparkles className="w-5 h-5" />
                Sugestão gerada por IA
              </SheetTitle>
              <SheetDescription>
                Revise, edite se necessário, e aprove para salvar no prontuário. O texto será
                estruturado de acordo com os padrões clínicos.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isGenerating ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-4 w-[85%]" />
                </div>
                <div className="flex flex-col items-center justify-center pt-12 text-teal-600/60">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-sm font-medium animate-pulse">
                    Analisando anotações clínicas...
                  </p>
                </div>
              </div>
            ) : (
              <Textarea
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                className="min-h-full h-full border-teal-200 focus-visible:ring-teal-500 bg-white shadow-inner resize-none p-5 leading-relaxed text-sm"
              />
            )}
          </div>

          <div className="p-6 bg-white border-t flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleDiscardSuggestion}
              disabled={isGenerating}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <X className="w-4 h-4 mr-2" />
              Descartar
            </Button>
            <Button
              onClick={handleApproveSuggestion}
              disabled={isGenerating || !suggestionText.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Aprovar e Salvar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
