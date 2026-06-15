migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('permissoes_menu')
    const menus = [
      // Admin
      { role: 'admin', item_menu: 'Dashboard', rota: '/admin' },
      { role: 'admin', item_menu: 'Planos', rota: '/admin/planos' },
      { role: 'admin', item_menu: 'Assinaturas', rota: '/admin/assinaturas' },
      { role: 'admin', item_menu: 'Contratos SaaS', rota: '/admin/contratos' },
      { role: 'admin', item_menu: 'Usuários', rota: '/admin/usuarios' },
      { role: 'admin', item_menu: 'Termos LGPD', rota: '/admin/termos' },
      { role: 'admin', item_menu: 'Auditoria', rota: '/admin/auditoria' },
      { role: 'admin', item_menu: 'Relatórios', rota: '/admin/relatorios' },
      { role: 'admin', item_menu: 'Configurações', rota: '/admin/configuracoes' },

      // Paciente
      { role: 'paciente', item_menu: 'Dashboard', rota: '/paciente' },
      { role: 'paciente', item_menu: 'Meu Perfil', rota: '/paciente/perfil' },
      { role: 'paciente', item_menu: 'Minha Agenda', rota: '/paciente/agenda' },
      { role: 'paciente', item_menu: 'Meu Prontuário', rota: '/paciente/prontuario' },
      { role: 'paciente', item_menu: 'Meu Diário', rota: '/paciente/diario' },
      { role: 'paciente', item_menu: 'Pagamentos', rota: '/paciente/pagamentos' },
      { role: 'paciente', item_menu: 'Sessões Online', rota: '/paciente/sessoes-online' },

      // Clinica
      { role: 'clinica', item_menu: 'Dashboard', rota: '/clinica' },
      { role: 'clinica', item_menu: 'Psicólogos', rota: '/clinica/psicologos' },
      { role: 'clinica', item_menu: 'Agenda da Clínica', rota: '/clinica/agenda' },
      { role: 'clinica', item_menu: 'Financeiro', rota: '/clinica/financeiro' },
      { role: 'clinica', item_menu: 'Relatórios', rota: '/clinica/relatorios' },
      { role: 'clinica', item_menu: 'Funcionários', rota: '/clinica/funcionarios' },
      { role: 'clinica', item_menu: 'Configurações', rota: '/clinica/configuracoes' },

      // Funcionario
      { role: 'funcionario', item_menu: 'Dashboard', rota: '/funcionario' },
      { role: 'funcionario', item_menu: 'Agenda da Clínica', rota: '/funcionario/agenda' },
      { role: 'funcionario', item_menu: 'Pacientes', rota: '/funcionario/pacientes' },
      {
        role: 'funcionario',
        item_menu: 'Financeiro',
        rota: '/funcionario/financeiro',
        requer_cargo: 'administrativo',
      },
      {
        role: 'funcionario',
        item_menu: 'Relatórios',
        rota: '/funcionario/relatorios',
        requer_cargo: 'administrativo',
      },
      { role: 'funcionario', item_menu: 'Funcionários', rota: '/funcionario/funcionarios' },
      { role: 'funcionario', item_menu: 'Configurações', rota: '/funcionario/configuracoes' },

      // Psicologo
      { role: 'psicologo', item_menu: 'Dashboard', rota: '/dashboard/psicologo/autonomo' },
      {
        role: 'psicologo',
        item_menu: 'Dashboard Vinculado',
        rota: '/dashboard/psicologo/vinculado',
      },
      { role: 'psicologo', item_menu: 'Agenda', rota: '/agenda' },
      { role: 'psicologo', item_menu: 'Pacientes', rota: '/pacientes' },
      { role: 'psicologo', item_menu: 'Prontuários', rota: '/prontuarios' },
      { role: 'psicologo', item_menu: 'Financeiro', rota: '/financeiro' },
      { role: 'psicologo', item_menu: 'Relatórios', rota: '/relatorios' },
      { role: 'psicologo', item_menu: 'Sessões Online', rota: '/sessoes-online' },
      { role: 'psicologo', item_menu: 'Contratos', rota: '/contratos-terapeuticos' },
      { role: 'psicologo', item_menu: 'Configurações', rota: '/configuracoes' },

      // Supervisor Area items
      { role: 'psicologo', item_menu: 'Dashboard Supervisor', rota: '/supervisor' },
      { role: 'psicologo', item_menu: 'Meus Supervisandos', rota: '/supervisor/supervisandos' },
      { role: 'psicologo', item_menu: 'Sessões', rota: '/supervisor/sessoes' },
      { role: 'psicologo', item_menu: 'Casos', rota: '/supervisor/casos' },
      { role: 'psicologo', item_menu: 'Relatórios', rota: '/supervisor/relatorios' },
      { role: 'psicologo', item_menu: 'Configurações', rota: '/supervisor/configuracoes' },
      { role: 'psicologo', item_menu: 'Minha Supervisão', rota: '/minha-supervisao' },
    ]

    for (const m of menus) {
      const record = new Record(col)
      record.set('role', m.role)
      record.set('item_menu', m.item_menu)
      record.set('rota', m.rota)
      if (m.requer_cargo) record.set('requer_cargo', m.requer_cargo)
      record.set('visivel', true)
      app.save(record)
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM permissoes_menu').execute()
  },
)
