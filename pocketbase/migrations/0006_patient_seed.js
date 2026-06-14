migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let userMaria
    try {
      userMaria = app.findAuthRecordByEmail('_pb_users_auth_', 'maria@teste.com')
    } catch (_) {
      userMaria = new Record(users)
      userMaria.setEmail('maria@teste.com')
      userMaria.setPassword('Skip@Pass')
      userMaria.setVerified(true)
      userMaria.set('name', 'Maria Silva')
      app.save(userMaria)
    }

    const psicologo = app.findFirstRecordByData(
      'perfis_psicologos',
      'email',
      'mestredamente1@gmail.com',
    )

    const pacientes = app.findCollectionByNameOrId('pacientes')
    let pacienteMaria
    try {
      pacienteMaria = app.findFirstRecordByData('pacientes', 'email', 'maria@teste.com')
    } catch (_) {
      pacienteMaria = new Record(pacientes)
      pacienteMaria.set('nome_completo', 'Maria Silva')
      pacienteMaria.set('email', 'maria@teste.com')
    }
    pacienteMaria.set('telefone', '11999999999')
    pacienteMaria.set('psicologo_id', psicologo.id)
    pacienteMaria.set('status', 'ativo')
    pacienteMaria.set('user_id', userMaria.id)
    pacienteMaria.set('cpf', '111.222.333-44')
    pacienteMaria.set('is_menor', false)
    app.save(pacienteMaria)

    const agendamentos = app.findCollectionByNameOrId('agendamentos')
    if (app.countRecords('agendamentos') === 0) {
      const dates = [
        new Date(Date.now() - 7 * 86400000),
        new Date(Date.now() - 1 * 86400000),
        new Date(Date.now() + 1 * 86400000),
        new Date(Date.now() + 8 * 86400000),
        new Date(Date.now() + 15 * 86400000),
      ]
      const statuses = ['realizado', 'cancelado', 'agendado', 'agendado', 'agendado']
      for (let i = 0; i < 5; i++) {
        const a = new Record(agendamentos)
        a.set('paciente_id', pacienteMaria.id)
        a.set('psicologo_id', psicologo.id)
        a.set('data_hora', dates[i].toISOString().replace('T', ' ').substring(0, 19) + 'Z')
        a.set('tipo', i % 2 === 0 ? 'presencial' : 'online')
        a.set('status', statuses[i])
        a.set('valor', 150)
        app.save(a)
      }
    }

    const diarios = app.findCollectionByNameOrId('diario_sentimental')
    if (app.countRecords('diario_sentimental') === 0) {
      const moods = ['bom', 'neutro', 'ótimo']
      for (let i = 0; i < 3; i++) {
        const d = new Record(diarios)
        d.set('paciente_id', pacienteMaria.id)
        const dt = new Date(Date.now() - i * 86400000)
        d.set('data', dt.toISOString().replace('T', ' ').substring(0, 19) + 'Z')
        d.set('humor', moods[i])
        d.set('intensidade', 4)
        d.set('anotacoes', 'Hoje foi um dia tranquilo.')
        app.save(d)
      }
    }

    const pagamentos = app.findCollectionByNameOrId('pagamentos')
    if (app.countRecords('pagamentos') === 0) {
      for (let i = 0; i < 2; i++) {
        const p = new Record(pagamentos)
        p.set('paciente_id', pacienteMaria.id)
        p.set('valor', 150)
        p.set('status', i === 0 ? 'pendente' : 'atrasado')
        const dt = new Date(Date.now() + (i === 0 ? 5 : -5) * 86400000)
        p.set('data_vencimento', dt.toISOString().replace('T', ' ').substring(0, 19) + 'Z')
        app.save(p)
      }
    }

    const prontuarios = app.findCollectionByNameOrId('prontuarios_paciente')
    if (app.countRecords('prontuarios_paciente') === 0) {
      const p = new Record(prontuarios)
      p.set('paciente_id', pacienteMaria.id)
      p.set('psicologo_id', psicologo.id)
      p.set(
        'resumo_publico',
        '<p>Paciente apresenta evolução positiva no quadro de ansiedade. Continuamos trabalhando técnicas de respiração e reestruturação cognitiva.</p>',
      )
      p.set('data_atualizacao', new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z')
      app.save(p)
    }
  },
  (app) => {},
)
