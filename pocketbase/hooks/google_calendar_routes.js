routerAdd(
  'POST',
  '/backend/v1/google-calendar/sync-event',
  (e) => {
    const body = e.requestInfo().body || {}
    const agendamentoId = body.agendamento_id

    if (!agendamentoId) return e.badRequestError('agendamento_id required')

    try {
      const agendamento = $app.findRecordById('agendamentos', agendamentoId)
      const psiId = agendamento.getString('psicologo_id')
      const perfil = $app.findRecordById('perfis_psicologos', psiId)

      if (perfil.getString('user_id') !== e.auth?.id) {
        return e.forbiddenError('Not your appointment')
      }

      const sync = $app.findFirstRecordByFilter(
        'google_calendar_sync',
        "usuario_id = {:userId} && status = 'ativo'",
        { userId: e.auth?.id },
      )

      const eventId = agendamento.getString('google_event_id') || $security.randomString(10)

      agendamento.set('google_event_id', eventId)
      $app.saveNoValidate(agendamento)

      sync.set('ultima_sincronizacao', new Date().toISOString())
      $app.saveNoValidate(sync)

      $app.logger().info('Google Calendar Sync manual', 'agendamento', agendamento.id)

      return e.json(200, { success: true, google_event_id: eventId })
    } catch (err) {
      return e.badRequestError(err.message)
    }
  },
  $apis.requireAuth(),
)
