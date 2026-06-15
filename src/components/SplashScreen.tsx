import { Loader2 } from 'lucide-react'

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-600/20">
          M
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">MenteClin</h1>
      </div>
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-6" />
      <p className="text-slate-500 font-medium text-lg animate-pulse tracking-wide">
        Organizando sua clínica...
      </p>
    </div>
  )
}
