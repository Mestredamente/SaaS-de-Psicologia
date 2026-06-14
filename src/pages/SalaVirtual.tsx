import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SalaVirtual() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isPsych = user?.role === 'psicologo'

  const [sessao, setSessao] = useState<any>(null)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const record = await pb.collection('sessoes_online').getOne(id!, {
          expand: 'psicologo_id,paciente_id',
        })
        setSessao(record)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [id])

  useRealtime(
    'sessoes_online',
    (e) => {
      if (e.action === 'update' && e.record.id === id) {
        setSessao((prev: any) => ({ ...prev, ...e.record }))
      }
    },
    !!id,
  )

  useEffect(() => {
    let timer: any
    if (sessao?.status === 'em_andamento' && sessao?.hora_inicio) {
      const start = new Date(sessao.hora_inicio).getTime()
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }, 1000)
    } else if (sessao?.status === 'finalizada') {
      clearInterval(timer)
    }
    return () => clearInterval(timer)
  }, [sessao?.status, sessao?.hora_inicio])

  const handleEnd = async () => {
    if (isPsych && sessao?.status !== 'finalizada') {
      try {
        await pb.collection('sessoes_online').update(id!, {
          status: 'finalizada',
          hora_fim: new Date().toISOString(),
        })
      } catch {
        /* intentionally ignored */
      }
    }
    navigate(-1)
  }

  if (!sessao)
    return (
      <div className="flex h-[80vh] items-center justify-center text-muted-foreground animate-pulse">
        Carregando sala virtual...
      </div>
    )

  const otherName = isPsych
    ? sessao.expand?.paciente_id?.nome_completo
    : sessao.expand?.psicologo_id?.nome_completo
  const myName = 'Você'

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  let statusMsg = 'Conectando'
  if (sessao.status === 'em_andamento') statusMsg = 'Em sessão'
  if (sessao.status === 'finalizada') statusMsg = 'Sessão finalizada'

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[600px] bg-slate-950 text-slate-50 rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800 animate-fade-in-up">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 md:px-6 bg-gradient-to-b from-slate-950/90 to-transparent z-10 flex items-center justify-between pointer-events-none">
        <div>
          <h2 className="font-semibold text-lg drop-shadow-md">{otherName}</h2>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                sessao.status === 'em_andamento' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500',
              )}
            ></span>
            <span
              className={sessao.status === 'em_andamento' ? 'text-emerald-400' : 'text-amber-400'}
            >
              {statusMsg}
            </span>
            {sessao.status === 'em_andamento' && (
              <span className="text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded ml-2 font-mono tracking-wider">
                {formatTime(elapsed)}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:text-white hover:bg-white/10 pointer-events-auto"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Video Grids */}
      <div className="flex-1 p-4 pb-28 pt-20 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Other Person */}
        <div className="relative bg-slate-900/50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group border border-slate-800/50">
          <img
            src={`https://img.usecurling.com/ppl/large?seed=${sessao.id}&gender=${isPsych ? 'female' : 'male'}`}
            alt="Video da outra pessoa"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          />
          <div className="absolute bottom-4 left-4 bg-slate-950/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            {otherName}
          </div>
        </div>

        {/* You */}
        <div className="relative bg-slate-900/50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group border border-slate-800/50">
          {cameraOff ? (
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <VideoOff className="w-16 h-16 opacity-50" />
              <span className="font-medium">Câmera desativada</span>
            </div>
          ) : (
            <img
              src={`https://img.usecurling.com/ppl/large?seed=${user?.id}&gender=${isPsych ? 'female' : 'male'}`}
              alt="Sua Câmera"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 scale-x-[-1]"
            />
          )}
          <div className="absolute bottom-4 left-4 bg-slate-950/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
            {myName}
            {muted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
          </div>
        </div>
      </div>

      {/* Bottom Bar Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-wrap items-center justify-center gap-4 sm:gap-6 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMuted(!muted)}
          className={cn(
            'rounded-full h-14 w-14 border-0 shadow-lg transition-colors',
            muted
              ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 hover:text-rose-400'
              : 'bg-slate-800/80 text-white hover:bg-slate-700',
          )}
        >
          {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCameraOff(!cameraOff)}
          className={cn(
            'rounded-full h-14 w-14 border-0 shadow-lg transition-colors',
            cameraOff
              ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 hover:text-rose-400'
              : 'bg-slate-800/80 text-white hover:bg-slate-700',
          )}
        >
          {cameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-14 w-14 border-0 shadow-lg bg-slate-800/80 text-white hover:bg-slate-700 hidden sm:flex"
        >
          <MonitorUp className="w-6 h-6" />
        </Button>

        <div className="w-px h-10 bg-slate-800 mx-2 hidden sm:block"></div>

        <Button
          variant="destructive"
          onClick={handleEnd}
          className="rounded-full px-8 h-14 font-bold text-base shadow-lg hover:shadow-rose-500/25 transition-all"
        >
          <PhoneOff className="mr-2 w-5 h-5" />
          Encerrar sessão
        </Button>
      </div>
    </div>
  )
}
