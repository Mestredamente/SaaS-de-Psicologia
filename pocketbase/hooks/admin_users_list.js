routerAdd(
  'GET',
  '/backend/v1/admin/users_list',
  (e) => {
    const adminId = e.auth?.id
    if (!adminId || e.auth?.role !== 'admin') {
      return e.forbiddenError('Acesso negado.')
    }

    const role = e.request.url.query().get('role')
    if (!role || role === 'admin') {
      return e.badRequestError('Role inválida.')
    }

    const users = $app.findRecordsByFilter('users', 'role = {:role}', '-created', 100, 0, {
      role: role,
    })

    const items = users.map((u) => ({
      id: u.id,
      email: u.getString('email'),
      name: u.getString('name'),
      nome_completo: u.getString('nome_completo'),
      role: u.getString('role'),
      status: u.getString('status'),
    }))

    return e.json(200, { items })
  },
  $apis.requireAuth(),
)
