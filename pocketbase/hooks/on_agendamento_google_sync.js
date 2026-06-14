onRecordAfterUpdateSuccess((e) => {
  const agendamento = e.record
  const original = e.record.original()

  if (
    agendamento.getString('data_hora') === original.getString('data_hora') &&
    agendamento.getString('status') === original.getString('status')
  ) {
    return e.next()
  }

  try {
    const psiId = agendamento.getString('psicologo_id')
    const perfil = $app.findRecordById('perfis_psicologos', psiId)
    const userId = perfil.getString('user_id')

    const sync = $app.findFirstRecordByFilter(
      'google_calendar_sync',
      "usuario_id = {:userId} && status = 'ativo'",
      { userId },
    )

    if (sync.getBool('auto_sync_atualizacoes')) {
      sync.set('ultima_sincronizacao', new Date().toISOString())
      $app.saveNoValidate(sync)
      $app.logger().info('Google Calendar Auto-Sync Update', 'agendamento', agendamento.id)
    }
  } catch (err) {
    // Ignored, likely no sync configured
  }

  return e.next()
}, 'agendamentos')
