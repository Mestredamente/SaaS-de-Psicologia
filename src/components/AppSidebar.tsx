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
  ChevronDown,
  ShieldAlert,
  BookOpen,
  Users,
  BarChart2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useFuncionario } from '@/hooks/use-funcionario'
import { useSupervisao } from '@/hooks/use-supervisao'
import { useFinanceiroAtrasado } from '@/hooks/use-financeiro'

const patientNavItems = [
  { title: 'Dashboard', path: '/paciente', icon: LayoutDashboard },
  { title: 'Meu Perfil', path: '/paciente/perfil', icon: UserCircle },
  { title: 'Minha Agenda', path: '/paciente/agenda', icon: CalendarDays },
  { title: 'Meu Prontuário', path: '/paciente/prontuario', icon: FileText },
  { title: 'Meu Diário', path: '/paciente/diario', icon: BookHeart },
  { title: 'Pagamentos', path: '/paciente/pagamentos', icon: DollarSign },
  { title: 'Sessões Online', path: '/paciente/sessoes-online', icon: Video },
]

const psychNavItemsBase = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Agenda', path: '/agenda', icon: CalendarDays },
  { title: 'Prontuários', path: '/prontuarios', icon: FileText },
  { title: 'Financeiro', path: '/financeiro', icon: Wallet },
  { title: 'Relatórios', path: '/relatorios', icon: BarChart2 },
  { title: 'Sessões Online', path: '/sessoes-online', icon: Video },
]

const clinicNavItems = [
  { title: 'Dashboard', path: '/clinica', icon: LayoutDashboard },
  { title: 'Psicólogos', path: '/clinica/psicologos', icon: UserCircle },
  { title: 'Agenda da Clínica', path: '/clinica/agenda', icon: CalendarDays },
  { title: 'Financeiro', path: '/clinica/financeiro', icon: Wallet },
  { title: 'Relatórios', path: '/clinica/relatorios', icon: BarChart2 },
  { title: 'Configurações', path: '/clinica/configuracoes', icon: Settings },
]

const adminNavItems = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Planos', path: '/admin/planos', icon: FileText },
  { title: 'Assinaturas', path: '/admin/assinaturas', icon: DollarSign },
  { title: 'Contratos SaaS', path: '/admin/contratos', icon: FileText },
  { title: 'Usuários', path: '/admin/usuarios', icon: UserCircle },
  { title: 'Termos LGPD', path: '/admin/termos', icon: ShieldAlert },
  { title: 'Auditoria', path: '/admin/auditoria', icon: BookOpen },
  { title: 'Relatórios', path: '/admin/relatorios', icon: FileText },
  { title: 'Configurações', path: '/admin/configuracoes', icon: Settings },
]

const supervisorNavItems = [
  { title: 'Dashboard', path: '/supervisor', icon: LayoutDashboard },
  { title: 'Meus Supervisandos', path: '/supervisor/supervisandos', icon: Users },
  { title: 'Sessões', path: '/supervisor/sessoes', icon: CalendarDays },
  { title: 'Casos', path: '/supervisor/casos', icon: BookOpen },
  { title: 'Relatórios', path: '/supervisor/relatorios', icon: FileText },
  { title: 'Configurações', path: '/supervisor/configuracoes', icon: Settings },
]

const funcionarioBaseNavItems = [
  { title: 'Dashboard', path: '/funcionario', icon: LayoutDashboard },
  { title: 'Agenda da Clínica', path: '/funcionario/agenda', icon: CalendarDays },
  { title: 'Pacientes', path: '/funcionario/pacientes', icon: UserCircle },
]

export function AppSidebar({
  isPatientArea,
  isClinicArea,
  isFuncionarioArea,
  isAdminArea,
  isSupervisorArea,
}: {
  isPatientArea?: boolean
  isClinicArea?: boolean
  isFuncionarioArea?: boolean
  isAdminArea?: boolean
  isSupervisorArea?: boolean
}) {
  const { funcionario } = useFuncionario()
  const { isSupervisor, isSupervisando } = useSupervisao()
  const location = useLocation()
  const { signOut } = useAuth()
  const { state } = useSidebar()
  const { hasAtrasado } = useFinanceiroAtrasado()

  let navItems = isAdminArea
    ? adminNavItems
    : isClinicArea
      ? clinicNavItems
      : isPatientArea
        ? patientNavItems
        : isSupervisorArea
          ? supervisorNavItems
          : psychNavItemsBase

  if (!isAdminArea && !isClinicArea && !isFuncionarioArea && !isPatientArea && !isSupervisorArea) {
    navItems = [...psychNavItemsBase]
    if (isSupervisando) {
      navItems.push({ title: 'Minha Supervisão', path: '/minha-supervisao', icon: ShieldAlert })
    }
  }

  if (isFuncionarioArea) {
    navItems = [...funcionarioBaseNavItems]
    if (funcionario?.permissao_financeiro) {
      navItems.push({ title: 'Financeiro', path: '/funcionario/financeiro', icon: Wallet })
    }
    if (funcionario?.permissao_relatorios) {
      navItems.push({ title: 'Relatórios', path: '/funcionario/relatorios', icon: FileText })
    }
    navItems.push({ title: 'Configurações', path: '/funcionario/configuracoes', icon: Settings })
  }

  const getHeaderStyle = () => {
    if (isAdminArea) return 'bg-slate-100/50'
    if (isClinicArea || isFuncionarioArea) return 'bg-indigo-50/30'
    if (isPatientArea) return 'bg-sky-50/30'
    if (isSupervisorArea) return 'bg-emerald-50/30'
    return 'bg-slate-50/30'
  }

  const getTextStyle = () => {
    if (isAdminArea) return 'text-slate-900'
    if (isClinicArea || isFuncionarioArea) return 'text-indigo-600'
    if (isPatientArea) return 'text-sky-600'
    if (isSupervisorArea) return 'text-emerald-600'
    return 'text-slate-700'
  }

  const getIconBgStyle = () => {
    if (isAdminArea) return 'bg-slate-900'
    if (isClinicArea || isFuncionarioArea) return 'bg-indigo-600'
    if (isPatientArea) return 'bg-sky-600'
    if (isSupervisorArea) return 'bg-emerald-600'
    return 'bg-slate-700'
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={`h-16 flex items-center px-4 border-b transition-colors ${getHeaderStyle()}`}
      >
        {state === 'expanded' ? (
          <div className={`font-semibold text-lg flex items-center gap-2 ${getTextStyle()}`}>
            <div
              className={`w-8 h-8 rounded-md text-white flex items-center justify-center ${getIconBgStyle()}`}
            >
              {isAdminArea
                ? 'A'
                : isClinicArea
                  ? 'C'
                  : isFuncionarioArea
                    ? 'F'
                    : isPatientArea
                      ? 'P'
                      : isSupervisorArea
                        ? 'Sup'
                        : 'Psi'}
            </div>
            <span className="truncate">
              {isAdminArea
                ? 'Painel Admin'
                : isClinicArea
                  ? 'Painel da Clínica'
                  : isFuncionarioArea
                    ? 'Painel Funcionário'
                    : isPatientArea
                      ? 'Portal Paciente'
                      : isSupervisorArea
                        ? 'Área do Supervisor'
                        : 'Área do Psicólogo'}
            </span>
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-md text-white flex items-center justify-center mx-auto ${getIconBgStyle()}`}
          >
            {isAdminArea
              ? 'A'
              : isClinicArea
                ? 'C'
                : isFuncionarioArea
                  ? 'F'
                  : isPatientArea
                    ? 'P'
                    : isSupervisorArea
                      ? 'Sup'
                      : 'Psi'}
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
                    item.path !== '/funcionario' &&
                    item.path !== '/supervisor' &&
                    location.pathname.startsWith(item.path))

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.path} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        {item.title === 'Financeiro' && hasAtrasado && (
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible className="group/collapsible mt-auto">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Trocar de Área
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {!isPatientArea && !isClinicArea && !isSupervisorArea ? null : (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Área do Psicólogo">
                        <Link to="/agenda">
                          <Calendar className="h-5 w-5" />
                          <span>Área do Psicólogo</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isSupervisor && !isSupervisorArea ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Área do Supervisor">
                        <Link to="/supervisor">
                          <ShieldAlert className="h-5 w-5" />
                          <span>Área do Supervisor</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null}
                  {!isClinicArea && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Área da Clínica">
                        <Link to="/clinica">
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Área da Clínica</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {!isPatientArea && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Área do Paciente">
                        <Link to="/paciente">
                          <User className="h-5 w-5" />
                          <span>Área do Paciente</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {!isFuncionarioArea && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Área do Funcionário">
                        <Link to="/funcionario">
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Área do Funcionário</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {!isAdminArea && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Área do Admin">
                        <Link to="/admin">
                          <Settings className="h-5 w-5" />
                          <span>Área do Admin</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
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
