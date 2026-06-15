migrate(
  (app) => {
    try {
      const notificacoes = app.findCollectionByNameOrId('notificacoes')

      // Find Dra. Ana, Maria Silva, Mente Sã
      let draAna, maria, menteSa
      try {
        draAna = app.findFirstRecordByData('_pb_users_auth_', 'email', 'ana.psico@example.com')
      } catch (_) {}
      try {
        maria = app.findFirstRecordByData('_pb_users_auth_', 'email', 'maria.paciente@example.com')
      } catch (_) {}
      try {
        menteSa = app.findFirstRecordByData('_pb_users_auth_', 'email', 'contato@mentesa.com.br')
      } catch (_) {}

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z'

      if (draAna) {
        const n1 = new Record(notificacoes)
        n1.set('usuario_id', draAna.id)
        n1.set('tipo', 'sistema')
        n1.set('titulo', 'Bem-vinda ao seu novo consultório')
        n1.set(
          'mensagem',
          'Explore todas as funcionalidades para gerenciar seus pacientes de forma eficiente.',
        )
        n1.set('status', 'nao_lida')
        n1.set('data_envio', now)
        app.save(n1)

        const n2 = new Record(notificacoes)
        n2.set('usuario_id', draAna.id)
        n2.set('tipo', 'sucesso')
        n2.set('titulo', 'Sessão Confirmada')
        n2.set('mensagem', 'Maria Silva confirmou a sessão de amanhã.')
        n2.set('status', 'nao_lida')
        n2.set('link_acao', '/agenda')
        n2.set('data_envio', now)
        app.save(n2)

        const n3 = new Record(notificacoes)
        n3.set('usuario_id', draAna.id)
        n3.set('tipo', 'alerta')
        n3.set('titulo', 'Assinatura pendente')
        n3.set('mensagem', 'Sua assinatura de plano vence em 3 dias. Evite a suspensão do serviço.')
        n3.set('status', 'nao_lida')
        n3.set('link_acao', '/configuracoes')
        n3.set('data_envio', now)
        app.save(n3)
      }

      if (maria) {
        const n1 = new Record(notificacoes)
        n1.set('usuario_id', maria.id)
        n1.set('tipo', 'urgente')
        n1.set('titulo', 'Termo de Consentimento')
        n1.set(
          'mensagem',
          'Você tem um novo termo pendente para assinatura antes da próxima sessão.',
        )
        n1.set('status', 'nao_lida')
        n1.set('data_envio', now)
        app.save(n1)

        const n2 = new Record(notificacoes)
        n2.set('usuario_id', maria.id)
        n2.set('tipo', 'sistema')
        n2.set('titulo', 'Lembrete de Sessão')
        n2.set('mensagem', 'Você tem uma sessão amanhã às 14h com Dra. Ana.')
        n2.set('status', 'nao_lida')
        n2.set('link_acao', '/paciente/agenda')
        n2.set('data_envio', now)
        app.save(n2)
      }

      if (menteSa) {
        const n1 = new Record(notificacoes)
        n1.set('usuario_id', menteSa.id)
        n1.set('tipo', 'sistema')
        n1.set('titulo', 'Relatório Mensal Disponível')
        n1.set('mensagem', 'O relatório consolidado de atendimentos do mês passado foi gerado.')
        n1.set('status', 'nao_lida')
        n1.set('link_acao', '/clinica/relatorios')
        n1.set('data_envio', now)
        app.save(n1)
      }
    } catch (err) {}
  },
  (app) => {
    app.db().newQuery('DELETE FROM notificacoes').execute()
  },
)
