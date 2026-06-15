migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')
    if (roleField && roleField.values) {
      if (!roleField.values.includes('admin')) {
        roleField.values.push('admin')
        app.save(users)
      }
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')
    if (roleField && roleField.values) {
      roleField.values = roleField.values.filter((v) => v !== 'admin')
      app.save(users)
    }
  },
)
