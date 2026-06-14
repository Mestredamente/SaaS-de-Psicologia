import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import pb from '@/lib/pocketbase/client'
import { getCurrentPatient } from '@/services/patientDashboard'

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getCurrentPatient()
      if (!p) return setLoading(false)
      setPatient(p)
      try {
        const res = await pb.collection('pagamentos').getFullList({
          filter: `paciente_id="${p.id}"`,
          sort: '-data_vencimento',
        })
        setPagamentos(res)
      } catch {
        /* intentionally ignored */
      }
      setLoading(false)
    }
    load()
  }, [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getStatusBadge = (status: string) => {
    if (status === 'pago')
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">Pago</Badge>
      )
    if (status === 'atrasado')
      return <Badge className="bg-red-500 hover:bg-red-600 text-white border-none">Atrasado</Badge>
    return (
      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">Pendente</Badge>
    )
  }

  const totalDevido = pagamentos
    .filter((p) => ['pendente', 'atrasado'].includes(p.status))
    .reduce((a, b) => a + b.valor, 0)

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-muted-foreground mt-1">Histórico financeiro e pagamentos pendentes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-sm bg-slate-900 text-white flex flex-col justify-center">
          <CardContent className="p-6">
            <p className="text-slate-400 font-medium mb-1">Total a Pagar</p>
            <h2 className="text-4xl font-bold">{formatCurrency(totalDevido)}</h2>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Histórico de Faturas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pagamentos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum pagamento registrado.
              </div>
            ) : (
              <div className="divide-y">
                {pagamentos.map((p) => (
                  <div
                    key={p.id}
                    className={`p-5 flex items-center justify-between hover:bg-muted/20 ${p.status === 'atrasado' ? 'bg-red-50/30' : ''}`}
                  >
                    <div>
                      <p className="font-semibold text-lg">{formatCurrency(p.valor)}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {format(parseISO(p.data_vencimento), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(p.status)}
                      {p.status === 'pago' && p.data_pagamento && (
                        <span className="text-xs text-muted-foreground">
                          Pago em {format(parseISO(p.data_pagamento), 'dd/MM/yy')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
