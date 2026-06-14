migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('prontuarios')
    if (!col.fields.getByName('resumo')) {
      col.fields.add(new EditorField({ name: 'resumo' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('prontuarios')
    if (col.fields.getByName('resumo')) {
      col.fields.removeByName('resumo')
    }
    app.save(col)
  },
)
