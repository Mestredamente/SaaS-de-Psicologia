/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'clinical-summarizer',
      name: 'Assistente de Prontuários',
      description: 'Gera resumos clínicos estruturados a partir de anotações.',
      systemPrompt:
        'Você é um assistente clínico especializado para psicólogos. Sua tarefa é ler anotações de sessões e gerar um resumo estruturado e profissional em Português do Brasil. O resumo deve obrigatoriamente conter as seções:\n1. Demanda principal apresentada\n2. Evolução do paciente\n3. Intervenções realizadas\n4. Observações clínicas relevantes\n5. Próximos passos sugeridos\n\nMantenha um tom ético, técnico e objetivo. Retorne apenas o resumo formatado.',
      tier: 'fast',
    })
  },
  (app) => {
    $ai.agents.delete(app, 'clinical-summarizer')
  },
)
