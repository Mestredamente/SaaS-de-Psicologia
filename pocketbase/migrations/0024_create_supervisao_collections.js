migrate(
  (app) => {
    const perfis = app.findCollectionByNameOrId('perfis_psicologos')
    const pacientes = app.findCollectionByNameOrId('pacientes')

    const supervisores = new Collection({
      name: 'supervisores',
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
          collectionId: perfis.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'especialidade_supervisao', type: 'text' },
        { name: 'registro_supervisor', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(supervisores)

    const supervisandos = new Collection({
      name: 'supervisandos',
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
          collectionId: perfis.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'supervisor_id',
          type: 'relation',
          required: true,
          collectionId: supervisores.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date' },
        { name: 'data_fim', type: 'date' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['em_andamento', 'concluido', 'interrompido'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(supervisandos)

    const sessoes_supervisao = new Collection({
      name: 'sessoes_supervisao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'supervisor_id',
          type: 'relation',
          required: true,
          collectionId: supervisores.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'supervisando_id',
          type: 'relation',
          required: true,
          collectionId: supervisandos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'data_hora', type: 'date', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['individual', 'grupo'],
          maxSelect: 1,
        },
        { name: 'conteudo', type: 'editor' },
        { name: 'observacoes', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['agendada', 'realizada', 'cancelada'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(sessoes_supervisao)

    const casos_supervisao = new Collection({
      name: 'casos_supervisao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'supervisando_id',
          type: 'relation',
          required: true,
          collectionId: supervisandos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'paciente_id',
          type: 'relation',
          required: true,
          collectionId: pacientes.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'descricao_caso', type: 'text', required: true },
        { name: 'demanda_principal', type: 'text', required: true },
        { name: 'evolucao', type: 'text' },
        { name: 'intervencoes', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['em_supervisao', 'concluido'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(casos_supervisao)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('casos_supervisao'))
    app.delete(app.findCollectionByNameOrId('sessoes_supervisao'))
    app.delete(app.findCollectionByNameOrId('supervisandos'))
    app.delete(app.findCollectionByNameOrId('supervisores'))
  },
)
