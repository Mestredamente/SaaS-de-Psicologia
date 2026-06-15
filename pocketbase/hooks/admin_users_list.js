routerAdd(
  'GET',
  '/backend/v1/admin/users_list',
  (e) => {
    const admin = e.auth
    if (!admin || admin.getString('role') !== 'admin') {
      return e.forbiddenError('Acesso negado')
    }
    const role = e.request.url.query().get('role')
    let filter = ''
    if (role) {
      filter = `role = '${role.replace(/'/g, "''")}'`
    }

    const result = $app.findRecordsByFilter('users', filter, '-created', 1000, 0)
    const items = result.map((r) => {
      return {
        id: r.id,
        email: r.email,
        name: r.getString('name'),
        nome_completo: r.getString('nome_completo'),
        role: r.getString('role'),
        status: r.getString('status'),
      }
    })

    return e.json(200, { items })
  },
  $apis.requireAuth(),
)
