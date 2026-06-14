import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Search, LogOut, LayoutDashboard, Calendar, User } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Layout() {
  const { user, isAuthenticated, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const role = user?.role || 'psicologo'
  const isRoot = location.pathname === '/'
  const isPatientArea = location.pathname.startsWith('/paciente')
  const isClinicArea = location.pathname.startsWith('/clinica')
  const isFuncionarioArea = location.pathname.startsWith('/funcionario')
  const isPsychologistArea = !isPatientArea && !isClinicArea && !isFuncionarioArea && !isRoot

  if (!isRoot) {
    if (role === 'paciente' && !isPatientArea) {
      return <Navigate to="/paciente" replace />
    }
    if (role === 'clinica' && !isClinicArea) {
      return <Navigate to="/clinica" replace />
    }
    if (role === 'funcionario' && !isFuncionarioArea) {
      return <Navigate to="/funcionario" replace />
    }
    if (role === 'psicologo' && !isPsychologistArea) {
      return <Navigate to="/agenda" replace />
    }
  }

  const roleDisplay =
    role === 'psicologo'
      ? 'Psicólogo'
      : role === 'clinica'
        ? 'Clínica'
        : role === 'funcionario'
          ? 'Funcionário'
          : 'Paciente'

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        <SidebarProvider className="min-h-0 h-full">
          <AppSidebar
            isPatientArea={isPatientArea}
            isClinicArea={isClinicArea}
            isFuncionarioArea={isFuncionarioArea}
          />
          <SidebarInset className="overflow-hidden flex flex-col">
            {isFuncionarioArea && (
              <div className="flex shrink-0 bg-indigo-50 border-b px-4 py-1.5 text-xs text-indigo-700 items-center gap-2 z-30">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <span className="truncate">
                  Você está acessando como: <strong className="capitalize">{roleDisplay}</strong>
                </span>
              </div>
            )}
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-2" />
                <div className="flex items-center gap-2 md:hidden">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-md text-white flex items-center justify-center font-bold text-sm',
                      isClinicArea || isFuncionarioArea
                        ? 'bg-indigo-600'
                        : isPatientArea
                          ? 'bg-sky-600'
                          : 'bg-slate-700',
                    )}
                  >
                    {isClinicArea ? 'C' : isFuncionarioArea ? 'F' : isPatientArea ? 'P' : 'Psi'}
                  </div>
                  <span className="font-semibold text-sm truncate max-w-[120px]">
                    {isClinicArea
                      ? 'Clínica'
                      : isFuncionarioArea
                        ? 'Funcionário'
                        : isPatientArea
                          ? 'Paciente'
                          : 'Psicólogo'}
                  </span>
                </div>
              </div>

              <div className="flex-1 max-w-md hidden lg:block px-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pacientes..."
                    className="w-full bg-muted/50 pl-9 rounded-full border-none focus-visible:ring-1 h-9"
                  />
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2 md:gap-4 shrink-0">
                {!isFuncionarioArea && (
                  <div className="hidden md:flex text-sm text-muted-foreground items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="whitespace-nowrap">
                      Você está acessando como:{' '}
                      <strong className="text-foreground capitalize">{roleDisplay}</strong>
                    </span>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:flex rounded-full gap-2 h-9"
                    >
                      Trocar Área
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Alternar Área</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/agenda" className="w-full cursor-pointer flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Área do Psicólogo
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/clinica" className="w-full cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Área da Clínica
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/paciente"
                        className="w-full cursor-pointer flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Área do Paciente
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/funcionario"
                        className="w-full cursor-pointer flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Área do Funcionário
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-auto flex items-center gap-2 rounded-full pl-1 pr-3 hover:bg-muted"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.avatar ? pb.files.getUrl(user, user.avatar) : ''} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {(user?.nome_completo || user?.name || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:block truncate max-w-[100px]">
                        {user?.nome_completo || user?.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <div className="flex md:hidden shrink-0 border-b bg-muted/10 px-4 py-2 text-xs text-muted-foreground items-center gap-2 sticky top-16 z-10 backdrop-blur">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="truncate">
                Você está acessando como:{' '}
                <strong className="text-foreground capitalize">{roleDisplay}</strong>
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 pb-12 overflow-y-auto">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}
