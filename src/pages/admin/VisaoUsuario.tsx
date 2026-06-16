import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { UserCircle, Users, Building2, Briefcase, Search, Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

interface UserItem {
  id: string
  email: string
  name: string
  nome_completo: string
  role: string
  status: string
}

export default function VisaoUsuario() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [usersList, setUsersList] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const handleOpenModal = (role: string) => {
    setSelectedRole(role)
    setIsModalOpen(true)
    setSearch('')
    fetchUsers(role)
  }

  const fetchUsers = async (role: string) => {
    setLoading(true)
    try {
      const res = await pb.send(`/backend/v1/admin/users_list?role=${role}`, { method: 'GET' })
      setUsersList(res.items || [])
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao buscar usuários', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = usersList.filter((u) => {
    const term = search.toLowerCase()
    const nome = (u.nome_completo || u.name || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    return nome.includes(term) || email.includes(term)
  })

  const handleSimulate = async (user: UserItem) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/admin/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token,
        },
        body: JSON.stringify({ user_id: user.id }),
      })

      if (!res.ok) {
        throw new Error('Falha na requisição')
      }

      const sim_id = res.headers.get('X-Sim-Id')
      const { token, record } = await res.json()

      if (!token || !record) throw new Error('Falha na autenticação simulada')

      if (sim_id) {
        localStorage.setItem('sim_id', sim_id)
      }

      localStorage.setItem(
        'admin_auth_simulation',
        JSON.stringify({ token: pb.authStore.token, record: pb.authStore.record }),
      )

      pb.authStore.save(token, record)

      toast({
        title: 'Simulação iniciada',
        description: `Você agora está visualizando como ${user.nome_completo || user.email}`,
      })

      let redirectUrl = '/dashboard'
      if (user.role === 'paciente') redirectUrl = '/paciente'
      else if (user.role === 'clinica') redirectUrl = '/clinica'
      else if (user.role === 'funcionario') redirectUrl = '/funcionario'
      else if (user.role === 'admin') redirectUrl = '/admin'

      window.location.href = redirectUrl
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao iniciar simulação', variant: 'destructive' })
    }
  }

  const cards = [
    {
      role: 'paciente',
      title: 'Paciente',
      description:
        'Acesse o portal do paciente, visualize agendamentos, diário sentimental e pagamentos.',
      icon: UserCircle,
      color: 'bg-sky-500',
    },
    {
      role: 'psicologo',
      title: 'Psicólogo',
      description: 'Veja a área do psicólogo: agenda, prontuários, financeiro e configurações.',
      icon: Users,
      color: 'bg-indigo-500',
    },
    {
      role: 'clinica',
      title: 'Clínica',
      description:
        'Acesse o painel da clínica, gestão de profissionais, financeiro geral e relatórios.',
      icon: Building2,
      color: 'bg-emerald-500',
    },
    {
      role: 'funcionario',
      title: 'Funcionário',
      description: 'Simule a visão de recepcionistas ou administrativos com base nas permissões.',
      icon: Briefcase,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão de Usuário</h1>
        <p className="text-slate-500 mt-1">
          Simule o acesso de qualquer perfil de usuário para prestar suporte ou verificar a
          interface.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card
            key={card.role}
            className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 ${card.color}`}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription className="h-16">{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleOpenModal(card.role)}
              >
                Entrar como {card.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="capitalize">Selecionar {selectedRole}</DialogTitle>
            <DialogDescription>Busque e selecione o usuário que deseja simular.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 gap-3"
                    >
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.nome_completo || user.name || 'Sem nome'}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                      <Button onClick={() => handleSimulate(user)} size="sm" className="shrink-0">
                        Iniciar Simulação
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
