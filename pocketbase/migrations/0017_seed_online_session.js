migrate(
  (app) => {
    // 1. Find or create psychologist
    let psicologo
    try {
      psicologo = app.findFirstRecordByData('perfis_psicologos', 'nome_completo', 'Dra. Ana Sousa')
    } catch (_) {
      try {
        psicologo = app.findFirstRecordByFilter('perfis_psicologos', "nome_completo ~ 'Ana'")
      } catch (__) {
        try {
          psicologo = app.findFirstRecordByFilter('perfis_psicologos', "id != ''")
        } catch (___) {
          return
        }
      }
    }

    // 2. Find or create patient
    let paciente
    try {
      paciente = app.findFirstRecordByData('pacientes', 'nome_completo', 'Maria Silva')
    } catch (_) {
      try {
        paciente = app.findFirstRecordByFilter('pacientes', "nome_completo ~ 'Maria'")
      } catch (__) {
        try {
          paciente = app.findFirstRecordByFilter('pacientes', "id != ''")
        } catch (___) {
          return
        }
      }
    }

    // 3. Create appointment for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    const agendamentos = app.findCollectionByNameOrId('agendamentos')
    const agendamento = new Record(agendamentos)
    agendamento.set('paciente_id', paciente.id)
    agendamento.set('psicologo_id', psicologo.id)
    agendamento.set('data_hora', tomorrow.toISOString())
    agendamento.set('tipo', 'online')
    agendamento.set('status', 'agendado')
    agendamento.set('valor', 150)
    app.save(agendamento)

    // 4. Create online session
    const sessoes = app.findCollectionByNameOrId('sessoes_online')
    const sessao = new Record(sessoes)
    sessao.set('agendamento_id', agendamento.id)
    sessao.set('psicologo_id', psicologo.id)
    sessao.set('paciente_id', paciente.id)
    sessao.set('link_sala', 'sala-maria-' + tomorrow.getTime())
    sessao.set('status', 'aguardando')
    app.save(sessao)
  },
  (app) => {
    try {
      const sessao = app.findFirstRecordByFilter('sessoes_online', "status='aguardando'")
      if (sessao) {
        app.delete(sessao)
        try {
          const ag = app.findRecordById('agendamentos', sessao.get('agendamento_id'))
          app.delete(ag)
        } catch (_) {}
      }
    } catch (_) {}
  },
)
