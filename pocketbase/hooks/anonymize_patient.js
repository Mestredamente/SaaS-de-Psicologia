routerAdd(
  'POST',
  '/backend/v1/anonymize-patient/{id}',
  (e) => {
    const auth = e.auth
    if (!auth || auth.getString('role') !== 'admin') {
      return e.forbiddenError('Apenas administradores podem anonimizar pacientes.')
    }
    const id = e.request.pathValue('id')
    try {
      $app.runInTransaction((txApp) => {
        const p = txApp.findRecordById('pacientes', id)
        p.set('nome_completo', 'ANONIMIZADO')
        p.set('cpf', '')
        p.set('email', '')
        p.set('telefone', '')
        p.set('endereco', '')
        p.set('cidade', '')
        p.set('estado', '')
        p.set('cep', '')
        p.set('responsavel_nome', '')
        p.set('responsavel_cpf', '')
        p.set('email_nf', '')

        txApp.saveNoValidate(p)

        const logs = txApp.findCollectionByNameOrId('logs_auditoria')
        const logRecord = new Record(logs)
        logRecord.set('usuario_id', auth.id)
        logRecord.set('tipo_usuario', 'admin')
        logRecord.set('acao', 'anonymize')
        logRecord.set('tabela_afetada', 'pacientes')
        logRecord.set('registro_id', id)
        logRecord.set('data_hora', new Date().toISOString())
        txApp.saveNoValidate(logRecord)
      })
      return e.json(200, { success: true })
    } catch (err) {
      $app.logger().error('Anonymize failed', 'error', err.message)
      return e.internalServerError('Erro interno ao anonimizar paciente.')
    }
  },
  $apis.requireAuth(),
)
