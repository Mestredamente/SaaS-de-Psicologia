import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function Pacientes() {
  return (
    <div className="h-full flex items-center justify-center animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-none shadow-sm">
        <CardHeader>
          <div className="mx-auto bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Gestão de Pacientes</CardTitle>
          <CardDescription>Cadastro e acompanhamento da sua carteira de pacientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">
            Em breve: Tabela pesquisável, filtros avançados e perfis detalhados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
