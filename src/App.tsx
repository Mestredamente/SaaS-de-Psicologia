import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Agenda from '@/pages/Agenda'
import Configuracoes from '@/pages/Configuracoes'
import Perfil from '@/pages/Perfil'
import Prontuario from '@/pages/Prontuario'
import Prontuarios from '@/pages/Prontuarios'
import Diario from '@/pages/Diario'
import Pagamentos from '@/pages/Pagamentos'
import Financeiro from '@/pages/Financeiro'
import SessoesOnline from '@/pages/SessoesOnline'
import SalaVirtual from '@/pages/SalaVirtual'
import Contratos from '@/pages/Contratos'
import NovoContrato from '@/pages/NovoContrato'
import ContratoDetalhes from '@/pages/ContratoDetalhes'
import NotFound from '@/pages/NotFound'
import ClinicaDashboard from '@/pages/clinica/Dashboard'
import FuncionarioDashboard from '@/pages/funcionario/Dashboard'
import FuncionarioAgenda from '@/pages/funcionario/Agenda'
import FuncionarioPacientes from '@/pages/funcionario/Pacientes'

const RootRedirect = () => {
  const { user } = useAuth()
  const role = user?.role || 'psicologo'

  if (role === 'paciente') return <Navigate to="/paciente" replace />
  if (role === 'clinica') return <Navigate to="/clinica" replace />
  if (role === 'funcionario') return <Navigate to="/funcionario" replace />
  return <Navigate to="/agenda" replace />
}

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
            <Route path="/" element={<RootRedirect />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/prontuarios" element={<Prontuarios />} />
            <Route path="/prontuarios/:id" element={<Prontuarios />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/sessoes-online" element={<SessoesOnline />} />
            <Route path="/sala-virtual/:id" element={<SalaVirtual />} />
            <Route path="/contratos-terapeuticos" element={<Contratos />} />
            <Route path="/contratos-terapeuticos/novo" element={<NovoContrato />} />
            <Route path="/contratos-terapeuticos/:id" element={<ContratoDetalhes />} />

            {/* Patient Routes */}
            <Route path="/paciente" element={<Index />} />
            <Route path="/paciente/perfil" element={<Perfil />} />
            <Route path="/paciente/agenda" element={<Agenda />} />
            <Route path="/paciente/prontuario" element={<Prontuario />} />
            <Route path="/paciente/diario" element={<Diario />} />
            <Route path="/paciente/pagamentos" element={<Pagamentos />} />
            <Route path="/paciente/sessoes-online" element={<SessoesOnline />} />
            <Route path="/paciente/sala-virtual/:id" element={<SalaVirtual />} />

            {/* Clinic Routes */}
            <Route path="/clinica" element={<ClinicaDashboard />} />
            <Route path="/clinica/dashboard" element={<ClinicaDashboard />} />
            <Route path="/clinica/psicologos" element={<ClinicaDashboard />} />
            <Route path="/clinica/agenda" element={<ClinicaDashboard />} />
            <Route path="/clinica/financeiro" element={<ClinicaDashboard />} />
            <Route path="/clinica/relatorios" element={<ClinicaDashboard />} />
            <Route path="/clinica/configuracoes" element={<ClinicaDashboard />} />

            {/* Funcionario Routes */}
            <Route path="/funcionario" element={<FuncionarioDashboard />} />
            <Route path="/funcionario/dashboard" element={<FuncionarioDashboard />} />
            <Route path="/funcionario/agenda" element={<FuncionarioAgenda />} />
            <Route path="/funcionario/pacientes" element={<FuncionarioPacientes />} />
            <Route path="/funcionario/financeiro" element={<FuncionarioDashboard />} />
            <Route path="/funcionario/relatorios" element={<FuncionarioDashboard />} />
            <Route path="/funcionario/configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
