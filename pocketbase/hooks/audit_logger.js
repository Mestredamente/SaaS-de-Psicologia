onRecordViewRequest(
  (e) => {
    try {
      const auth = e.auth
      if (!auth) return e.next()
      const col = e.collection.name
      const logs = $app.findCollectionByNameOrId('logs_auditoria')
      const logRecord = new Record(logs)
      logRecord.set('usuario_id', auth.id)
      logRecord.set('tipo_usuario', auth.getString('role') || 'psicologo')
      logRecord.set('acao', 'view')
      logRecord.set('tabela_afetada', col)
      logRecord.set('registro_id', e.record.id)
      logRecord.set('data_hora', new Date().toISOString())
      $app.saveNoValidate(logRecord)
    } catch (err) {
      $app.logger().error('Audit log view failed', 'error', err.message)
    }
    e.next()
  },
  'prontuarios',
  'pagamentos',
)

onRecordUpdateRequest(
  (e) => {
    try {
      const auth = e.auth
      if (!auth) return e.next()
      const col = e.collection.name
      const logs = $app.findCollectionByNameOrId('logs_auditoria')
      const logRecord = new Record(logs)
      logRecord.set('usuario_id', auth.id)
      logRecord.set('tipo_usuario', auth.getString('role') || 'psicologo')
      logRecord.set('acao', 'update')
      logRecord.set('tabela_afetada', col)
      logRecord.set('registro_id', e.record.id)
      logRecord.set('dados_alterados', JSON.stringify(e.requestInfo().body))
      logRecord.set('data_hora', new Date().toISOString())
      $app.saveNoValidate(logRecord)
    } catch (err) {
      $app.logger().error('Audit log update failed', 'error', err.message)
    }
    e.next()
  },
  'prontuarios',
  'pagamentos',
)
