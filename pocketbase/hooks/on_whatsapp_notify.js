onRecordAfterCreateSuccess((e) => {
  const status = e.record.getString('status')
  if (status === 'pendente') {
    const record = $app.findRecordById('notificacoes_whatsapp', e.record.id)
    const telefone = record.getString('telefone_destino')

    // Simulando envio ou falha baseado no número (para permitir testar o Reenviar)
    if (telefone === '00000000000' || telefone.trim() === '') {
      record.set('status', 'falha')
    } else {
      record.set('status', 'enviado')
      record.set('data_envio', new Date().toISOString())
    }
    $app.save(record)
  }
  e.next()
}, 'notificacoes_whatsapp')

onRecordAfterUpdateSuccess((e) => {
  const status = e.record.getString('status')
  const originalStatus = e.record.original().getString('status')

  if (status === 'pendente' && originalStatus !== 'pendente') {
    const record = $app.findRecordById('notificacoes_whatsapp', e.record.id)
    const telefone = record.getString('telefone_destino')

    if (telefone === '00000000000' || telefone.trim() === '') {
      record.set('status', 'falha')
    } else {
      record.set('status', 'enviado')
      record.set('data_envio', new Date().toISOString())
    }
    $app.save(record)
  }
  e.next()
}, 'notificacoes_whatsapp')
