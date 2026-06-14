import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  FileText,
  DollarSign,
  Video,
  LogOut,
  BookHeart,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const patientNavItems = [
  { title: 'Dashboard', path: '/paciente', icon: LayoutDashboard },
  { title: 'Meu Perfil', path: '/paciente/perfil', icon: UserCircle },
  { title: 'Minha Agenda', path: '/paciente/agenda', icon: CalendarDays },
  { title: 'Meu Prontuário', path: '/paciente/prontuario', icon: FileText },
  { title: 'Meu Diário', path: '/paciente/diario', icon: BookHeart },
  { title: 'Pagamentos', path: '/paciente/pagamentos', icon: DollarSign },
  { title: 'Sessões Online', path: '/paciente/sessoes-online', icon: Video },
]

const psychNavItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Agenda', path: '/agenda', icon: CalendarDays },
  { title: 'Prontuários', path: '/prontuarios', icon: FileText },
  { title: 'Financeiro', path: '/financeiro', icon: Wallet },
  { title: 'Sessões Online', path: '/sessoes-online', icon: Video },
]

export function AppSidebar({ isPatientArea }: { isPatientArea?: boolean }) {
  const location = useLocation()
  const { signOut } = useAuth()
  const { state } = useSidebar()

  const navItems = isPatientArea ? patientNavItems : psychNavItems

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={`h-16 flex items-center px-4 border-b transition-colors ${isPatientArea ? 'bg-sky-50/30' : 'bg-slate-50/30'}`}
      >
        {state === 'expanded' ? (
          <div
            className={`font-semibold text-lg flex items-center gap-2 ${isPatientArea ? 'text-sky-600' : 'text-slate-700'}`}
          >
            <div
              className={`w-8 h-8 rounded-md text-white flex items-center justify-center ${isPatientArea ? 'bg-sky-600' : 'bg-slate-700'}`}
            >
              {isPatientArea ? 'P' : 'Psi'}
            </div>
            <span className="truncate">
              {isPatientArea ? 'Portal Paciente' : 'Área do Psicólogo'}
            </span>
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-md text-white flex items-center justify-center mx-auto ${isPatientArea ? 'bg-sky-600' : 'bg-slate-700'}`}
          >
            {isPatientArea ? 'P' : 'Psi'}
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' &&
                item.path !== '/paciente' &&
                location.pathname.startsWith(item.path))

            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link to={item.path}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sair" variant="outline">
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
