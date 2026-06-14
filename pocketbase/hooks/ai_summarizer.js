routerAdd(
  'POST',
  '/backend/v1/prontuarios/summarize',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.texto?.trim()) return e.badRequestError('texto is required')

      const result = $ai.agent('clinical-summarizer').chat({
        user_id: userId,
        message: `Por favor, resuma as seguintes anotações da sessão de forma estruturada. Retorne apenas o resumo sem introduções.\n\nAnotações:\n${body.texto}`,
      })

      return e.json(200, {
        resumo: result.content,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporarily unavailable' })
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'agent request failed' : err.message })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, { error: status >= 500 ? 'AI temporarily unavailable' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
