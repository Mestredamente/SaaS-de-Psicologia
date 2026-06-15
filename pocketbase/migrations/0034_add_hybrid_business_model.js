migrate(
  (app) => {
    const perfis = app.findCollectionByNameOrId('perfis_psicologos')
    perfis.fields.add(
      new RelationField({
        name: 'clinica_id',
        collectionId: app.findCollectionByNameOrId('clinicas').id,
        cascadeDelete: false,
        maxSelect: 1,
      }),
    )
    app.save(perfis)

    const assinaturas = app.findCollectionByNameOrId('assinaturas')
    assinaturas.fields.add(
      new SelectField({
        name: 'modo_contratacao',
        values: ['autonomo', 'clinica'],
        maxSelect: 1,
      }),
    )
    app.save(assinaturas)

    const tenants = app.findCollectionByNameOrId('tenants')
    tenants.fields.add(
      new SelectField({
        name: 'modo_contratacao',
        values: ['autonomo', 'clinica'],
        maxSelect: 1,
      }),
    )
    app.save(tenants)

    const planos = app.findCollectionByNameOrId('planos_assinatura')
    planos.fields.add(
      new SelectField({
        name: 'modo_contratacao',
        values: ['autonomo', 'clinica'],
        maxSelect: 1,
      }),
    )
    app.save(planos)
  },
  (app) => {
    const perfis = app.findCollectionByNameOrId('perfis_psicologos')
    perfis.fields.removeByName('clinica_id')
    app.save(perfis)

    const assinaturas = app.findCollectionByNameOrId('assinaturas')
    assinaturas.fields.removeByName('modo_contratacao')
    app.save(assinaturas)

    const tenants = app.findCollectionByNameOrId('tenants')
    tenants.fields.removeByName('modo_contratacao')
    app.save(tenants)

    const planos = app.findCollectionByNameOrId('planos_assinatura')
    planos.fields.removeByName('modo_contratacao')
    app.save(planos)
  },
)
