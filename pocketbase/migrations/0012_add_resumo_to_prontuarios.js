/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('prontuarios')
    if (!col.fields.getByName('resumo')) {
      col.fields.add(new EditorField({ name: 'resumo', required: false }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('prontuarios')
    col.fields.removeByName('resumo')
    app.save(col)
  },
)
