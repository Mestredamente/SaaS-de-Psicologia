onRecordAfterCreateSuccess((e) => {
  const email = e.record.getString('email')
  if (!email) {
    $app
      .logger()
      .warn('Paciente criado sem email, pulando criacao de usuario', 'paciente_id', e.record.id)
    return e.next()
  }

  let userId = ''
  try {
    // Tenta encontrar um usuário existente
    const user = $app.findAuthRecordByEmail('users', email)
    userId = user.id
  } catch (_) {
    // Cria um novo usuário automaticamente
    try {
      const users = $app.findCollectionByNameOrId('users')
      const newUser = new Record(users)
      newUser.setEmail(email)
      newUser.setPassword('Paciente@123')
      newUser.set('role', 'paciente')
      newUser.set('status', 'ativo')
      newUser.set('nome_completo', e.record.getString('nome_completo'))
      newUser.setVerified(true)

      $app.save(newUser)
      userId = newUser.id
      $app
        .logger()
        .info(
          'Usuario de paciente criado com sucesso',
          'user_id',
          userId,
          'paciente_id',
          e.record.id,
        )
    } catch (err) {
      $app
        .logger()
        .error(
          'Erro ao criar usuario para paciente',
          'erro',
          err.message,
          'paciente_id',
          e.record.id,
        )
    }
  }

  // Vincula o usuário recém-criado/encontrado ao paciente
  if (userId && e.record.getString('user_id') !== userId) {
    try {
      const paciente = $app.findRecordById('pacientes', e.record.id)
      paciente.set('user_id', userId)
      $app.saveNoValidate(paciente)
    } catch (err) {
      $app
        .logger()
        .error(
          'Erro ao vincular user_id ao paciente',
          'erro',
          err.message,
          'paciente_id',
          e.record.id,
        )
    }
  }

  return e.next()
}, 'pacientes')
