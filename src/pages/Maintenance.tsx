import { Wrench } from 'lucide-react'

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
      <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Wrench className="w-12 h-12 text-indigo-600" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Estamos em manutenção
      </h1>
      <p className="text-slate-600 text-xl max-w-lg mb-8 leading-relaxed">
        Voltamos em breve para cuidar melhor de você. Agradecemos a compreensão.
      </p>
      <div className="bg-white px-8 py-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <p className="text-sm text-slate-500 mb-2 uppercase tracking-wider font-semibold">
          Precisa de ajuda urgente?
        </p>
        <a
          href="mailto:suporte@menteclin.com"
          className="text-indigo-600 hover:text-indigo-700 font-bold text-lg hover:underline transition-colors"
        >
          suporte@menteclin.com
        </a>
      </div>
    </div>
  )
}
