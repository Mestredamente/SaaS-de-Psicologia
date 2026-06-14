import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CircleDollarSign } from 'lucide-react'

export default function Financeiro() {
  return (
    <div className="h-full flex items-center justify-center animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-none shadow-sm">
        <CardHeader>
          <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CircleDollarSign className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Controle Financeiro</CardTitle>
          <CardDescription>Acompanhe suas receitas, despesas e faturamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">
            Em breve: Fluxo de caixa detalhado, controle de inadimplência e relatórios financeiros.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
