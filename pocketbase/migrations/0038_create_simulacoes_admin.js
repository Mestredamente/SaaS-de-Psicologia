migrate(
  (app) => {
    const collection = new Collection({
      name: 'simulacoes_admin',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'admin_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_simulado_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo_simulado',
          type: 'select',
          required: true,
          values: ['psicologo', 'clinica', 'paciente', 'funcionario'],
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date' },
        { name: 'data_fim', type: 'date' },
        { name: 'ip_admin', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    app.save(collection)

    const permissoes = app.findCollectionByNameOrId('permissoes_menu')
    const p = new Record(permissoes)
    p.set('role', 'admin')
    p.set('item_menu', 'Visão de Usuário')
    p.set('rota', '/admin/visao-usuario')
    p.set('visivel', true)
    app.save(p)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('simulacoes_admin')
    app.delete(collection)

    try {
      const p = app.findFirstRecordByData('permissoes_menu', 'rota', '/admin/visao-usuario')
      app.delete(p)
    } catch (_) {}
  },
)
