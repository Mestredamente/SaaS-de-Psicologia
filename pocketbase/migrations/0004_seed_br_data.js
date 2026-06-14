migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('mestredamente1@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Dra. Ana')
      app.save(user)
    }

    const perfis = app.findCollectionByNameOrId('perfis_psicologos')
    let perfil
    try {
      perfil = app.findFirstRecordByData('perfis_psicologos', 'email', 'mestredamente1@gmail.com')
    } catch (_) {
      perfil = new Record(perfis)
      perfil.set('user_id', user.id)
      perfil.set('nome_completo', 'Dra. Ana Silva')
      perfil.set('email', 'mestredamente1@gmail.com')
      perfil.set('crp', '06/123456')
      perfil.set('telefone', '11999999999')
      perfil.set('especialidade', 'Terapia Cognitivo-Comportamental')
      app.save(perfil)
    }

    const pacientesCol = app.findCollectionByNameOrId('pacientes')
    const pacientesCount = app.countRecords('pacientes')
    if (pacientesCount === 0) {
      const nomes = [
        'João Pedro',
        'Maria Clara',
        'José Silva',
        'Ana Beatriz',
        'Lucas Pereira',
        'Juliana Lima',
        'Marcos Santos',
        'Fernanda Oliveira',
      ]
      const pIds = []
      for (let i = 0; i < nomes.length; i++) {
        const p = new Record(pacientesCol)
        p.set('nome_completo', nomes[i])
        p.set('email', `paciente${i}@teste.com`)
        p.set('telefone', '11988888888')
        p.set('psicologo_id', perfil.id)
        p.set('status', i < 6 ? 'ativo' : 'inativo')
        app.save(p)
        pIds.push(p.id)
      }

      const atendimentosCol = app.findCollectionByNameOrId('atendimentos')
      const now = new Date()
      function fmtDate(d) {
        return d.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
      }

      let todayCount = 0
      for (let i = 0; i < 12; i++) {
        const a = new Record(atendimentosCol)
        a.set('paciente_id', pIds[i % pIds.length])
        a.set('psicologo_id', perfil.id)
        a.set('tipo', i % 2 === 0 ? 'online' : 'presencial')
        a.set('valor', 200)

        let d = new Date(now)
        if (todayCount < 4) {
          d.setHours(9 + todayCount * 2, 0, 0, 0)
          a.set('status', 'agendado')
          todayCount++
        } else {
          const offset = (i % 7) - 3
          d.setDate(d.getDate() + (offset === 0 ? -1 : offset))
          d.setHours(10 + (i % 5), 0, 0, 0)
          a.set('status', offset < 0 ? 'realizado' : 'agendado')
        }
        a.set('data_hora', fmtDate(d))
        app.save(a)
      }
    }
  },
  (app) => {},
)
