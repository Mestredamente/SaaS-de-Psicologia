onRecordCreateRequest((e) => {
  if (e.auth && e.auth.getString('role') === 'psicologo') {
    try {
      const perfil = $app.findFirstRecordByData('perfis_psicologos', 'user_id', e.auth.id)
      if (perfil) {
        e.record.set('psicologo_id', perfil.id)
      }
    } catch (_) {
      // Ignorar se o perfil não for encontrado, pois a validação cuidará disso se for obrigatório
    }
  }
  return e.next()
}, 'pacientes')
