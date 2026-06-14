migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    let adminId = ''
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'mestredamente1@gmail.com')
      adminId = admin.id
    } catch (_) {
      const record = new Record(usersCol)
      record.setEmail('mestredamente1@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Dra. Ana')
      app.save(record)
      adminId = record.id
    }

    const patientsCol = app.findCollectionByNameOrId('patients')
    const appointmentsCol = app.findCollectionByNameOrId('appointments')

    // Helper to format date for PB
    function fmtDate(d) {
      return d.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
    }

    const now = new Date()

    // Seed patients if none exist
    const existingPatientsCount = app.countRecords('patients')
    if (existingPatientsCount === 0) {
      const ptNames = [
        'Carlos Silva',
        'Beatriz Oliveira',
        'João Souza',
        'Maria Costa',
        'Ana Lima',
        'Pedro Santos',
        'Fernanda Alves',
        'Lucas Pereira',
        'Juliana Rocha',
        'Rafael Mendes',
      ]

      const ptIds = []

      for (let i = 0; i < ptNames.length; i++) {
        const pt = new Record(patientsCol)
        pt.set('name', ptNames[i])
        pt.set('status', i < 8 ? 'ativo' : 'inativo') // 8 active, 2 inactive

        const lastSession = new Date(now)
        lastSession.setDate(lastSession.getDate() - Math.floor(Math.random() * 30))
        pt.set('last_session', fmtDate(lastSession))

        app.save(pt)
        ptIds.push(pt.id)
      }

      // Seed Appointments
      // We need 15 appointments, exactly 4 for "today"
      let todayCount = 0

      for (let i = 0; i < 15; i++) {
        const apt = new Record(appointmentsCol)
        apt.set('patient', ptIds[i % ptIds.length])

        let aptDate = new Date(now)
        if (todayCount < 4) {
          // Schedule for today
          aptDate.setHours(9 + todayCount * 2, 0, 0, 0) // 9:00, 11:00, 13:00, 15:00
          todayCount++
          apt.set('status', todayCount > 2 ? 'pendente' : 'confirmado')
        } else {
          // Schedule for other days (past and future in current week)
          const dayOffset = (i % 7) - 3 // -3 to +3 days
          aptDate.setDate(aptDate.getDate() + (dayOffset === 0 ? 1 : dayOffset))
          aptDate.setHours(10 + (i % 6), 0, 0, 0)

          if (dayOffset < 0) {
            apt.set('status', 'concluido')
          } else {
            apt.set('status', i % 2 === 0 ? 'confirmado' : 'pendente')
          }
        }

        apt.set('date_time', fmtDate(aptDate))
        apt.set('type', i % 3 === 0 ? 'online' : 'presencial')
        apt.set('fee', 250.0) // R$ 250 per session

        app.save(apt)
      }
    }
  },
  (app) => {
    // Usually we don't need a heavy down migration for seed data unless specifically requested
  },
)
