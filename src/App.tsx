import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'

import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Agenda from '@/pages/Agenda'
import Pacientes from '@/pages/Pacientes'
import Prontuarios from '@/pages/Prontuarios'
import Documentos from '@/pages/Documentos'
import Financeiro from '@/pages/Financeiro'
import SessoesOnline from '@/pages/SessoesOnline'
import Configuracoes from '@/pages/Configuracoes'
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
            <Route path="/" element={<Index />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/prontuarios" element={<Prontuarios />} />
            <Route path="/prontuarios/:id" element={<Prontuarios />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/sessoes-online" element={<SessoesOnline />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
