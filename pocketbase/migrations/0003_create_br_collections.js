migrate(
  (app) => {
    const perfis = new Collection({
      name: 'perfis_psicologos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'nome_completo', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'crp', type: 'text', required: true },
        { name: 'telefone', type: 'text' },
        { name: 'especialidade', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(perfis)

    const pacientes = new Collection({
      name: 'pacientes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome_completo', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'telefone', type: 'text' },
        { name: 'data_nascimento', type: 'date' },
        {
          name: 'psicologo_id',
          type: 'relation',
          collectionId: perfis.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'status', type: 'select', values: ['ativo', 'inativo'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(pacientes)

    const atendimentos = new Collection({
      name: 'atendimentos',
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
          collectionId: pacientes.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'psicologo_id',
          type: 'relation',
          collectionId: perfis.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'data_hora', type: 'date', required: true },
        { name: 'tipo', type: 'select', values: ['presencial', 'online'], maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['agendado', 'realizado', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'valor', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(atendimentos)

    const prontuarios = new Collection({
      name: 'prontuarios',
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
          collectionId: pacientes.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'psicologo_id',
          type: 'relation',
          collectionId: perfis.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'conteudo', type: 'editor' },
        { name: 'data_atualizacao', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(prontuarios)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('prontuarios'))
    app.delete(app.findCollectionByNameOrId('atendimentos'))
    app.delete(app.findCollectionByNameOrId('pacientes'))
    app.delete(app.findCollectionByNameOrId('perfis_psicologos'))
  },
)
