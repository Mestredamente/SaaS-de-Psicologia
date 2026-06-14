migrate(
  (app) => {
    const collection = new Collection({
      name: 'sessoes_online',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'agendamento_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('agendamentos').id,
          maxSelect: 1,
        },
        {
          name: 'psicologo_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('perfis_psicologos').id,
          maxSelect: 1,
        },
        {
          name: 'paciente_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('pacientes').id,
          maxSelect: 1,
        },
        { name: 'link_sala', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['aguardando', 'em_andamento', 'finalizada'],
        },
        { name: 'hora_inicio', type: 'date' },
        { name: 'hora_fim', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('sessoes_online')
    app.delete(collection)
  },
)
