import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function Agenda() {
  return (
    <div className="h-full flex items-center justify-center animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-none shadow-sm">
        <CardHeader>
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Agenda Completa</CardTitle>
          <CardDescription>Gerencie todos os seus horários e compromissos.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">
            Em breve: Visualização de calendário completa, agendamento rápido e sincronização com
            Google Calendar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
