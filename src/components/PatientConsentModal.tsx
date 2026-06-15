import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getActiveTerms, getPatientConsents, acceptTerms } from '@/services/compliance'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export function PatientConsentModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [terms, setTerms] = useState<any[]>([])
  const [acceptedState, setAcceptedState] = useState<Record<string, boolean>>({})
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'paciente') {
      checkConsents()
    }
  }, [user])

  const checkConsents = async () => {
    try {
      const pac = await pb.collection('pacientes').getFirstListItem(`user_id = '${user.id}'`)
      setPatient(pac)
      const activeTerms = await getActiveTerms()
      const consents = await getPatientConsents(pac.id)

      const missingTerms = activeTerms.filter((t) => {
        if (t.tipo === 'menor_idade' && !pac.is_menor) return false
        if (!['lgpd_geral', 'tratamento_dados', 'terapia_online', 'menor_idade'].includes(t.tipo))
          return false

        const hasAccepted = consents.some(
          (c) => c.termo_id === t.id && c.versao === t.versao && c.status === 'aceito',
        )
        return !hasAccepted
      })

      if (missingTerms.length > 0) {
        setTerms(missingTerms)
        setOpen(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptAll = async () => {
    const allChecked = terms.every((t) => acceptedState[t.id])
    if (!allChecked) return

    try {
      await acceptTerms(patient.id, terms)
      setOpen(false)
    } catch (e) {
      console.error('Failed to accept terms', e)
    }
  }

  if (loading || !open) return null

  const allChecked = terms.every((t) => acceptedState[t.id])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Atualização dos Termos de Uso e Privacidade</DialogTitle>
          <DialogDescription>
            Para continuar acessando o portal, é necessário ler e aceitar os nossos termos
            atualizados conforme a LGPD e resoluções do CFP.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[40vh] border rounded-md p-4 bg-slate-50">
          <div className="space-y-6">
            {terms.map((t) => (
              <div key={t.id} className="space-y-3">
                <div className="flex items-center gap-2 font-medium text-slate-900 border-b pb-2">
                  <span>
                    Termo: {t.tipo.replace('_', ' ').toUpperCase()} (v{t.versao})
                  </span>
                </div>
                <div
                  className="prose prose-sm text-slate-600"
                  dangerouslySetInnerHTML={{ __html: t.conteudo }}
                />
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id={`accept-${t.id}`}
                    checked={!!acceptedState[t.id]}
                    onCheckedChange={(c) => setAcceptedState((prev) => ({ ...prev, [t.id]: !!c }))}
                  />
                  <label
                    htmlFor={`accept-${t.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Li e aceito os termos acima
                  </label>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {!allChecked && (
          <p className="text-sm text-amber-600 mt-2">
            Para utilizar a plataforma, é necessário aceitar os termos de consentimento. Em caso de
            dúvidas, entre em contato com seu psicólogo.
          </p>
        )}
        <DialogFooter>
          <Button disabled={!allChecked} onClick={handleAcceptAll} className="w-full">
            Aceitar todos os termos e acessar o portal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
