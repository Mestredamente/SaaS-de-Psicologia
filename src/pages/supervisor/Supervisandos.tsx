import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSupervisorProfile, getSupervisandos } from '@/services/supervisao'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'

export default function SupervisorSupervisandos() {
  const { user } = useAuth()
  const [supervisandos, setSupervisandos] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      if (!user) return
      const profile = await getSupervisorProfile(user.id)
      if (profile) {
        setSupervisandos(await getSupervisandos(profile.id))
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Meus Supervisandos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Supervisandos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisandos.map((sup: any) => (
                <TableRow key={sup.id}>
                  <TableCell className="font-medium">
                    {sup.expand?.psicologo_id?.nome_completo}
                  </TableCell>
                  <TableCell>{format(new Date(sup.data_inicio), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="capitalize">{sup.status.replace('_', ' ')}</TableCell>
                </TableRow>
              ))}
              {supervisandos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500 py-6">
                    Nenhum supervisando encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
