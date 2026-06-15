import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { ComplianceAlert } from './ComplianceAlert'
import { PatientConsentModal } from './PatientConsentModal'
import { NotificationHeader } from './NotificationHeader'
import { OnboardingModal } from './OnboardingModal'

export default function Layout() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const isPatientArea = location.pathname.startsWith('/paciente')
  const isClinicArea = location.pathname.startsWith('/clinica')
  const isFuncionarioArea = location.pathname.startsWith('/funcionario')
  const isAdminArea = location.pathname.startsWith('/admin')
  const isSupervisorArea = location.pathname.startsWith('/supervisor')

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar
          isPatientArea={isPatientArea}
          isClinicArea={isClinicArea}
          isFuncionarioArea={isFuncionarioArea}
          isAdminArea={isAdminArea}
          isSupervisorArea={isSupervisorArea}
        />
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <header className="h-16 flex items-center justify-between px-4 border-b bg-white shrink-0">
            <SidebarTrigger />
            <NotificationHeader />
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <OnboardingModal />
            <ComplianceAlert />
            <PatientConsentModal />
            <Outlet />
          </div>
          <footer className="py-3 px-4 text-center text-xs text-slate-500 border-t bg-white shrink-0">
            Seus dados são protegidos conforme a LGPD. Resolução CFP aplicável.
          </footer>
        </main>
      </div>
    </SidebarProvider>
  )
}
