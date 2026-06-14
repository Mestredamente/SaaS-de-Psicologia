migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['psicologo', 'paciente', 'clinica'],
          maxSelect: 1,
        }),
      )
    }

    if (!users.fields.getByName('nome_completo')) {
      users.fields.add(
        new TextField({
          name: 'nome_completo',
        }),
      )
    }

    if (!users.fields.getByName('status')) {
      users.fields.add(
        new SelectField({
          name: 'status',
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        }),
      )
    }

    app.save(users)

    const seedUser = (email, role, name) => {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('role', role)
        record.set('nome_completo', name)
        record.set('status', 'ativo')
        app.save(record)
      }
    }

    seedUser('ana@psicologa.com', 'psicologo', 'Dra. Ana')
    seedUser('maria@email.com', 'paciente', 'Maria Silva')
    seedUser('clinica@mente.com', 'clinica', 'Clínica Mente Sã')
  },
  (app) => {
    // Down migration deliberately left empty for safe reverting.
  },
)
