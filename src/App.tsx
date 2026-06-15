import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Layout from '@/components/Layout'
import Landing from '@/pages/Landing'
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
import Relatorios from '@/pages/Relatorios'
import Pacientes from '@/pages/Pacientes'
import PacienteDiario from '@/pages/PacienteDiario'
import ClinicaDashboard from '@/pages/clinica/Dashboard'
import ClinicaRelatorios from '@/pages/clinica/Relatorios'
import SupervisorDashboard from '@/pages/supervisor/Dashboard'
import SupervisorSupervisandos from '@/pages/supervisor/Supervisandos'
import SupervisorSessoes from '@/pages/supervisor/Sessoes'
import SupervisorCasos from '@/pages/supervisor/Casos'
import SupervisorRelatorios from '@/pages/supervisor/Relatorios'
import MinhaSupervisao from '@/pages/MinhaSupervisao'
import FuncionarioDashboard from '@/pages/funcionario/Dashboard'
import FuncionarioAgenda from '@/pages/funcionario/Agenda'
import FuncionarioPacientes from '@/pages/funcionario/Pacientes'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminPlanos from '@/pages/admin/Planos'
import AdminAssinaturas from '@/pages/admin/Assinaturas'
import AdminContratosSaas from '@/pages/admin/ContratosSaas'
import AdminUsuarios from '@/pages/admin/Usuarios'
import AdminTermos from '@/pages/admin/Termos'
import AdminAuditoria from '@/pages/admin/Auditoria'
import Notificacoes from '@/pages/Notificacoes'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            {/* Psychologist Routes */}
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/prontuarios" element={<Prontuarios />} />
            <Route path="/prontuarios/:id" element={<Prontuarios />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/pacientes/:id/diario" element={<PacienteDiario />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/sessoes-online" element={<SessoesOnline />} />
            <Route path="/sala-virtual/:id" element={<SalaVirtual />} />
            <Route path="/contratos-terapeuticos" element={<Contratos />} />
            <Route path="/contratos-terapeuticos/novo" element={<NovoContrato />} />
            <Route path="/contratos-terapeuticos/:id" element={<ContratoDetalhes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/notificacoes" element={<Notificacoes />} />

            <Route path="/minha-supervisao" element={<MinhaSupervisao />} />

            {/* Supervisor Routes */}
            <Route path="/supervisor" element={<SupervisorDashboard />} />
            <Route path="/supervisor/supervisandos" element={<SupervisorSupervisandos />} />
            <Route path="/supervisor/sessoes" element={<SupervisorSessoes />} />
            <Route path="/supervisor/casos" element={<SupervisorCasos />} />
            <Route path="/supervisor/relatorios" element={<SupervisorRelatorios />} />
            <Route path="/supervisor/configuracoes" element={<Configuracoes />} />

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
            <Route path="/clinica/financeiro" element={<Financeiro />} />
            <Route path="/clinica/relatorios" element={<ClinicaRelatorios />} />
            <Route path="/clinica/configuracoes" element={<ClinicaDashboard />} />

            {/* Funcionario Routes */}
            <Route path="/funcionario" element={<FuncionarioDashboard />} />
            <Route path="/funcionario/dashboard" element={<FuncionarioDashboard />} />
            <Route path="/funcionario/agenda" element={<FuncionarioAgenda />} />
            <Route path="/funcionario/pacientes" element={<FuncionarioPacientes />} />
            <Route path="/funcionario/financeiro" element={<Financeiro />} />
            <Route path="/funcionario/relatorios" element={<FuncionarioDashboard />} />
            <Route path="/funcionario/configuracoes" element={<Configuracoes />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/planos" element={<AdminPlanos />} />
            <Route path="/admin/assinaturas" element={<AdminAssinaturas />} />
            <Route path="/admin/contratos" element={<AdminContratosSaas />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/termos" element={<AdminTermos />} />
            <Route path="/admin/auditoria" element={<AdminAuditoria />} />
            <Route path="/admin/relatorios" element={<AdminDashboard />} />
            <Route path="/admin/configuracoes" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
