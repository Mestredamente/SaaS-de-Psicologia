import { useState } from 'react'
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { updateContratoSaas, ContratoSaas } from '@/services/adminContratos'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { AlertCircle, Send, CheckCircle2, Printer } from 'lucide-react'

export function ContratoSaasPreview({
  contrato,
  onClose,
  onUpdate,
}: {
  contrato: ContratoSaas
  onClose: () => void
  onUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    setLoading(true)
    try {
      await updateContratoSaas(contrato.id, { status: 'enviado' })
      toast({ title: 'Contrato marcado como enviado.' })
      onUpdate()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Imprimir Contrato - ${contrato.numero_contrato}</title></head>
          <body style="padding: 20px; font-family: Arial, sans-serif;">
            ${contrato.conteudo}
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between w-full pr-8">
          <DialogTitle>Contrato: {contrato.numero_contrato}</DialogTitle>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </div>
      </DialogHeader>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-2 bg-slate-50 border rounded-md">
        <ScrollArea className="flex-1 p-4 sm:p-8">
          <div
            className="bg-white mx-auto shadow-sm border p-8 sm:p-12 min-h-[800px] max-w-[800px]"
            dangerouslySetInnerHTML={{ __html: contrato.conteudo }}
          />
        </ScrollArea>
      </div>

      <DialogFooter className="mt-4 flex-col sm:flex-row items-center gap-4 justify-between sm:justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-500 w-full sm:w-auto">
          {contrato.status === 'assinado' && contrato.data_assinatura && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Assinado em {format(new Date(contrato.data_assinatura), 'dd/MM/yyyy HH:mm')} (IP:{' '}
                {contrato.ip_assinatura || 'N/A'})
              </span>
            </div>
          )}
          {contrato.status === 'rascunho' && (
            <span className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Rascunho não enviado
            </span>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {contrato.status === 'rascunho' && (
            <Button onClick={handleSend} disabled={loading}>
              <Send className="w-4 h-4 mr-2" /> Marcar como Enviado
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  )
}
