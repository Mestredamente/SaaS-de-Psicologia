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

const getIconForMenu = (title: string) => {
  if (title === 'Financeiro') return Wallet
  if (title === 'Pagamentos' || title === 'Assinaturas') return DollarSign
  if (title === 'Meus Supervisandos' || title === 'Funcionários') return Users
  if (title === 'Relatórios') return BarChart2
  if (title === 'Meu Diário') return BookHeart
  if (title === 'Termos LGPD' || title === 'Minha Supervisão') return ShieldAlert
  if (title === 'Auditoria' || title === 'Casos') return BookOpen
  if (
    title === 'Sessões' ||
    title === 'Agenda da Clínica' ||
    title === 'Minha Agenda' ||
    title === 'Agenda'
  )
    return CalendarDays
  if (title.includes('Sessões Online')) return Video
  if (title === 'Configurações') return Settings
  if (
    title === 'Pacientes' ||
    title === 'Psicólogos' ||
    title === 'Usuários' ||
    title === 'Meu Perfil' ||
    title === 'Pacientes Atribuídos'
  )
    return UserCircle
  if (
    title === 'Prontuários' ||
    title === 'Meu Prontuário' ||
    title === 'Contratos' ||
    title === 'Contratos SaaS' ||
    title === 'Planos'
  )
    return FileText
  if (title.includes('Dashboard')) return LayoutDashboard
  return LayoutDashboard
}

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
  const { user, signOut, perfil, permissoesMenu } = useAuth()
  const { state } = useSidebar()
  const { hasAtrasado } = useFinanceiroAtrasado()

  const isLinked = !!perfil?.clinica_id

  let navItems = (permissoesMenu || [])
    .filter((m) => {
      if (m.rota.startsWith('/supervisor')) {
        if (!isSupervisor) return false
        if (!isSupervisorArea) return false
      } else {
        if (isSupervisorArea && user?.role === 'psicologo') return false
      }

      if (m.rota === '/minha-supervisao') {
        if (!isSupervisando) return false
      }

      if (user?.role === 'funcionario') {
        if (m.requer_cargo && m.requer_cargo !== funcionario?.cargo) return false
      }

      if (user?.role === 'psicologo') {
        if (isLinked) {
          if (m.rota === '/dashboard/psicologo/autonomo') return false
          const allowed = [
            '/dashboard/psicologo/vinculado',
            '/agenda',
            '/pacientes',
            '/prontuarios',
            '/sessoes-online',
            '/configuracoes',
            '/minha-supervisao',
          ]
          if (!allowed.includes(m.rota) && !m.rota.startsWith('/supervisor')) return false
        } else {
          if (m.rota === '/dashboard/psicologo/vinculado') return false
        }
      }

      return true
    })
    .map((m) => {
      let title = m.item_menu
      if (user?.role === 'psicologo' && isLinked) {
        if (m.rota === '/agenda') title = 'Agenda da Clínica'
        if (m.rota === '/pacientes') title = 'Pacientes Atribuídos'
      }
      return {
        title,
        path: m.rota,
        icon: getIconForMenu(title),
      }
    })

  if (navItems.length === 0 && user?.role) {
    navItems = [{ title: 'Carregando...', path: '#', icon: LayoutDashboard }]
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

        {user?.role === 'psicologo' && isSupervisor && (
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
                    {!isSupervisorArea ? (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Área do Supervisor">
                          <Link to="/supervisor">
                            <ShieldAlert className="h-5 w-5" />
                            <span>Área do Supervisor</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ) : (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Área do Psicólogo">
                          <Link to="/agenda">
                            <Calendar className="h-5 w-5" />
                            <span>Área do Psicólogo</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
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
