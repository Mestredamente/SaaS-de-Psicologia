migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const roleField = users.fields.getByName('role')
    if (!roleField.values.includes('funcionario')) {
      roleField.values.push('funcionario')
      app.save(users)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const roleField = users.fields.getByName('role')
    roleField.values = roleField.values.filter((v) => v !== 'funcionario')
    app.save(users)
  },
)
