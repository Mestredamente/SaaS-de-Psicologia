routerAdd(
  'POST',
  '/backend/v1/ai/summarize-prontuario',
  (e) => {
    const body = e.requestInfo().body || {}
    const texto = body.texto
    if (!texto) return e.badRequestError("O campo 'texto' é obrigatório.")

    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária.')

    try {
      const result = $ai.agent('clinical-summarizer').chat({
        user_id: userId,
        message: 'Por favor, estruture e resuma as seguintes anotações da sessão:\n\n' + texto,
      })

      return e.json(200, { resumo: result.content })
    } catch (err) {
      if (err.name === 'SkipAiConfigError') {
        return e.json(503, { error: 'AI temporariamente indisponível.' })
      }
      if (err.name === 'SkipAiAgentsError') {
        const status = err.status || 500
        return e.json(status, {
          error: status >= 500 ? 'Falha na requisição ao agente.' : err.message,
        })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
