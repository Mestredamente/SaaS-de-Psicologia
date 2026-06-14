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
import Diario from '@/pages/Diario'
import Pagamentos from '@/pages/Pagamentos'
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
            <Route path="/" element={<Index />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/prontuario" element={<Prontuario />} />
            <Route path="/diario" element={<Diario />} />
            <Route path="/pagamentos" element={<Pagamentos />} />
            <Route path="/sessoes-online" element={<SessoesOnline />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
