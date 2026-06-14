migrate(
  (app) => {
    const pacientes = app.findCollectionByNameOrId('pacientes')
    if (!pacientes.fields.getByName('cpf')) {
      pacientes.fields.add(new TextField({ name: 'cpf' }))
      pacientes.fields.add(new TextField({ name: 'endereco' }))
      pacientes.fields.add(new TextField({ name: 'cidade' }))
      pacientes.fields.add(new TextField({ name: 'estado' }))
      pacientes.fields.add(new TextField({ name: 'cep' }))
      pacientes.fields.add(new BoolField({ name: 'is_menor' }))
      pacientes.fields.add(new TextField({ name: 'responsavel_nome' }))
      pacientes.fields.add(new TextField({ name: 'responsavel_cpf' }))
      pacientes.fields.add(new TextField({ name: 'cnpj' }))
      pacientes.fields.add(new BoolField({ name: 'emitir_nf' }))
      pacientes.fields.add(new EmailField({ name: 'email_nf' }))
      pacientes.fields.add(
        new RelationField({ name: 'user_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
      app.save(pacientes)
    }

    try {
      app.findCollectionByNameOrId('agendamentos')
    } catch (_) {
      const agendamentos = new Collection({
        name: 'agendamentos',
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
          },
          {
            name: 'psicologo_id',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('perfis_psicologos').id,
            required: true,
            maxSelect: 1,
          },
          { name: 'data_hora', type: 'date', required: true },
          {
            name: 'tipo',
            type: 'select',
            values: ['presencial', 'online'],
            required: true,
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['agendado', 'confirmado', 'realizado', 'cancelado', 'reagendado'],
            required: true,
            maxSelect: 1,
          },
          { name: 'valor', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(agendamentos)
    }

    try {
      app.findCollectionByNameOrId('prontuarios_paciente')
    } catch (_) {
      const prontuarios_paciente = new Collection({
        name: 'prontuarios_paciente',
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
          },
          {
            name: 'psicologo_id',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('perfis_psicologos').id,
            required: true,
            maxSelect: 1,
          },
          { name: 'resumo_publico', type: 'editor' },
          { name: 'data_atualizacao', type: 'date' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(prontuarios_paciente)
    }

    try {
      app.findCollectionByNameOrId('diario_sentimental')
    } catch (_) {
      const diario_sentimental = new Collection({
        name: 'diario_sentimental',
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
          },
          { name: 'data', type: 'date', required: true },
          {
            name: 'humor',
            type: 'select',
            values: ['ótimo', 'bom', 'neutro', 'ruim', 'péssimo'],
            required: true,
            maxSelect: 1,
          },
          { name: 'intensidade', type: 'number', required: true },
          { name: 'anotacoes', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(diario_sentimental)
    }

    try {
      app.findCollectionByNameOrId('pagamentos')
    } catch (_) {
      const pagamentos = new Collection({
        name: 'pagamentos',
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
          },
          {
            name: 'agendamento_id',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('agendamentos').id,
            maxSelect: 1,
          },
          { name: 'valor', type: 'number', required: true },
          {
            name: 'status',
            type: 'select',
            values: ['pendente', 'pago', 'atrasado'],
            required: true,
            maxSelect: 1,
          },
          { name: 'data_vencimento', type: 'date', required: true },
          { name: 'data_pagamento', type: 'date' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(pagamentos)
    }
  },
  (app) => {},
)
