import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function Configuracoes() {
  return (
    <div className="h-full flex items-center justify-center animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-none shadow-sm">
        <CardHeader>
          <div className="mx-auto bg-slate-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-slate-600" />
          </div>
          <CardTitle className="text-2xl">Configurações</CardTitle>
          <CardDescription>Ajuste as preferências do sistema e seu perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">
            Em breve: Edição de perfil, alteração de senha, notificações e personalização visual.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
