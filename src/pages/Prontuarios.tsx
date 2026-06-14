import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function Prontuarios() {
  const { id } = useParams()

  return (
    <div className="h-full flex items-center justify-center animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-none shadow-sm">
        <CardHeader>
          <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Prontuários Clínicos</CardTitle>
          <CardDescription>
            {id
              ? `Visualizando prontuário do paciente (ID: ${id})`
              : 'Acesse o histórico clínico de todos os pacientes.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">
            Em breve: Editor de texto rico para evoluções, histórico de sessões e anexos seguros.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
