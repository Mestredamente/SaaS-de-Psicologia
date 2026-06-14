/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let psicologos = []
  try {
    psicologos = app.findRecordsByFilter('perfis_psicologos', '1=1', '', 1, 0)
  } catch (_) {}

  if (!psicologos || psicologos.length === 0) return
  const psicologo = psicologos[0]

  let pacientes = []
  try {
    pacientes = app.findRecordsByFilter('pacientes', `psicologo_id = '${psicologo.id}'`, '', 1, 0)
  } catch (_) {}

  if (!pacientes || pacientes.length === 0) return
  const paciente = pacientes[0]

  try {
    app.findFirstRecordByData('prontuarios', 'paciente_id', paciente.id)
  } catch (_) {
    const col = app.findCollectionByNameOrId('prontuarios')
    const record = new Record(col)
    record.set('psicologo_id', psicologo.id)
    record.set('paciente_id', paciente.id)
    record.set(
      'conteudo',
      'Paciente relatou episódios de ansiedade durante a semana, principalmente no trabalho. Fizemos exercícios de respiração e discutimos estratégias de enfrentamento. Ele se sentiu mais calmo ao final da sessão.',
    )
    app.save(record)
  }
})
