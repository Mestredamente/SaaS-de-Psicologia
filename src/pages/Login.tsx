import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { Brain } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('ana@psicologa.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'paciente') return <Navigate to="/paciente" replace />
    if (user.role === 'clinica') return <Navigate to="/clinica" replace />
    if (user.role === 'funcionario') return <Navigate to="/funcionario" replace />
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Email ou senha incorretos',
        description: 'Verifique suas credenciais e tente novamente.',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">PsicoGestão</CardTitle>
          <CardDescription>Entre na sua conta para acessar o painel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 space-y-2 border-t pt-4">
            <p className="text-xs text-center text-muted-foreground mb-2">Acesso Rápido (Teste)</p>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button variant="outline" size="sm" onClick={() => setEmail('ana@psicologa.com')}>
                Psi Ana
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEmail('fernanda@mentesa.com')}>
                Sec Fernanda
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEmail('carlos@mentesa.com')}>
                Adm Carlos
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEmail('admin@mentesa.com')}>
                Super Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
