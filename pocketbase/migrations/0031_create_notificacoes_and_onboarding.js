migrate(
  (app) => {
    // Update users collection
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(new BoolField({ name: 'onboarding_completed' }))
    app.save(users)

    // Create notificacoes collection
    const notificacoes = new Collection({
      name: 'notificacoes',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['sistema', 'usuario', 'alerta', 'urgente', 'sucesso'],
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'mensagem', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['lida', 'nao_lida'],
          maxSelect: 1,
        },
        { name: 'link_acao', type: 'text' },
        { name: 'data_envio', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_notificacoes_usuario ON notificacoes (usuario_id, status)'],
    })
    app.save(notificacoes)
  },
  (app) => {
    const notificacoes = app.findCollectionByNameOrId('notificacoes')
    app.delete(notificacoes)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('onboarding_completed')
    app.save(users)
  },
)
