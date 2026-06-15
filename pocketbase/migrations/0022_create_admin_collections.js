migrate(
  (app) => {
    const planos = new Collection({
      name: 'planos_assinatura',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: false },
        { name: 'valor_mensal', type: 'number', required: true },
        { name: 'max_psicologos', type: 'number', required: true },
        { name: 'max_pacientes', type: 'number', required: true },
        { name: 'max_funcionarios', type: 'number', required: false },
        { name: 'recursos', type: 'editor', required: false },
        { name: 'status', type: 'select', required: true, values: ['ativo', 'inativo'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(planos)

    const assinaturas = new Collection({
      name: 'assinaturas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'tipo_usuario', type: 'select', required: true, values: ['psicologo', 'clinica'] },
        {
          name: 'plano_id',
          type: 'relation',
          required: true,
          collectionId: planos.id,
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date', required: true },
        { name: 'data_vencimento', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativa', 'trial', 'cancelada', 'suspensa'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(assinaturas)

    const tenants = new Collection({
      name: 'tenants',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'tipo_usuario', type: 'select', required: true, values: ['psicologo', 'clinica'] },
        { name: 'nome_fantasia', type: 'text', required: true },
        { name: 'status', type: 'select', required: true, values: ['ativo', 'inativo'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tenants)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('tenants'))
    app.delete(app.findCollectionByNameOrId('assinaturas'))
    app.delete(app.findCollectionByNameOrId('planos_assinatura'))
  },
)
