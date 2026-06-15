migrate(
  (app) => {
    const termos = app.findCollectionByNameOrId('termos_consentimento')

    const seed = [
      {
        tipo: 'lgpd_geral',
        versao: '1.0',
        conteudo:
          '<h2>Termo Geral de Proteção de Dados (LGPD)</h2><p>Consentimento para o armazenamento seguro e processamento de informações necessárias para o vínculo terapêutico, conforme as exigências da Lei Geral de Proteção de Dados.</p>',
        status: 'ativo',
      },
      {
        tipo: 'tratamento_dados',
        versao: '1.0',
        conteudo:
          '<h2>Tratamento de Dados Sensíveis</h2><p>Autorização específica para a coleta e arquivamento de dados de saúde física, mental e emocional (prontuários e evoluções) de acordo com o Código de Ética do CFP.</p>',
        status: 'ativo',
      },
      {
        tipo: 'terapia_online',
        versao: '1.0',
        conteudo:
          '<h2>Consentimento para Terapia Online</h2><p>Ciência e aceitação dos riscos, benefícios e procedimentos de segurança inerentes ao atendimento psicológico mediado por tecnologias de informação e comunicação.</p>',
        status: 'ativo',
      },
      {
        tipo: 'menor_idade',
        versao: '1.0',
        conteudo:
          '<h2>Autorização de Responsável Legal</h2><p>Consentimento obrigatório do responsável legal para a prestação de serviços psicológicos ao menor de idade, garantindo sua privacidade restrita às normativas vigentes.</p>',
        status: 'ativo',
      },
    ]

    const now = new Date().toISOString()

    for (const t of seed) {
      try {
        app.findFirstRecordByData('termos_consentimento', 'tipo', t.tipo)
      } catch (_) {
        const record = new Record(termos)
        record.set('tipo', t.tipo)
        record.set('versao', t.versao)
        record.set('conteudo', t.conteudo)
        record.set('data_publicacao', now)
        record.set('status', t.status)
        app.save(record)
      }
    }
  },
  (app) => {
    // Safe to leave seed data down migration empty
  },
)
