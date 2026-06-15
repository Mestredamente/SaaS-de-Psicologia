migrate(
  (app) => {
    const collection = new Collection({
      name: 'contratos_saas',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'contratante_id', type: 'text', required: true },
        { name: 'contratante_nome', type: 'text', required: true },
        {
          name: 'tipo_contratante',
          type: 'select',
          required: true,
          values: ['psicologo', 'clinica'],
          maxSelect: 1,
        },
        { name: 'numero_contrato', type: 'text', required: true },
        { name: 'data_emissao', type: 'date', required: true },
        { name: 'data_inicio', type: 'date', required: true },
        { name: 'data_vencimento', type: 'date', required: true },
        {
          name: 'plano_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('planos_assinatura').id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'valor_mensal', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'enviado', 'assinado', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'conteudo', type: 'editor' },
        { name: 'data_assinatura', type: 'date' },
        { name: 'ip_assinatura', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_contratos_saas_status ON contratos_saas (status)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('contratos_saas')
    app.delete(collection)
  },
)
