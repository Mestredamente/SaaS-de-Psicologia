migrate(
  (app) => {
    const collection = new Collection({
      name: 'funcionarios',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'clinica_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('clinicas').id,
          maxSelect: 1,
        },
        { name: 'nome_completo', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'telefone', type: 'text' },
        {
          name: 'cargo',
          type: 'select',
          required: true,
          values: ['secretaria', 'rh', 'administrativo'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        },
        { name: 'permissao_agenda', type: 'bool' },
        { name: 'permissao_pacientes', type: 'bool' },
        { name: 'permissao_financeiro', type: 'bool' },
        { name: 'permissao_relatorios', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('funcionarios')
    app.delete(collection)
  },
)
