migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter('planos_assinatura', '1=1', '', 100, 0)
      for (const record of records) {
        const nome = record.getString('nome').toLowerCase()
        if (nome.includes('clínica') || nome.includes('clinica')) {
          record.set('modo_contratacao', 'clinica')
        } else {
          record.set('modo_contratacao', 'autonomo')
        }
        app.save(record)
      }
    } catch (e) {
      // skip if no records
    }
  },
  (app) => {},
)
