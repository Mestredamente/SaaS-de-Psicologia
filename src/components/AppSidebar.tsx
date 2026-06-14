import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
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
  Settings,
  User,
  Calendar,
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

const clinicNavItems = [
  { title: 'Dashboard', path: '/clinica', icon: LayoutDashboard },
  { title: 'Psicólogos', path: '/clinica/psicologos', icon: UserCircle },
  { title: 'Agenda da Clínica', path: '/clinica/agenda', icon: CalendarDays },
  { title: 'Financeiro', path: '/clinica/financeiro', icon: Wallet },
  { title: 'Relatórios', path: '/clinica/relatorios', icon: FileText },
  { title: 'Configurações', path: '/clinica/configuracoes', icon: Settings },
]

export function AppSidebar({
  isPatientArea,
  isClinicArea,
}: {
  isPatientArea?: boolean
  isClinicArea?: boolean
}) {
  const location = useLocation()
  const { signOut } = useAuth()
  const { state } = useSidebar()

  const navItems = isClinicArea ? clinicNavItems : isPatientArea ? patientNavItems : psychNavItems

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={`h-16 flex items-center px-4 border-b transition-colors ${
          isClinicArea ? 'bg-indigo-50/30' : isPatientArea ? 'bg-sky-50/30' : 'bg-slate-50/30'
        }`}
      >
        {state === 'expanded' ? (
          <div
            className={`font-semibold text-lg flex items-center gap-2 ${
              isClinicArea ? 'text-indigo-600' : isPatientArea ? 'text-sky-600' : 'text-slate-700'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-md text-white flex items-center justify-center ${
                isClinicArea ? 'bg-indigo-600' : isPatientArea ? 'bg-sky-600' : 'bg-slate-700'
              }`}
            >
              {isClinicArea ? 'C' : isPatientArea ? 'P' : 'Psi'}
            </div>
            <span className="truncate">
              {isClinicArea
                ? 'Painel da Clínica'
                : isPatientArea
                  ? 'Portal Paciente'
                  : 'Área do Psicólogo'}
            </span>
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-md text-white flex items-center justify-center mx-auto ${
              isClinicArea ? 'bg-indigo-600' : isPatientArea ? 'bg-sky-600' : 'bg-slate-700'
            }`}
          >
            {isClinicArea ? 'C' : isPatientArea ? 'P' : 'Psi'}
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2 py-4 flex flex-col gap-6">
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' &&
                    item.path !== '/paciente' &&
                    item.path !== '/clinica' &&
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
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Trocar de Área</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!isPatientArea && !isClinicArea ? null : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Área do Psicólogo">
                    <Link to="/agenda">
                      <Calendar className="h-5 w-5" />
                      <span>Área do Psicólogo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isClinicArea ? null : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Área da Clínica">
                    <Link to="/clinica">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Área da Clínica</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isPatientArea ? null : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Área do Paciente">
                    <Link to="/paciente">
                      <User className="h-5 w-5" />
                      <span>Área do Paciente</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
