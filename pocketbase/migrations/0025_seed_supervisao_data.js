migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const perfis = app.findCollectionByNameOrId('perfis_psicologos')

    // Create Supervisor Dr. Roberto
    let robertoUser
    try {
      robertoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'roberto@supervisor.com')
    } catch (_) {
      robertoUser = new Record(users)
      robertoUser.setEmail('roberto@supervisor.com')
      robertoUser.setPassword('Skip@Pass')
      robertoUser.setVerified(true)
      robertoUser.set('name', 'Dr. Roberto (Supervisor)')
      robertoUser.set('role', 'psicologo')
      app.save(robertoUser)
    }

    let robertoPerfil
    try {
      robertoPerfil = app.findFirstRecordByData('perfis_psicologos', 'user_id', robertoUser.id)
    } catch (_) {
      robertoPerfil = new Record(perfis)
      robertoPerfil.set('user_id', robertoUser.id)
      robertoPerfil.set('nome_completo', 'Dr. Roberto Silva')
      robertoPerfil.set('email', 'roberto@supervisor.com')
      robertoPerfil.set('crp', '00/00001')
      app.save(robertoPerfil)
    }

    // Create Supervisee Dra. Ana
    let anaUser
    try {
      anaUser = app.findAuthRecordByEmail('_pb_users_auth_', 'ana@supervisanda.com')
    } catch (_) {
      anaUser = new Record(users)
      anaUser.setEmail('ana@supervisanda.com')
      anaUser.setPassword('Skip@Pass')
      anaUser.setVerified(true)
      anaUser.set('name', 'Dra. Ana (Supervisanda)')
      anaUser.set('role', 'psicologo')
      app.save(anaUser)
    }

    let anaPerfil
    try {
      anaPerfil = app.findFirstRecordByData('perfis_psicologos', 'user_id', anaUser.id)
    } catch (_) {
      anaPerfil = new Record(perfis)
      anaPerfil.set('user_id', anaUser.id)
      anaPerfil.set('nome_completo', 'Dra. Ana Costa')
      anaPerfil.set('email', 'ana@supervisanda.com')
      anaPerfil.set('crp', '00/00002')
      app.save(anaPerfil)
    }

    // Seed supervisores
    let supervisor
    try {
      supervisor = app.findFirstRecordByData('supervisores', 'psicologo_id', robertoPerfil.id)
    } catch (_) {
      const supervisores = app.findCollectionByNameOrId('supervisores')
      supervisor = new Record(supervisores)
      supervisor.set('psicologo_id', robertoPerfil.id)
      supervisor.set('especialidade_supervisao', 'Terapia Cognitivo-Comportamental')
      supervisor.set('registro_supervisor', 'SUP-12345')
      supervisor.set('status', 'ativo')
      app.save(supervisor)
    }

    // Seed supervisandos
    let supervisando
    try {
      supervisando = app.findFirstRecordByData('supervisandos', 'psicologo_id', anaPerfil.id)
    } catch (_) {
      const supervisandos = app.findCollectionByNameOrId('supervisandos')
      supervisando = new Record(supervisandos)
      supervisando.set('psicologo_id', anaPerfil.id)
      supervisando.set('supervisor_id', supervisor.id)
      supervisando.set('data_inicio', new Date().toISOString())
      supervisando.set('status', 'em_andamento')
      app.save(supervisando)
    }

    // Seed pacientes for Ana
    let paciente1
    try {
      paciente1 = app.findFirstRecordByData('pacientes', 'email', 'paciente1.ana@test.com')
    } catch (_) {
      const pacientesCol = app.findCollectionByNameOrId('pacientes')
      paciente1 = new Record(pacientesCol)
      paciente1.set('nome_completo', 'Paciente Um Ana')
      paciente1.set('email', 'paciente1.ana@test.com')
      paciente1.set('psicologo_id', anaPerfil.id)
      app.save(paciente1)
    }

    let paciente2
    try {
      paciente2 = app.findFirstRecordByData('pacientes', 'email', 'paciente2.ana@test.com')
    } catch (_) {
      const pacientesCol = app.findCollectionByNameOrId('pacientes')
      paciente2 = new Record(pacientesCol)
      paciente2.set('nome_completo', 'Paciente Dois Ana')
      paciente2.set('email', 'paciente2.ana@test.com')
      paciente2.set('psicologo_id', anaPerfil.id)
      app.save(paciente2)
    }

    // Seed sessoes_supervisao
    const sessoesCount = app.countRecords('sessoes_supervisao')
    if (sessoesCount === 0) {
      const sessoes = app.findCollectionByNameOrId('sessoes_supervisao')
      for (let i = 1; i <= 3; i++) {
        const sessao = new Record(sessoes)
        sessao.set('supervisor_id', supervisor.id)
        sessao.set('supervisando_id', supervisando.id)

        const date = new Date()
        date.setDate(date.getDate() - i * 7) // last 3 weeks

        sessao.set('data_hora', date.toISOString())
        sessao.set('tipo', 'individual')
        sessao.set('conteudo', `<p>Discussão de caso ${i}</p>`)
        sessao.set('observacoes', 'Evolução positiva. Seguir plano traçado.')
        sessao.set('status', 'realizada')
        app.save(sessao)
      }
    }

    // Seed casos_supervisao
    const casosCount = app.countRecords('casos_supervisao')
    if (casosCount === 0) {
      const casos = app.findCollectionByNameOrId('casos_supervisao')

      const caso1 = new Record(casos)
      caso1.set('supervisando_id', supervisando.id)
      caso1.set('paciente_id', paciente1.id)
      caso1.set('descricao_caso', 'Paciente apresenta quadro de ansiedade generalizada.')
      caso1.set('demanda_principal', 'Ansiedade e ataques de pânico.')
      caso1.set('evolucao', 'Redução na frequência dos ataques após três sessões.')
      caso1.set('intervencoes', 'Técnicas de respiração, reestruturação cognitiva e mindfulness.')
      caso1.set('status', 'em_supervisao')
      app.save(caso1)

      const caso2 = new Record(casos)
      caso2.set('supervisando_id', supervisando.id)
      caso2.set('paciente_id', paciente2.id)
      caso2.set('descricao_caso', 'Quadro depressivo moderado associado a luto recente.')
      caso2.set('demanda_principal', 'Desmotivação e isolamento social progressivo.')
      caso2.set('evolucao', 'Iniciou retomada de atividades prazerosas leves.')
      caso2.set('intervencoes', 'Ativação comportamental e validação emocional.')
      caso2.set('status', 'em_supervisao')
      app.save(caso2)
    }
  },
  (app) => {},
)
