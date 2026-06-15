export function generateContratoSaasHTML({
  contratanteNome,
  planoNome,
  valorMensal,
  dataInicio,
  dataVencimento,
}: {
  contratanteNome: string
  planoNome: string
  valorMensal: number
  dataInicio: string
  dataVencimento: string
}) {
  const formatData = (d: string) => {
    const [year, month, day] = d.split('-')
    return `${day}/${month}/${year}`
  }
  const valor = Number(valorMensal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; color: #333; text-align: justify;">
      <h2 style="text-align: center; text-transform: uppercase;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS SAAS</h2>
      <br/>
      <p><strong>CONTRATADA:</strong> Skip Plataforma de Gestão, CNPJ 00.000.000/0001-00, com sede em São Paulo/SP.</p>
      <p><strong>CONTRATANTE:</strong> ${contratanteNome}, doravante denominado(a) CONTRATANTE.</p>
      <br/>
      <h3>1. OBJETO DO SERVIÇO SAAS</h3>
      <p>O presente contrato tem por objeto a licença de uso da plataforma SaaS de gestão de clínicas e psicólogos, disponibilizada via web, desenvolvida e mantida pela CONTRATADA.</p>
      <h3>2. PLANO CONTRATADO E LIMITES</h3>
      <p>Fica acordado o uso do plano <strong>${planoNome}</strong>, estando a CONTRATANTE sujeita aos limites de usuários e recursos estabelecidos nas diretrizes oficiais e descrições do plano na plataforma.</p>
      <h3>3. VALOR MENSAL E FORMA DE PAGAMENTO</h3>
      <p>Pela licença de uso, a CONTRATANTE pagará o valor mensal de <strong>${valor}</strong>. O pagamento deverá ser efetuado até a data de vencimento correspondente, via cartão de crédito ou boleto bancário.</p>
      <h3>4. PRAZO DE VIGÊNCIA E RENOVAÇÃO</h3>
      <p>O contrato é válido do dia ${formatData(dataInicio)} até ${formatData(dataVencimento)}, podendo ser renovado automaticamente por períodos iguais, mediante o pagamento das faturas subsequentes.</p>
      <h3>5. RESCISÃO E REEMBOLSO</h3>
      <p>O presente contrato poderá ser rescindido a qualquer momento por qualquer das partes, sem a incidência de multas rescisórias. Não haverá, entretanto, reembolso de valores proporcionais em caso de cancelamento após o faturamento do ciclo ativo.</p>
      <h3>6. SIGILO E PROTEÇÃO DE DADOS (LGPD)</h3>
      <p>A CONTRATADA compromete-se a manter sigilo absoluto sobre os dados de pacientes, profissionais e prontuários armazenados, atuando estritamente como operadora de dados conforme as diretrizes da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).</p>
      <h3>7. RESPONSABILIDADES DA PLATAFORMA E DO CONTRATANTE</h3>
      <p>A CONTRATADA garante uma disponibilidade (SLA) de 99.9%, exceto em períodos de manutenção programada. A CONTRATANTE é a única responsável pela veracidade e legalidade das informações inseridas na plataforma.</p>
      <h3>8. PROPRIEDADE INTELECTUAL E LIMITAÇÃO DE RESPONSABILIDADE</h3>
      <p>Todos os direitos autorais e de propriedade intelectual da plataforma pertencem exclusivamente à CONTRATADA. A CONTRATADA não se responsabiliza por lucros cessantes, perdas de dados decorrentes de mau uso ou danos indiretos.</p>
      <h3>9. FORO E LEI APLICÁVEL</h3>
      <p>Elege-se o foro da comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas deste instrumento, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
      <br/><br/><br/>
      <p style="text-align: center;">____________________________________________________</p>
      <p style="text-align: center;"><strong>Skip Plataforma de Gestão</strong></p>
      <br/><br/>
      <p style="text-align: center;">____________________________________________________</p>
      <p style="text-align: center;"><strong>${contratanteNome}</strong></p>
    </div>
  `
}
