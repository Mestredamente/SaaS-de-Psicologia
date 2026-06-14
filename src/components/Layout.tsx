import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Search, LogOut } from 'lucide-react'
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

  const isPatientArea = location.pathname.startsWith('/paciente')

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <div className="h-14 border-b bg-muted/20 px-6 flex items-center justify-center sm:justify-between shrink-0 z-50">
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
          <Link
            to="/"
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              !isPatientArea
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
          >
            Área do Psicólogo
          </Link>
          <Link
            to="/paciente"
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              isPatientArea
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
          >
            Área do Paciente
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <SidebarProvider className="min-h-0 h-full">
          <AppSidebar isPatientArea={isPatientArea} />
          <SidebarInset className="overflow-hidden flex flex-col">
            <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 sticky top-0 z-10">
              <SidebarTrigger className="-ml-2" />
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pacientes..."
                    className="w-full bg-muted/50 pl-9 rounded-full border-none focus-visible:ring-1"
                  />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-auto flex items-center gap-3 rounded-full pl-2 pr-4 hover:bg-muted"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar ? pb.files.getUrl(user, user.avatar) : ''} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden md:block">{user?.name}</span>
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
            <div className="flex flex-1 flex-col gap-6 p-6 pb-12 overflow-y-auto">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}
