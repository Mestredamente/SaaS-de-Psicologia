import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'

export default function Documentos() {
  return (
    <div className="h-full flex items-center justify-center animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-none shadow-sm">
        <CardHeader>
          <div className="mx-auto bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Documentos e Modelos</CardTitle>
          <CardDescription>Gere recibos, atestados e declarações.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8">
            Em breve: Templates prontos, preenchimento automático e exportação em PDF.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
