migrate(
  (app) => {
    const pacientes = app.findRecordsByFilter(
      'pacientes',
      "user_id = '' && email != ''",
      '',
      10000,
      0,
    )

    for (const p of pacientes) {
      const email = p.getString('email')
      let userId = ''

      try {
        const u = app.findAuthRecordByEmail('users', email)
        userId = u.id
      } catch (_) {
        try {
          const users = app.findCollectionByNameOrId('users')
          const newUser = new Record(users)
          newUser.setEmail(email)
          newUser.setPassword('Paciente@123')
          newUser.set('role', 'paciente')
          newUser.set('status', 'ativo')
          newUser.set('nome_completo', p.getString('nome_completo'))
          newUser.setVerified(true)
          app.save(newUser)
          userId = newUser.id
        } catch (err) {
          console.log('Erro ao criar usuario para o paciente: ' + p.id, err)
          continue
        }
      }

      if (userId) {
        try {
          p.set('user_id', userId)
          app.saveNoValidate(p)
        } catch (err) {
          console.log('Erro ao vincular paciente com usuario: ' + p.id, err)
        }
      }
    }
  },
  (app) => {
    // Revert not applicable, os dados atualizados serão mantidos
  },
)
