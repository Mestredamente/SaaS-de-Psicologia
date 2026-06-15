import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { SimulationBanner } from '@/components/SimulationBanner'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  const isPatientArea = location.pathname.startsWith('/paciente')
  const isClinicArea = location.pathname.startsWith('/clinica')
  const isFuncionarioArea = location.pathname.startsWith('/funcionario')
  const isAdminArea = location.pathname.startsWith('/admin')
  const isSupervisorArea = location.pathname.startsWith('/supervisor')

  return (
    <SidebarProvider>
      <AppSidebar
        isAdminArea={isAdminArea}
        isClinicArea={isClinicArea}
        isFuncionarioArea={isFuncionarioArea}
        isPatientArea={isPatientArea}
        isSupervisorArea={isSupervisorArea}
      />
      <SidebarInset>
        <SimulationBanner />
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] sticky top-0 z-10 shrink-0">
          <SidebarTrigger />
          <div className="font-semibold text-sm text-muted-foreground ml-auto hidden sm:block">
            MenteClin Dashboard
            {user && ` — ${user.nome_completo || user.name || user.email}`}
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50/50 p-4 md:p-6 w-full h-full relative">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
