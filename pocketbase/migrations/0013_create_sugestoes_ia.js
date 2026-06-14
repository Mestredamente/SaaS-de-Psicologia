migrate(
  (app) => {
    let collection
    try {
      collection = app.findCollectionByNameOrId('sugestoes_ia_prontuario')
    } catch (_) {
      const prontuariosCol = app.findCollectionByNameOrId('prontuarios')
      const psicologosCol = app.findCollectionByNameOrId('perfis_psicologos')

      collection = new Collection({
        name: 'sugestoes_ia_prontuario',
        type: 'base',
        listRule: "@request.auth.id != '' && psicologo_id.user_id = @request.auth.id",
        viewRule: "@request.auth.id != '' && psicologo_id.user_id = @request.auth.id",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != '' && psicologo_id.user_id = @request.auth.id",
        deleteRule: "@request.auth.id != '' && psicologo_id.user_id = @request.auth.id",
        fields: [
          {
            name: 'prontuario_id',
            type: 'relation',
            required: true,
            collectionId: prontuariosCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'psicologo_id',
            type: 'relation',
            required: true,
            collectionId: psicologosCol.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'texto_original', type: 'text', required: true },
          { name: 'resumo_sugerido', type: 'text', required: true },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['pendente', 'aprovado', 'descartado'],
            maxSelect: 1,
          },
          { name: 'data_sugestao', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(collection)
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('sugestoes_ia_prontuario')
      app.delete(collection)
    } catch (_) {}
  },
)
