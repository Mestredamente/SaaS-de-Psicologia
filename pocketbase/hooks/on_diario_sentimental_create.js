onRecordAfterCreateSuccess((e) => {
  const pacienteId = e.record.get('paciente_id')
  if (!pacienteId) return e.next()

  try {
    const paciente = $app.findRecordById('pacientes', pacienteId)
    const psicologoId = paciente.get('psicologo_id')
    if (!psicologoId) return e.next()

    const psicologo = $app.findRecordById('perfis_psicologos', psicologoId)
    const userId = psicologo.get('user_id')
    if (!userId) return e.next()

    const notificacoes = $app.findCollectionByNameOrId('notificacoes')
    const novaNotificacao = new Record(notificacoes)

    novaNotificacao.set('usuario_id', userId)
    novaNotificacao.set('tipo', 'alerta')
    novaNotificacao.set('titulo', 'Nova atualização de diário')
    novaNotificacao.set(
      'mensagem',
      `O paciente ${paciente.get('nome_completo')} realizou uma nova entrada no diário sentimental.`,
    )
    novaNotificacao.set('status', 'nao_lida')
    novaNotificacao.set('data_envio', new Date().toISOString())
    novaNotificacao.set('link_acao', `/pacientes/${pacienteId}/diario`)

    $app.save(novaNotificacao)
  } catch (err) {
    $app
      .logger()
      .error(
        'Erro ao criar notificacao de diario sentimental',
        'error',
        err.message || err.toString(),
      )
  }

  return e.next()
}, 'diario_sentimental')
