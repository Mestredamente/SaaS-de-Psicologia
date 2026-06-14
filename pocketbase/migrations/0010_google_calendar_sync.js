migrate(
  (app) => {
    const collection = new Collection({
      name: 'google_calendar_sync',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo_usuario',
          type: 'select',
          required: true,
          values: ['psicologo', 'clinica'],
          maxSelect: 1,
        },
        { name: 'google_calendar_id', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        },
        { name: 'ultima_sincronizacao', type: 'date' },
        { name: 'auto_sync_novos', type: 'bool' },
        { name: 'auto_sync_atualizacoes', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_gcs_usuario ON google_calendar_sync (usuario_id, status)'],
    })
    app.save(collection)

    const agendamentos = app.findCollectionByNameOrId('agendamentos')
    if (!agendamentos.fields.getByName('google_event_id')) {
      agendamentos.fields.add(new TextField({ name: 'google_event_id' }))
      app.save(agendamentos)
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('google_calendar_sync')
      app.delete(collection)
    } catch (_) {}

    try {
      const agendamentos = app.findCollectionByNameOrId('agendamentos')
      agendamentos.fields.removeByName('google_event_id')
      app.save(agendamentos)
    } catch (_) {}
  },
)
