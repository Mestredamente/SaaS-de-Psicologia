routerAdd(
  'POST',
  '/backend/v1/admin/simulate',
  (e) => {
    const admin = e.auth
    if (!admin || admin.getString('role') !== 'admin') {
      return e.forbiddenError('Apenas admins podem simular')
    }
    const body = e.requestInfo().body || {}
    const targetId = body.user_id
    if (!targetId) return e.badRequestError('user_id é obrigatório')

    let target
    try {
      target = $app.findRecordById('users', targetId)
    } catch (_) {
      return e.notFoundError('Usuário não encontrado')
    }

    const simCollection = $app.findCollectionByNameOrId('simulacoes_admin')
    const sim = new Record(simCollection)
    sim.set('admin_id', admin.id)
    sim.set('usuario_simulado_id', target.id)
    sim.set('tipo_simulado', target.getString('role'))
    sim.set('data_inicio', new Date().toISOString())
    sim.set('ip_admin', e.request.remoteAddr)
    $app.save(sim)

    e.response.header().set('X-Sim-Id', sim.id)
    e.response.header().set('Access-Control-Expose-Headers', 'X-Sim-Id')

    return $apis.recordAuthResponse(e, target)
  },
  $apis.requireAuth(),
)
