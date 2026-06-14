migrate(
  (app) => {
    const clinicas = new Collection({
      name: 'clinicas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome_fantasia', type: 'text', required: true },
        { name: 'razao_social', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'telefone', type: 'text' },
        { name: 'endereco', type: 'text' },
        { name: 'cidade', type: 'text' },
        { name: 'estado', type: 'text' },
        { name: 'cep', type: 'text' },
        { name: 'status', type: 'select', values: ['ativo', 'inativo'], required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(clinicas)

    const psicologos_clinica = new Collection({
      name: 'psicologos_clinica',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'clinica_id',
          type: 'relation',
          required: true,
          collectionId: clinicas.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'psicologo_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('perfis_psicologos').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'status', type: 'select', values: ['ativo', 'inativo'], required: true },
        { name: 'data_vinculo', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(psicologos_clinica)

    // Seed Data
    const clinicaRecord = new Record(clinicas)
    clinicaRecord.set('nome_fantasia', 'Clínica Mente Sã')
    clinicaRecord.set('cnpj', '12.345.678/0001-90')
    clinicaRecord.set('status', 'ativo')
    app.save(clinicaRecord)

    // Create 3 psychologists
    const perfisCol = app.findCollectionByNameOrId('perfis_psicologos')
    const psi1 = new Record(perfisCol)
    psi1.set('nome_completo', 'Dra. Ana Silva')
    psi1.set('email', 'ana@mentesa.com')
    psi1.set('crp', '01/12345')
    psi1.set('especialidade', 'TCC')
    app.save(psi1)
    const psi2 = new Record(perfisCol)
    psi2.set('nome_completo', 'Dr. Carlos Mendes')
    psi2.set('email', 'carlos@mentesa.com')
    psi2.set('crp', '02/54321')
    psi2.set('especialidade', 'Psicanálise')
    app.save(psi2)
    const psi3 = new Record(perfisCol)
    psi3.set('nome_completo', 'Dra. Beatriz Santos')
    psi3.set('email', 'beatriz@mentesa.com')
    psi3.set('crp', '03/98765')
    psi3.set('especialidade', 'Gestalt')
    app.save(psi3)

    ;[psi1, psi2, psi3].forEach((psi) => {
      const vinculo = new Record(psicologos_clinica)
      vinculo.set('clinica_id', clinicaRecord.id)
      vinculo.set('psicologo_id', psi.id)
      vinculo.set('status', 'ativo')
      vinculo.set('data_vinculo', new Date().toISOString().replace('T', ' '))
      app.save(vinculo)
    })

    const pacientesCol = app.findCollectionByNameOrId('pacientes')
    const pac1 = new Record(pacientesCol)
    pac1.set('nome_completo', 'João Santos')
    pac1.set('psicologo_id', psi1.id)
    app.save(pac1)
    const pac2 = new Record(pacientesCol)
    pac2.set('nome_completo', 'Maria Oliveira')
    pac2.set('psicologo_id', psi2.id)
    app.save(pac2)

    const atendimentosCol = app.findCollectionByNameOrId('atendimentos')
    const today = new Date()

    for (let i = 0; i < 8; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const aten = new Record(atendimentosCol)
      aten.set('paciente_id', i % 2 === 0 ? pac1.id : pac2.id)
      aten.set('psicologo_id', i % 2 === 0 ? psi1.id : psi2.id)
      aten.set('data_hora', date.toISOString().replace('T', ' '))
      aten.set('tipo', i % 2 === 0 ? 'presencial' : 'online')
      aten.set('status', i === 0 ? 'realizado' : 'agendado')
      aten.set('valor', 150 + i * 10)
      app.save(aten)
    }
  },
  (app) => {
    try {
      const psicologos_clinica = app.findCollectionByNameOrId('psicologos_clinica')
      app.delete(psicologos_clinica)
    } catch (e) {}
    try {
      const clinicas = app.findCollectionByNameOrId('clinicas')
      app.delete(clinicas)
    } catch (e) {}
  },
)
