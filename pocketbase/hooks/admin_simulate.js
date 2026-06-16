routerAdd(
  'POST',
  '/backend/v1/admin/simulate',
  (e) => {
    const adminId = e.auth?.id
    if (!adminId || e.auth?.role !== 'admin') {
      return e.forbiddenError('Acesso negado. Apenas administradores podem simular.')
    }

    const body = e.requestInfo().body
    if (!body || !body.user_id) {
      return e.badRequestError('O ID do usuário é obrigatório.')
    }

    const targetUser = $app.findRecordById('users', body.user_id)

    if (targetUser.getString('role') === 'admin') {
      return e.badRequestError('Não é possível simular o perfil de outro administrador.')
    }

    const simCollection = $app.findCollectionByNameOrId('simulacoes_admin')
    const simRecord = new Record(simCollection)
    simRecord.set('admin_id', adminId)
    simRecord.set('usuario_simulado_id', targetUser.id)
    simRecord.set('tipo_simulado', targetUser.getString('role'))
    simRecord.set('data_inicio', new Date().toISOString())
    simRecord.set('ip_admin', e.request.remoteAddr)

    $app.save(simRecord)

    e.response.header().set('X-Sim-Id', simRecord.id)
    e.response.header().set('Access-Control-Expose-Headers', 'X-Sim-Id')

    return $apis.recordAuthResponse(e, targetUser)
  },
  $apis.requireAuth(),
)
