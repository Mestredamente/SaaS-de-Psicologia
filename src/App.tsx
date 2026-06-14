import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'

import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Agenda from '@/pages/Agenda'
import Perfil from '@/pages/Perfil'
import Prontuario from '@/pages/Prontuario'
import Prontuarios from '@/pages/Prontuarios'
import Diario from '@/pages/Diario'
import Pagamentos from '@/pages/Pagamentos'
import Financeiro from '@/pages/Financeiro'
import SessoesOnline from '@/pages/SessoesOnline'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            {/* Psychologist Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/prontuarios" element={<Prontuarios />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/sessoes-online" element={<SessoesOnline />} />

            {/* Patient Routes */}
            <Route path="/paciente" element={<Index />} />
            <Route path="/paciente/perfil" element={<Perfil />} />
            <Route path="/paciente/agenda" element={<Agenda />} />
            <Route path="/paciente/prontuario" element={<Prontuario />} />
            <Route path="/paciente/diario" element={<Diario />} />
            <Route path="/paciente/pagamentos" element={<Pagamentos />} />
            <Route path="/paciente/sessoes-online" element={<SessoesOnline />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
