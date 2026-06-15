migrate(
  (app) => {
    const termos = new Collection({
      name: 'termos_consentimento',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: [
            'lgpd_geral',
            'tratamento_dados',
            'terapia_online',
            'menor_idade',
            'compartilhamento_supervisao',
          ],
          maxSelect: 1,
        },
        { name: 'versao', type: 'text', required: true },
        { name: 'conteudo', type: 'editor', required: true },
        { name: 'data_publicacao', type: 'date', required: true },
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
    app.save(termos)

    const consentimentos = new Collection({
      name: 'consentimentos_paciente',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'paciente_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('pacientes').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'termo_id',
          type: 'relation',
          required: true,
          collectionId: termos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'versao', type: 'text', required: true },
        { name: 'data_aceite', type: 'date', required: true },
        { name: 'ip_aceite', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['aceito', 'recusado', 'revogado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_cons_paciente ON consentimentos_paciente (paciente_id)'],
    })
    app.save(consentimentos)

    const logs = new Collection({
      name: 'logs_auditoria',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo_usuario',
          type: 'select',
          required: true,
          values: ['psicologo', 'paciente', 'clinica', 'funcionario', 'admin'],
          maxSelect: 1,
        },
        { name: 'acao', type: 'text', required: true },
        { name: 'tabela_afetada', type: 'text', required: true },
        { name: 'registro_id', type: 'text', required: true },
        { name: 'dados_alterados', type: 'json', required: false },
        { name: 'data_hora', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_logs_data ON logs_auditoria (data_hora)'],
    })
    app.save(logs)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('logs_auditoria'))
    app.delete(app.findCollectionByNameOrId('consentimentos_paciente'))
    app.delete(app.findCollectionByNameOrId('termos_consentimento'))
  },
)
