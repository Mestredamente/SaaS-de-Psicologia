import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video } from 'lucide-react'

export default function SessoesOnline() {
  return (
    <div className="h-full flex items-center justify-center animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-none shadow-sm">
        <CardHeader>
          <div className="mx-auto bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Video className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Portal de Telepsicologia</CardTitle>
          <CardDescription>Realize seus atendimentos online com segurança.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">
            Em breve: Salas de vídeo integradas (HIPAA compliant), envio de links e compartilhamento
            de tela.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
