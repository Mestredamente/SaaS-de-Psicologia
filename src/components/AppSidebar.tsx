import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  FolderOpen,
  CircleDollarSign,
  Video,
  Settings,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Agenda', url: '/agenda', icon: Calendar },
  { title: 'Pacientes', url: '/pacientes', icon: Users },
  { title: 'Prontuários', url: '/prontuarios', icon: FileText },
  { title: 'Documentos', url: '/documentos', icon: FolderOpen },
  { title: 'Financeiro', url: '/financeiro', icon: CircleDollarSign },
  { title: 'Sessões Online', url: '/sessoes-online', icon: Video },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2 font-semibold text-lg text-primary">
          <Brain className="h-6 w-6" />
          <span>PsicoGestão</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-4 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-10 px-4 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium border-l-4 border-primary'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border-l-4 border-transparent',
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
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
      </SidebarContent>
    </Sidebar>
  )
}
