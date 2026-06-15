import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ResumoCards } from './financeiro/ResumoCards'
import { LancamentosList } from './financeiro/LancamentosList'
import { RelatoriosFinanceiros } from './financeiro/RelatoriosFinanceiros'
import { FinanceiroFormModal } from './financeiro/FinanceiroFormModal'
import { useFinanceiro } from '@/hooks/use-financeiro'
import { useAuth } from '@/hooks/use-auth'

export default function Financeiro() {
  const { data, loading } = useFinanceiro()
  const { user } = useAuth()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Financeiro — {user?.name || 'Profissional'}
          </h1>
          <p className="text-muted-foreground mt-1">Visão completa das suas finanças</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList className="bg-slate-100/80">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-8 animate-fade-in-up">
          <ResumoCards data={data} loading={loading} />
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Próximos Vencimentos</h2>
            <LancamentosList data={data} loading={loading} limit={5} hideFilters />
          </div>
        </TabsContent>

        <TabsContent value="lancamentos" className="animate-fade-in-up">
          <LancamentosList data={data} loading={loading} />
        </TabsContent>

        <TabsContent value="relatorios" className="animate-fade-in-up">
          <RelatoriosFinanceiros data={data} />
        </TabsContent>
      </Tabs>

      <FinanceiroFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
