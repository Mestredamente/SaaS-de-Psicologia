migrate(
  (app) => {
    const collection = new Collection({
      name: 'financeiro',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (psicologo_id.user_id = @request.auth.id || paciente_id.user_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'clinica' || @request.auth.role = 'funcionario')",
      viewRule:
        "@request.auth.id != '' && (psicologo_id.user_id = @request.auth.id || paciente_id.user_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'clinica' || @request.auth.role = 'funcionario')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (psicologo_id.user_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'clinica' || @request.auth.role = 'funcionario')",
      deleteRule:
        "@request.auth.id != '' && (psicologo_id.user_id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'clinica')",
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
          required: false,
          collectionId: app.findCollectionByNameOrId('pacientes').id,
          maxSelect: 1,
        },
        {
          name: 'agendamento_id',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('agendamentos').id,
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['receita', 'despesa'],
          maxSelect: 1,
        },
        {
          name: 'categoria',
          type: 'select',
          required: true,
          values: ['sessao', 'plano', 'material', 'outro'],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'valor', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'recebido', 'atrasado', 'cancelado'],
          maxSelect: 1,
        },
        { name: 'data_vencimento', type: 'date', required: true },
        { name: 'data_recebimento', type: 'date', required: false },
        { name: 'forma_pagamento', type: 'text', required: false },
        { name: 'observacoes', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_financeiro_status ON financeiro (status)',
        'CREATE INDEX idx_financeiro_vencimento ON financeiro (data_vencimento)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('financeiro')
    app.delete(collection)
  },
)
