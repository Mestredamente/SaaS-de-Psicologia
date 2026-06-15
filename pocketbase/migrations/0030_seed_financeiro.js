migrate(
  (app) => {
    const financeiro = app.findCollectionByNameOrId('financeiro')

    try {
      const psi = app.findFirstRecordByFilter('perfis_psicologos', "id != ''")
      if (!psi) return

      let pac = null
      try {
        pac = app.findFirstRecordByFilter('pacientes', "id != ''")
      } catch (_) {}

      try {
        app.findFirstRecordByData('financeiro', 'descricao', 'Sessão Ana (Seed 1)')
        return
      } catch (_) {}

      const now = new Date()
      const past = new Date(now)
      past.setDate(now.getDate() - 10)
      const future = new Date(now)
      future.setDate(now.getDate() + 10)
      const thisMonth = new Date(now)

      const records = [
        {
          desc: 'Sessão Ana (Seed 1)',
          valor: 200,
          status: 'recebido',
          vencimento: past.toISOString().replace('T', ' '),
          recebimento: past.toISOString().replace('T', ' '),
        },
        {
          desc: 'Sessão João (Seed 2)',
          valor: 150,
          status: 'recebido',
          vencimento: past.toISOString().replace('T', ' '),
          recebimento: past.toISOString().replace('T', ' '),
        },
        {
          desc: 'Plano Mensal Maria (Seed 3)',
          valor: 600,
          status: 'recebido',
          vencimento: thisMonth.toISOString().replace('T', ' '),
          recebimento: thisMonth.toISOString().replace('T', ' '),
        },
        {
          desc: 'Sessão Pedro (Seed 4)',
          valor: 180,
          status: 'pendente',
          vencimento: future.toISOString().replace('T', ' '),
        },
        {
          desc: 'Sessão Lucas (Seed 5)',
          valor: 200,
          status: 'pendente',
          vencimento: future.toISOString().replace('T', ' '),
        },
        {
          desc: 'Sessão Paula (Seed 6)',
          valor: 200,
          status: 'pendente',
          vencimento: future.toISOString().replace('T', ' '),
        },
        {
          desc: 'Sessão Atrasada (Seed 7)',
          valor: 150,
          status: 'atrasado',
          vencimento: past.toISOString().replace('T', ' '),
        },
        {
          desc: 'Sessão Atrasada 2 (Seed 8)',
          valor: 200,
          status: 'atrasado',
          vencimento: past.toISOString().replace('T', ' '),
        },
      ]

      for (const r of records) {
        const rec = new Record(financeiro)
        rec.set('psicologo_id', psi.id)
        if (pac) rec.set('paciente_id', pac.id)
        rec.set('tipo', 'receita')
        rec.set('categoria', r.desc.includes('Plano') ? 'plano' : 'sessao')
        rec.set('descricao', r.desc)
        rec.set('valor', r.valor)
        rec.set('status', r.status)
        rec.set('data_vencimento', r.vencimento)
        if (r.recebimento) rec.set('data_recebimento', r.recebimento)
        app.save(rec)
      }
    } catch (e) {
      // skip if missing constraints
    }
  },
  (app) => {
    try {
      app.db().newQuery("DELETE FROM financeiro WHERE descricao LIKE '%(Seed %'").execute()
    } catch (_) {}
  },
)
