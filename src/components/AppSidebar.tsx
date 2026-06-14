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
  Users,
  FileText,
  Files,
  DollarSign,
  Video,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Agenda', path: '/agenda', icon: CalendarDays },
  { title: 'Pacientes', path: '/pacientes', icon: Users },
  { title: 'Prontuários', path: '/prontuarios', icon: FileText },
  { title: 'Documentos', path: '/documentos', icon: Files },
  { title: 'Financeiro', path: '/financeiro', icon: DollarSign },
  { title: 'Sessões Online', path: '/sessoes-online', icon: Video },
  { title: 'Configurações', path: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { state } = useSidebar()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        {state === 'expanded' ? (
          <div className="font-semibold text-lg text-primary flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
              P
            </div>
            <span>PsicoGestão</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center mx-auto">
            P
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                }
                tooltip={item.title}
              >
                <Link to={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
