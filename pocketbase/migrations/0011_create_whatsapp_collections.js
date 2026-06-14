migrate(
  (app) => {
    const configCol = new Collection({
      name: 'whatsapp_config',
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
        },
        { name: 'telefone', type: 'text' },
        { name: 'lembrete_24h', type: 'bool' },
        { name: 'confirmacao_agendamento', type: 'bool' },
        { name: 'notificacao_reagendamento', type: 'bool' },
        { name: 'notificacao_cancelamento', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(configCol)

    const pacientesId = app.findCollectionByNameOrId('pacientes').id
    const agendamentosId = app.findCollectionByNameOrId('agendamentos').id

    const notifCol = new Collection({
      name: 'notificacoes_whatsapp',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'paciente_id',
          type: 'relation',
          required: true,
          collectionId: pacientesId,
          maxSelect: 1,
        },
        {
          name: 'agendamento_id',
          type: 'relation',
          required: true,
          collectionId: agendamentosId,
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['lembrete_consulta', 'confirmacao', 'reagendamento', 'cancelamento'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['enviado', 'pendente', 'falha'],
          maxSelect: 1,
        },
        { name: 'telefone_destino', type: 'text', required: true },
        { name: 'mensagem', type: 'text', required: true },
        { name: 'data_envio', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notifCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notificacoes_whatsapp'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('whatsapp_config'))
    } catch (_) {}
  },
)
