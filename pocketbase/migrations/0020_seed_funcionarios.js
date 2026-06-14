migrate(
  (app) => {
    let clinica
    try {
      clinica = app.findFirstRecordByData('clinicas', 'nome_fantasia', 'Mente Sã')
    } catch (_) {
      const clinicasCol = app.findCollectionByNameOrId('clinicas')
      clinica = new Record(clinicasCol)
      clinica.set('nome_fantasia', 'Mente Sã')
      clinica.set('status', 'ativo')
      app.save(clinica)
    }

    const usersCol = app.findCollectionByNameOrId('users')
    const funcionariosCol = app.findCollectionByNameOrId('funcionarios')

    try {
      app.findAuthRecordByEmail('users', 'fernanda@mentesa.com')
    } catch (_) {
      const u1 = new Record(usersCol)
      u1.setEmail('fernanda@mentesa.com')
      u1.setPassword('Skip@Pass')
      u1.setVerified(true)
      u1.set('nome_completo', 'Fernanda Souza')
      u1.set('role', 'funcionario')
      u1.set('status', 'ativo')
      app.save(u1)

      const f1 = new Record(funcionariosCol)
      f1.set('user_id', u1.id)
      f1.set('clinica_id', clinica.id)
      f1.set('nome_completo', 'Fernanda Souza')
      f1.set('email', 'fernanda@mentesa.com')
      f1.set('cargo', 'secretaria')
      f1.set('status', 'ativo')
      f1.set('permissao_agenda', true)
      f1.set('permissao_pacientes', true)
      f1.set('permissao_financeiro', false)
      f1.set('permissao_relatorios', false)
      app.save(f1)
    }

    try {
      app.findAuthRecordByEmail('users', 'carlos@mentesa.com')
    } catch (_) {
      const u2 = new Record(usersCol)
      u2.setEmail('carlos@mentesa.com')
      u2.setPassword('Skip@Pass')
      u2.setVerified(true)
      u2.set('nome_completo', 'Carlos Lima')
      u2.set('role', 'funcionario')
      u2.set('status', 'ativo')
      app.save(u2)

      const f2 = new Record(funcionariosCol)
      f2.set('user_id', u2.id)
      f2.set('clinica_id', clinica.id)
      f2.set('nome_completo', 'Carlos Lima')
      f2.set('email', 'carlos@mentesa.com')
      f2.set('cargo', 'administrativo')
      f2.set('status', 'ativo')
      f2.set('permissao_agenda', true)
      f2.set('permissao_pacientes', true)
      f2.set('permissao_financeiro', true)
      f2.set('permissao_relatorios', true)
      app.save(f2)
    }
  },
  (app) => {
    try {
      const u1 = app.findAuthRecordByEmail('users', 'fernanda@mentesa.com')
      app.delete(u1)
    } catch (_) {}
    try {
      const u2 = app.findAuthRecordByEmail('users', 'carlos@mentesa.com')
      app.delete(u2)
    } catch (_) {}
    try {
      const f1 = app.findFirstRecordByData('funcionarios', 'email', 'fernanda@mentesa.com')
      app.delete(f1)
    } catch (_) {}
    try {
      const f2 = app.findFirstRecordByData('funcionarios', 'email', 'carlos@mentesa.com')
      app.delete(f2)
    } catch (_) {}
  },
)
