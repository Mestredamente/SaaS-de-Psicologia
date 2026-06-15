migrate(
  (app) => {
    const collection = new Collection({
      name: 'permissoes_menu',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          values: ['psicologo', 'clinica', 'paciente', 'funcionario', 'admin'],
        },
        { name: 'item_menu', type: 'text', required: true },
        { name: 'rota', type: 'text', required: true },
        {
          name: 'requer_cargo',
          type: 'select',
          required: false,
          values: ['secretaria', 'administrativo', 'rh'],
        },
        { name: 'visivel', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('permissoes_menu')
    app.delete(collection)
  },
)
