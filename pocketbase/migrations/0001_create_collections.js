migrate(
  (app) => {
    const patients = new Collection({
      name: 'patients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        },
        { name: 'last_session', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_patients_status ON patients (status)',
        'CREATE INDEX idx_patients_name ON patients (name)',
      ],
    })
    app.save(patients)

    const appointments = new Collection({
      name: 'appointments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: patients.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'date_time', type: 'date', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['presencial', 'online'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['confirmado', 'pendente', 'cancelado', 'concluido'],
          maxSelect: 1,
        },
        { name: 'fee', type: 'number', min: 0 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_appointments_date ON appointments (date_time)',
        'CREATE INDEX idx_appointments_status ON appointments (status)',
        'CREATE INDEX idx_appointments_patient ON appointments (patient)',
      ],
    })
    app.save(appointments)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('appointments'))
    app.delete(app.findCollectionByNameOrId('patients'))
  },
)
