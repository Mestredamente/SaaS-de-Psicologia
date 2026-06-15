migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let adminId
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@mentesa.com')
      adminId = admin.id
    } catch (_) {
      const admin = new Record(users)
      admin.setEmail('admin@mentesa.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Administrador')
      admin.set('nome_completo', 'Administrador do Sistema')
      admin.set('role', 'admin')
      admin.set('status', 'ativo')
      app.save(admin)
      adminId = admin.id
    }

    const planos = app.findCollectionByNameOrId('planos_assinatura')
    let planoBasicoId, planoProfissionalId, planoClinicaId

    try {
      planoBasicoId = app.findFirstRecordByData('planos_assinatura', 'nome', 'Básico').id
    } catch (_) {
      const p1 = new Record(planos)
      p1.set('nome', 'Básico')
      p1.set('descricao', 'Ideal para psicólogos iniciantes')
      p1.set('valor_mensal', 99.9)
      p1.set('max_psicologos', 1)
      p1.set('max_pacientes', 20)
      p1.set('max_funcionarios', 0)
      p1.set('recursos', '<ul><li>Agenda</li><li>Prontuários Básicos</li></ul>')
      p1.set('status', 'ativo')
      app.save(p1)
      planoBasicoId = p1.id
    }

    try {
      planoProfissionalId = app.findFirstRecordByData(
        'planos_assinatura',
        'nome',
        'Profissional',
      ).id
    } catch (_) {
      const p2 = new Record(planos)
      p2.set('nome', 'Profissional')
      p2.set('descricao', 'Para psicólogos estabelecidos')
      p2.set('valor_mensal', 149.9)
      p2.set('max_psicologos', 1)
      p2.set('max_pacientes', 100)
      p2.set('max_funcionarios', 1)
      p2.set(
        'recursos',
        '<ul><li>Agenda</li><li>Prontuários Completos</li><li>Financeiro</li></ul>',
      )
      p2.set('status', 'ativo')
      app.save(p2)
      planoProfissionalId = p2.id
    }

    try {
      planoClinicaId = app.findFirstRecordByData('planos_assinatura', 'nome', 'Clínica').id
    } catch (_) {
      const p3 = new Record(planos)
      p3.set('nome', 'Clínica')
      p3.set('descricao', 'Para clínicas e consultórios compartilhados')
      p3.set('valor_mensal', 299.9)
      p3.set('max_psicologos', 5)
      p3.set('max_pacientes', 500)
      p3.set('max_funcionarios', 3)
      p3.set(
        'recursos',
        '<ul><li>Tudo do Profissional</li><li>Gestão de Equipe</li><li>Relatórios Avançados</li></ul>',
      )
      p3.set('status', 'ativo')
      app.save(p3)
      planoClinicaId = p3.id
    }

    const psicologos = app.findRecordsByFilter(
      '_pb_users_auth_',
      "role = 'psicologo'",
      '-created',
      2,
      0,
    )
    const clinicas = app.findRecordsByFilter(
      '_pb_users_auth_',
      "role = 'clinica'",
      '-created',
      2,
      0,
    )

    const assinaturas = app.findCollectionByNameOrId('assinaturas')
    const tenants = app.findCollectionByNameOrId('tenants')

    const today = new Date().toISOString().replace('T', ' ')
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')

    const createTenantAndSub = (user, tipo, planoId, status, nome) => {
      try {
        app.findFirstRecordByData('tenants', 'usuario_id', user.id)
      } catch (_) {
        const t = new Record(tenants)
        t.set('usuario_id', user.id)
        t.set('tipo_usuario', tipo)
        t.set('nome_fantasia', nome)
        t.set('status', 'ativo')
        app.save(t)
      }

      try {
        app.findFirstRecordByData('assinaturas', 'usuario_id', user.id)
      } catch (_) {
        const a = new Record(assinaturas)
        a.set('usuario_id', user.id)
        a.set('tipo_usuario', tipo)
        a.set('plano_id', planoId)
        a.set('data_inicio', today)
        a.set('data_vencimento', nextMonth)
        a.set('status', status)
        app.save(a)
      }
    }

    if (psicologos.length > 0)
      createTenantAndSub(
        psicologos[0],
        'psicologo',
        planoBasicoId,
        'ativa',
        psicologos[0].getString('nome_completo') || 'Consultório Psicologia',
      )
    if (psicologos.length > 1)
      createTenantAndSub(
        psicologos[1],
        'psicologo',
        planoProfissionalId,
        'trial',
        psicologos[1].getString('nome_completo') || 'Atendimento Clínico',
      )

    if (clinicas.length > 0)
      createTenantAndSub(
        clinicas[0],
        'clinica',
        planoClinicaId,
        'ativa',
        clinicas[0].getString('nome_completo') || 'Clínica Saúde Mental',
      )
    if (clinicas.length > 1)
      createTenantAndSub(
        clinicas[1],
        'clinica',
        planoClinicaId,
        'suspensa',
        clinicas[1].getString('nome_completo') || 'Espaço Terapêutico',
      )
  },
  (app) => {
    // Can be left empty for seed down migration
  },
)
