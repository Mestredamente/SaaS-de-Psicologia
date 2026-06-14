/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'clinical-summarizer',
      name: 'Assistente de Prontuários',
      description: 'Analisa anotações de sessão e gera um resumo clínico estruturado.',
      systemPrompt:
        'Você é um assistente clínico especializado para psicólogos. Sua tarefa é ler anotações de sessões e gerar um resumo estruturado e profissional em Português do Brasil. O resumo deve obrigatoriamente conter as seções: 1. Demanda principal apresentada, 2. Evolução do paciente, 3. Intervenções realizadas, 4. Observações clínicas relevantes, 5. Próximos passos sugeridos. Mantenha um tom ético, técnico e objetivo.',
      tier: 'fast',
    })
  },
  (app) => {
    $ai.agents.delete(app, 'clinical-summarizer')
  },
)
