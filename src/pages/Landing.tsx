import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/Reveal'
import {
  Calendar,
  FileText,
  Video,
  DollarSign,
  ShieldCheck,
  BarChart,
  Check,
  Shield,
  Lock,
  Star,
  Menu,
  X,
  ArrowRight,
  Activity,
} from 'lucide-react'

export default function Landing() {
  const { isAuthenticated, user, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
      </div>
    )
  }

  if (isAuthenticated) {
    const role = user?.role || 'psicologo'
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'paciente') return <Navigate to="/paciente" replace />
    if (role === 'clinica') return <Navigate to="/clinica" replace />
    if (role === 'funcionario') return <Navigate to="/funcionario" replace />
    return <Navigate to="/agenda" replace />
  }

  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Inteligente',
      desc: 'Gestão de horários simplificada com lembretes automáticos e sincronização.',
    },
    {
      icon: FileText,
      title: 'Prontuários Eletrônicos',
      desc: 'Registros seguros, modelos personalizáveis e histórico clínico completo.',
    },
    {
      icon: Video,
      title: 'Teleatendimento Seguro',
      desc: 'Sala virtual integrada com criptografia de ponta a ponta.',
    },
    {
      icon: DollarSign,
      title: 'Financeiro Completo',
      desc: 'Controle de recebimentos, fluxo de caixa, recibos e relatórios.',
    },
    {
      icon: ShieldCheck,
      title: 'Compliance LGPD/CFP',
      desc: 'Adequação total às normas do Conselho Federal de Psicologia.',
    },
    {
      icon: BarChart,
      title: 'Relatórios e Analytics',
      desc: 'Métricas claras para o crescimento do seu consultório ou clínica.',
    },
  ]

  const plans = [
    {
      name: 'Básico',
      price: '49',
      desc: 'Para psicólogos autônomos em início de carreira.',
      popular: false,
      features: [
        'Até 20 pacientes ativos',
        'Agenda inteligente',
        'Prontuários básicos',
        'Suporte por email',
        'Emissão de recibos',
      ],
    },
    {
      name: 'Profissional',
      price: '99',
      desc: 'Para consultórios consolidados em crescimento.',
      popular: true,
      features: [
        'Pacientes ilimitados',
        'Teleatendimento integrado',
        'Prontuários avançados',
        'Lembretes por WhatsApp',
        'Financeiro completo',
      ],
    },
    {
      name: 'Clínica',
      price: '199',
      desc: 'Para equipes multidisciplinares e clínicas.',
      popular: false,
      features: [
        'Até 5 profissionais inclusos',
        'Painel administrativo',
        'Gestão de permissões',
        'Relatórios consolidados',
        'Suporte prioritário',
      ],
    },
  ]

  const scrollTo = (id: string) => {
    setIsMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-2xl tracking-tight">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span>MenteClin</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollTo('funcionalidades')}
              className="hover:text-blue-600 transition-colors"
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollTo('para-quem')}
              className="hover:text-blue-600 transition-colors"
            >
              Para Quem
            </button>
            <button
              onClick={() => scrollTo('planos')}
              className="hover:text-blue-600 transition-colors"
            >
              Planos
            </button>
            <button
              onClick={() => scrollTo('compliance')}
              className="hover:text-blue-600 transition-colors"
            >
              Compliance
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all"
            >
              <Link to="/login">Começar Agora</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-4 text-center font-medium text-slate-700">
              <button
                onClick={() => scrollTo('funcionalidades')}
                className="py-2 active:bg-slate-100 rounded"
              >
                Funcionalidades
              </button>
              <button
                onClick={() => scrollTo('para-quem')}
                className="py-2 active:bg-slate-100 rounded"
              >
                Para Quem
              </button>
              <button
                onClick={() => scrollTo('planos')}
                className="py-2 active:bg-slate-100 rounded"
              >
                Planos
              </button>
              <button
                onClick={() => scrollTo('compliance')}
                className="py-2 active:bg-slate-100 rounded"
              >
                Compliance
              </button>
              <div className="h-px bg-slate-100 my-2"></div>
              <Link to="/login" className="py-2 font-bold text-blue-600">
                Login
              </Link>
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              >
                <Link to="/login">Começar Agora</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-16">
        <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/30 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1200/800?q=abstract%20waves&color=blue&dpr=1')] opacity-[0.03] mix-blend-multiply pointer-events-none"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium mb-8 shadow-sm border border-blue-200/50">
                <Star className="w-4 h-4 fill-current" /> Plataforma #1 para Profissionais da Saúde
                Mental
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
                A gestão clínica que seu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                  consultório precisa
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Agenda, prontuários, financeiro, teleatendimento e compliance — tudo em um só lugar.
                Conforme CFP e LGPD.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg h-14 px-8 rounded-full shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
                >
                  <Link to="/login">
                    Experimente Grátis <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-blue-700 border-blue-200 hover:bg-blue-50 text-base md:text-lg h-14 px-8 rounded-full bg-white/50 backdrop-blur-sm transition-all hover:scale-105"
                >
                  <button onClick={() => scrollTo('planos')}>Conheça os Planos</button>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="funcionalidades" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Tudo para sua prática clínica
                </h2>
                <p className="text-lg text-slate-600">
                  Ferramentas desenvolvidas para terapeutas, focando no que importa: seus pacientes.
                </p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <Reveal
                  key={i}
                  delay={i * 100}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="para-quem" className="py-20 md:py-32 bg-slate-900 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Feito para você crescer</h2>
                <p className="text-lg text-slate-300">
                  Soluções adaptadas ao seu momento profissional.
                </p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              <Reveal
                delay={100}
                className="bg-slate-800 rounded-3xl p-8 md:p-10 border border-slate-700"
              >
                <h3 className="text-2xl font-bold mb-4 text-blue-400">Para Psicólogos Autônomos</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Automatize sua rotina, reduza faltas com lembretes automáticos e tenha a segurança
                  de prontuários em conformidade.
                </p>
                <ul className="space-y-4">
                  {[
                    'Agenda e Prontuários integrados',
                    'Link de agendamento',
                    'Controle financeiro',
                    'Teleatendimento seguro',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal
                delay={200}
                className="bg-slate-800 rounded-3xl p-8 md:p-10 border border-slate-700"
              >
                <h3 className="text-2xl font-bold mb-4 text-emerald-400">Para Clínicas</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Gestão completa para equipes multidisciplinares. Controle de repasses, permissões
                  de acesso e visão consolidada.
                </p>
                <ul className="space-y-4">
                  {[
                    'Gestão de múltiplos profissionais',
                    'Dashboard gerencial',
                    'Repasses e comissões',
                    'Acesso para secretárias',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="planos" className="py-20 md:py-32 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Planos Simples e Transparentes
                </h2>
                <p className="text-lg text-slate-600">
                  Escolha o plano ideal para a sua jornada profissional.
                </p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              {plans.map((plan, i) => (
                <Reveal
                  key={i}
                  delay={i * 100}
                  className={cn(
                    'rounded-3xl p-8 border transition-all bg-white relative',
                    plan.popular
                      ? 'border-blue-500 shadow-xl md:-translate-y-4'
                      : 'border-slate-200 shadow-sm hover:shadow-md',
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full">
                      Mais Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 h-10">{plan.desc}</p>
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-slate-900">R$ {plan.price}</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={cn(
                      'w-full rounded-full h-12 font-medium text-base',
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200',
                    )}
                  >
                    <Link to="/login">Assinar {plan.name}</Link>
                  </Button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Quem usa, recomenda
                </h2>
                <p className="text-lg text-slate-600">
                  Milhares de profissionais já transformaram suas clínicas com o MenteClin.
                </p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Dra. Ana Silva',
                  role: 'Psicóloga Clínica',
                  text: '"O MenteClin transformou minha rotina. Gasto menos tempo com burocracia e mais com pacientes."',
                  img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
                },
                {
                  name: 'Dr. Carlos Mendes',
                  role: 'Psicanalista',
                  text: '"A tranquilidade de saber que meus prontuários estão seguros e em conformidade com o CFP não tem preço."',
                  img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
                },
                {
                  name: 'Clínica Bem Estar',
                  role: 'Clínica Integrada',
                  text: '"Centralizamos a gestão em uma única plataforma. O painel financeiro é excelente e prático."',
                  img: 'https://img.usecurling.com/i?q=clinic&shape=fill&color=azure',
                },
              ].map((test, i) => (
                <Reveal
                  key={i}
                  delay={i * 100}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col h-full"
                >
                  <div className="flex gap-1 text-amber-400 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-8 flex-grow text-lg">{test.text}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <img
                      src={test.img}
                      alt={test.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{test.name}</h4>
                      <p className="text-sm text-slate-500">{test.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="compliance" className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Seu trabalho protegido</h2>
              <p className="text-blue-100 text-lg mb-10">
                Seu trabalho e seus pacientes protegidos por padrões clínicos e legais.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <div className="flex items-center gap-3 bg-blue-800/40 py-3 px-6 rounded-full border border-blue-500/30">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  <span className="font-semibold tracking-wide">Adequado ao CFP</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-800/40 py-3 px-6 rounded-full border border-blue-500/30">
                  <Lock className="w-6 h-6 text-emerald-400" />
                  <span className="font-semibold tracking-wide">100% LGPD</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 text-white font-bold text-2xl mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-500" /> MenteClin
              </div>
              <p className="text-sm leading-relaxed">
                Tecnologia e cuidado para profissionais da saúde mental.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="text-white font-semibold mb-4">Produto</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <button
                      onClick={() => scrollTo('funcionalidades')}
                      className="hover:text-blue-400"
                    >
                      Funcionalidades
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollTo('planos')} className="hover:text-blue-400">
                      Preços
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="#" className="hover:text-blue-400">
                      Termos de Uso
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400">
                      Política de Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-400">
                      Contato
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>Copyright 2024 MenteClin. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:text-white"
              >
                in
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:text-white"
              >
                ig
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
