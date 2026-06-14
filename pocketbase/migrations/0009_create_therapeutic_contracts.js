migrate(
  (app) => {
    const collection = new Collection({
      name: 'contratos_terapeuticos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
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
        { name: 'numero_contrato', type: 'text', required: true },
        { name: 'data_emissao', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'enviado', 'assinado', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'conteudo', type: 'editor' },
        { name: 'data_assinatura', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('contratos_terapeuticos')
    app.delete(collection)
  },
)
