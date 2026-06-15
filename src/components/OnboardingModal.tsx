import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { completeOnboarding } from '@/services/notificacoes'
import {
  CheckCircle2,
  ChevronRight,
  User,
  Calendar,
  Settings,
  ShieldCheck,
  Stethoscope,
  Building2,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export function OnboardingModal() {
  const { user, perfil } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [modo, setModo] = useState<'autonomo' | 'clinica' | null>(null)
  const [codigoClinica, setCodigoClinica] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (user && user.onboarding_completed === false) {
      setOpen(true)
    }
  }, [user])

  if (!user) return null

  const getRoleSteps = () => {
    switch (user.role) {
      case 'psicologo':
        return {
          title: 'Bem-vindo à sua nova gestão clínica.',
          description:
            'Siga estes passos para configurar seu consultório e começar a atender com mais facilidade.',
          steps: [
            {
              title: 'Modo de Trabalho',
              desc: 'Escolha como você vai atuar no sistema.',
              icon: Briefcase,
            },
            { title: 'Complete seu perfil', desc: 'Adicione suas informações e foto.', icon: User },
            {
              title: 'Pronto para começar',
              desc: 'Tudo configurado para seus atendimentos.',
              icon: Stethoscope,
            },
          ],
        }
      case 'paciente':
        return {
          title: 'Bem-vindo ao seu espaço de cuidado.',
          description: 'Aqui você acompanha suas sessões e histórico com segurança e privacidade.',
          steps: [
            {
              title: 'Complete seus dados',
              desc: 'Mantenha suas informações atualizadas.',
              icon: User,
            },
            {
              title: 'Aceite os termos',
              desc: 'Assine digitalmente os termos de consentimento.',
              icon: ShieldCheck,
            },
            {
              title: 'Veja sua próxima sessão',
              desc: 'Acesse os links de videochamada online.',
              icon: Calendar,
            },
          ],
        }
      case 'clinica':
        return {
          title: 'Bem-vindo ao painel da sua clínica.',
          description: 'Gerencie sua equipe, contratos e os atendimentos em um só lugar.',
          steps: [
            {
              title: 'Configure os dados',
              desc: 'Insira as informações gerais da clínica.',
              icon: Settings,
            },
            {
              title: 'Adicione psicólogos',
              desc: 'Convide os profissionais para o sistema.',
              icon: User,
            },
            {
              title: 'Acompanhe atendimentos',
              desc: 'Tenha a visão centralizada da agenda.',
              icon: Calendar,
            },
          ],
        }
      case 'funcionario':
        return {
          title: 'Bem-vindo à equipe.',
          description: 'Seu painel para auxiliar na gestão do dia a dia da clínica e agenda.',
          steps: [
            {
              title: 'Conheça suas permissões',
              desc: 'Veja as áreas que você tem acesso no menu lateral.',
              icon: ShieldCheck,
            },
            {
              title: 'Veja a agenda',
              desc: 'Acompanhe e organize os horários da clínica.',
              icon: Calendar,
            },
          ],
        }
      default:
        return {
          title: 'Bem-vindo!',
          description: 'Estamos felizes em ter você aqui na plataforma.',
          steps: [
            {
              title: 'Explore o sistema',
              desc: 'Descubra todas as funcionalidades disponíveis.',
              icon: Settings,
            },
          ],
        }
    }
  }

  const roleInfo = getRoleSteps()

  const handleComplete = async () => {
    setSaving(true)
    try {
      await completeOnboarding(user.id)
      setOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    if (user?.role === 'psicologo' && step === 0) {
      if (!modo) {
        toast({
          title: 'Atenção',
          description: 'Escolha um modo de trabalho.',
          variant: 'destructive',
        })
        return
      }
      if (modo === 'clinica') {
        if (!codigoClinica) {
          toast({
            title: 'Atenção',
            description: 'Insira o código da clínica.',
            variant: 'destructive',
          })
          return
        }
        setSaving(true)
        try {
          const clinica = await pb.collection('clinicas').getOne(codigoClinica)
          if (perfil) {
            await pb.collection('perfis_psicologos').update(perfil.id, { clinica_id: clinica.id })
            try {
              await pb.collection('psicologos_clinica').create({
                clinica_id: clinica.id,
                psicologo_id: perfil.id,
                status: 'ativo',
              })
            } catch {
              /* intentionally ignored */
            }
          }
          toast({ title: 'Sucesso', description: 'Vinculado à clínica ' + clinica.nome_fantasia })
        } catch (e) {
          toast({
            title: 'Erro',
            description: 'Código de clínica inválido.',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
        setSaving(false)
      }
    }

    if (step < roleInfo.steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (val) setOpen(val)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{roleInfo.title}</DialogTitle>
          <DialogDescription className="text-base mt-2">{roleInfo.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex flex-col gap-4">
            {roleInfo.steps.map((s, i) => {
              const Icon = s.icon
              const isActive = i === step
              const isCompleted = i < step
              return (
                <div key={i} className="flex flex-col gap-3">
                  <div
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border transition-all duration-300',
                      isActive
                        ? 'border-primary/50 bg-primary/5 shadow-sm'
                        : 'border-transparent opacity-60',
                      isCompleted && 'opacity-100',
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-100 text-slate-400',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4
                        className={cn(
                          'font-medium transition-colors',
                          isActive && 'text-primary',
                          isCompleted && 'text-green-700',
                        )}
                      >
                        {s.title}
                      </h4>
                      {(isActive || isCompleted) && (
                        <p className="text-sm text-muted-foreground mt-1 animate-fade-in">
                          {s.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {isActive && i === 0 && user.role === 'psicologo' && (
                    <div className="pl-14 pr-4 space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setModo('autonomo')}
                          className={cn(
                            'flex flex-col items-center p-4 border rounded-xl hover:border-primary/50 transition-colors',
                            modo === 'autonomo' &&
                              'border-primary bg-primary/5 ring-1 ring-primary/20',
                          )}
                        >
                          <User className="w-8 h-8 mb-2 text-blue-600" />
                          <span className="font-medium text-slate-900">Autônomo</span>
                          <span className="text-xs text-slate-500 mt-1">
                            Atendo por conta própria
                          </span>
                        </button>
                        <button
                          onClick={() => setModo('clinica')}
                          className={cn(
                            'flex flex-col items-center p-4 border rounded-xl hover:border-primary/50 transition-colors',
                            modo === 'clinica' &&
                              'border-primary bg-primary/5 ring-1 ring-primary/20',
                          )}
                        >
                          <Building2 className="w-8 h-8 mb-2 text-indigo-600" />
                          <span className="font-medium text-slate-900">Vinculado a Clínica</span>
                          <span className="text-xs text-slate-500 mt-1">
                            Tenho um código de convite
                          </span>
                        </button>
                      </div>

                      {modo === 'clinica' && (
                        <div className="mt-4 animate-fade-in">
                          <label className="text-sm font-medium mb-1.5 block text-slate-700">
                            Código da Clínica
                          </label>
                          <Input
                            placeholder="Insira o ID da Clínica"
                            value={codigoClinica}
                            onChange={(e) => setCodigoClinica(e.target.value)}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Peça este código ao administrador da clínica.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {roleInfo.steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === step ? 'w-6 bg-primary' : 'w-2 bg-slate-200',
                )}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleComplete}
            disabled={saving}
          >
            Pular onboarding
          </Button>
          <Button onClick={handleNext} disabled={saving} className="min-w-[140px]">
            {step === roleInfo.steps.length - 1 ? 'Começar agora' : 'Próximo'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
