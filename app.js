/**
 * app.js
 * Aplicação Principal do CampCalc
 */

(() => {
  'use strict';

  // Chaves para persistência no LocalStorage
  const STORAGE_CAMPINGS = 'campcalc_campings_v1';
  const STORAGE_ANOS = 'campcalc_anos_v1';
  const PAISES_FERIADOS = ['BR', 'PT', 'ES', 'FR', 'DE'];

  // Dados Iniciais Padrão (utilizados na primeira execução)
  const DADOS_INICIAIS_CAMPINGS = {
    versao: '1.0',
    perfis: [
      {
        id: 1,
        nome: 'Camping Recanto das Águas',
        default: true,
        frequencia: 50.00,
        energiaBaixa: 15.00,
        energiaAlta: 25.00,
        trimestre: 180.00,
        anuidade: 600.00,
        mensalidade: 70.00,
        diasSemanaPresenca: [5, 6, 0], // Sexta, Sábado e Domingo
        mesesIsencaoTaxas: [6, 7],     // Junho e Julho
        localidade: { enderecoCompleto: '', telefone: '', email: '', site: '', pais: 'BR' }
      },
      {
        id: 2,
        nome: 'Camping Vale Verde',
        default: false,
        frequencia: 35.00,
        energiaBaixa: 10.00,
        energiaAlta: 20.00,
        trimestre: 120.00,
        anuidade: 400.00,
        mensalidade: 50.00,
        diasSemanaPresenca: [5, 6, 0],
        mesesIsencaoTaxas: [],
        localidade: { enderecoCompleto: '', telefone: '', email: '', site: '', pais: 'BR' }
      }
    ]
  };

  const DADOS_INICIAIS_ANOS = {
    versao: '1.0',
    anos: {}
  };

  // Nomes dos Meses e Dias em Português
  const NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const NOMES_DIAS_SEMANA = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  // Estado da Aplicação
  const state = {
    campingsData: null,
    anosData: null,
    anoSelecionado: 2026,
    campingSelecionadoId: 1,
    campingEdicaoId: null, // ID do camping atualmente aberto no modal
    diaEdicaoISO: null,    // YYYY-MM-DD em edição no modal de dia
    diaEdicaoInfo: null
  };

  // Elementos do DOM
  const dom = {
    selectAno: document.getElementById('selectAno'),
    selectCamping: document.getElementById('selectCamping'),
    labelAnoAtual: document.getElementById('labelAnoAtual'),
    labelFeriadoNacional: document.getElementById('labelFeriadoNacional'),
    calendarGrid: document.getElementById('calendarGrid'),

    // Cards de Resumo
    statPresencaQtd: document.getElementById('statPresencaQtd'),
    statPresencaValor: document.getElementById('statPresencaValor'),
    statEnergiaQtd: document.getElementById('statEnergiaQtd'),
    statEnergiaValor: document.getElementById('statEnergiaValor'),
    statEnergiaBaixaDet: document.getElementById('statEnergiaBaixaDet'),
    statEnergiaAltaDet: document.getElementById('statEnergiaAltaDet'),
    taxaWinnerBadge: document.getElementById('taxaWinnerBadge'),
    statMelhorTaxaValor: document.getElementById('statMelhorTaxaValor'),
    statMelhorTaxaMensal: document.getElementById('statMelhorTaxaMensal'),
    statComparativoPlanos: document.getElementById('statComparativoPlanos'),
    statTotalGeral: document.getElementById('statTotalGeral'),
    statTotalGeralMediaMensal: document.getElementById('statTotalGeralMediaMensal'),
    statTotalGeralSub: document.getElementById('statTotalGeralSub'),
    statTotalGeralFooter: document.getElementById('statTotalGeralFooter'),

    // Modal de Camping
    btnOpenCampingModal: document.getElementById('btnOpenCampingModal'),
    btnCloseCampingModal: document.getElementById('btnCloseCampingModal'),
    modalCamping: document.getElementById('modalCamping'),
    campingTabsContainer: document.getElementById('campingTabsContainer'),
    inputCampingNome: document.getElementById('inputCampingNome'),
    inputCampingEndereco: document.getElementById('inputCampingEndereco'),
    inputCampingTelefone: document.getElementById('inputCampingTelefone'),
    inputCampingEmail: document.getElementById('inputCampingEmail'),
    inputCampingSite: document.getElementById('inputCampingSite'),
    selectCampingPais: document.getElementById('selectCampingPais'),
    inputCampingFrequencia: document.getElementById('inputCampingFrequencia'),
    inputCampingMensalidade: document.getElementById('inputCampingMensalidade'),
    inputCampingEnergiaBaixa: document.getElementById('inputCampingEnergiaBaixa'),
    inputCampingEnergiaAlta: document.getElementById('inputCampingEnergiaAlta'),
    inputCampingTrimestre: document.getElementById('inputCampingTrimestre'),
    inputCampingAnuidade: document.getElementById('inputCampingAnuidade'),
    chipsDiasSemana: document.getElementById('chipsDiasSemana'),
    chipsMesesIsencao: document.getElementById('chipsMesesIsencao'),
    checkCampingDefault: document.getElementById('checkCampingDefault'),
    btnSaveCamping: document.getElementById('btnSaveCamping'),
    btnDeleteCamping: document.getElementById('btnDeleteCamping'),
    btnExportCampings: document.getElementById('btnExportCampings'),
    btnImportCampingsTrigger: document.getElementById('btnImportCampingsTrigger'),
    inputImportCampings: document.getElementById('inputImportCampings'),

    // Modal de Personalização do Dia
    modalDia: document.getElementById('modalDia'),
    btnCloseDiaModal: document.getElementById('btnCloseDiaModal'),
    diaModalTitulo: document.getElementById('diaModalTitulo'),
    diaModalMeta: document.getElementById('diaModalMeta'),
    checkDiaFeriado: document.getElementById('checkDiaFeriado'),
    checkDiaPresenca: document.getElementById('checkDiaPresenca'),
    radioCardsEnergia: document.querySelectorAll('.radio-card'),
    labelPrecoEnergiaBaixa: document.getElementById('labelPrecoEnergiaBaixa'),
    labelPrecoEnergiaAlta: document.getElementById('labelPrecoEnergiaAlta'),
    inputDiaMotivo: document.getElementById('inputDiaMotivo'),
    btnSalvarDia: document.getElementById('btnSalvarDia'),
    btnRestaurarDiaPadrao: document.getElementById('btnRestaurarDiaPadrao'),

    // Import/Export do Ano
    btnExportAno: document.getElementById('btnExportAno'),
    btnImportAnoTrigger: document.getElementById('btnImportAnoTrigger'),
    inputImportAno: document.getElementById('inputImportAno'),

    // Toast
    toast: document.getElementById('toast')
  };

  /* ================= INICIALIZAÇÃO ================= */
  function init() {
    carregarStorage();
    definirCampingPadraoInicial();
    popularSelectAno();
    popularSelectCampings();
    registrarEventos();
    atualizarTudo();
  }

  function carregarStorage() {
    try {
      const rawCampings = localStorage.getItem(STORAGE_CAMPINGS);
      state.campingsData = rawCampings ? JSON.parse(rawCampings) : JSON.parse(JSON.stringify(DADOS_INICIAIS_CAMPINGS));
      state.campingsData.perfis.forEach(normalizarLocalidadeCamping);
    } catch (e) {
      console.error('Erro ao ler campings do localStorage:', e);
      state.campingsData = JSON.parse(JSON.stringify(DADOS_INICIAIS_CAMPINGS));
    }

    try {
      const rawAnos = localStorage.getItem(STORAGE_ANOS);
      state.anosData = rawAnos ? JSON.parse(rawAnos) : JSON.parse(JSON.stringify(DADOS_INICIAIS_ANOS));
      if (!state.anosData.anos) state.anosData.anos = {};
    } catch (e) {
      console.error('Erro ao ler anos do localStorage:', e);
      state.anosData = JSON.parse(JSON.stringify(DADOS_INICIAIS_ANOS));
    }
  }

  function normalizarLocalidadeCamping(perfil) {
    const localidade = perfil.localidade && typeof perfil.localidade === 'object' && !Array.isArray(perfil.localidade)
      ? perfil.localidade
      : {};

    perfil.localidade = {
      enderecoCompleto: typeof localidade.enderecoCompleto === 'string' ? localidade.enderecoCompleto : '',
      telefone: typeof localidade.telefone === 'string' ? localidade.telefone : '',
      email: typeof localidade.email === 'string' ? localidade.email : '',
      site: typeof localidade.site === 'string' ? localidade.site : '',
      pais: PAISES_FERIADOS.includes(localidade.pais) ? localidade.pais : 'BR'
    };
  }

  function salvarCampingsStorage() {
    localStorage.setItem(STORAGE_CAMPINGS, JSON.stringify(state.campingsData, null, 2));
  }

  function salvarAnosStorage() {
    localStorage.setItem(STORAGE_ANOS, JSON.stringify(state.anosData, null, 2));
  }

  function definirCampingPadraoInicial() {
    const padrao = state.campingsData.perfis.find(p => p.default === true);
    if (padrao) {
      state.campingSelecionadoId = padrao.id;
    } else if (state.campingsData.perfis.length > 0) {
      state.campingsData.perfis[0].default = true;
      state.campingSelecionadoId = state.campingsData.perfis[0].id;
      salvarCampingsStorage();
    }
  }

  function obterCampingAtual() {
    return state.campingsData.perfis.find(p => p.id === state.campingSelecionadoId) || state.campingsData.perfis[0];
  }

  function popularSelectAno() {
    dom.selectAno.value = state.anoSelecionado.toString();
  }

  function popularSelectCampings() {
    dom.selectCamping.innerHTML = '';
    state.campingsData.perfis.forEach(perfil => {
      const opt = document.createElement('option');
      opt.value = perfil.id;
      opt.textContent = `${perfil.nome}${perfil.default ? ' ★' : ''}`;
      if (perfil.id === state.campingSelecionadoId) {
        opt.selected = true;
      }
      dom.selectCamping.appendChild(opt);
    });
  }

  /* ================= ATUALIZAÇÃO DA TELA ================= */
  function atualizarTudo() {
    dom.labelAnoAtual.textContent = state.anoSelecionado;
    const camping = obterCampingAtual();
    const paisSelecionado = Array.from(dom.selectCampingPais.options)
      .find(option => option.value === camping.localidade.pais);
    dom.labelFeriadoNacional.textContent = `Feriado Nacional (${paisSelecionado.textContent})`;
    const dadosCalculados = calcularMetricasAno(state.anoSelecionado, camping);

    renderizarResumo(dadosCalculados, camping);
    renderizarCalendario(state.anoSelecionado, camping, dadosCalculados.diasMap);
  }

  /* ================= MOTOR DE CÁLCULO ================= */
  function calcularMetricasAno(ano, camping) {
    const feriados = FeriadosUtil.obterFeriadosAno(ano, camping.localidade.pais);
    const anoExcecoes = (state.anosData.anos[ano] && state.anosData.anos[ano].excecoes) ? state.anosData.anos[ano].excecoes : {};
    const mesesIsentos = Array.isArray(camping.mesesIsencaoTaxas)
      ? [...new Set(camping.mesesIsencaoTaxas.filter(mes =>
        Number.isInteger(mes) && mes >= 1 && mes <= 12
      ))]
      : [];
    const mesesIsentosSet = new Set(mesesIsentos);

    let totalPresenca = 0;
    let totalEnergiaBaixa = 0;
    let totalEnergiaAlta = 0;
    const diasMap = {};

    const primeiroDia = new Date(ano, 0, 1);
    const ultimoDia = new Date(ano, 11, 31);
    const cursor = new Date(primeiroDia.getTime());

    while (cursor <= ultimoDia) {
      const iso = FeriadosUtil.formatarISO(cursor);
      const diaSemana = cursor.getDay();
      const mesIsentoTaxas = mesesIsentosSet.has(cursor.getMonth() + 1);
      const excecao = anoExcecoes[iso];
      const feriadoNacional = Boolean(feriados[iso]);
      const isFeriado = excecao && typeof excecao.isFeriado === 'boolean'
        ? excecao.isFeriado
        : feriadoNacional;
      const nomeFeriado = isFeriado
        ? (feriados[iso] || (excecao && excecao.nomeFeriado) || 'Feriado personalizado')
        : '';

      // Regra Padrão:
      // Se for feriado: presença ativa e energia alta
      // Se for dia marcado na semana do camping: presença ativa e energia baixa
      // Senão: presença inativa e sem energia
      let presenca = false;
      let energia = 'nenhuma';

      if (isFeriado) {
        presenca = true;
        energia = 'alta';
      } else if (camping.diasSemanaPresenca.includes(diaSemana)) {
        presenca = true;
        energia = 'baixa';
      }

      // Verifica se há exceção manual gravada
      let hasCustomOverride = false;
      let motivo = '';
      if (excecao) {
        hasCustomOverride = true;
        if (typeof excecao.presenca === 'boolean') presenca = excecao.presenca;
        if (typeof excecao.energia === 'string') energia = excecao.energia;
        motivo = excecao.motivo || '';
      }

      if (presenca && !isFeriado && !mesIsentoTaxas) totalPresenca++;
      if (energia === 'baixa' && !presenca) totalEnergiaBaixa++;
      if (energia === 'alta') totalEnergiaAlta++;

      diasMap[iso] = {
        dataISO: iso,
        dataObj: new Date(cursor.getTime()),
        diaDoMes: cursor.getDate(),
        mes: cursor.getMonth(),
        mesIsentoTaxas,
        diaSemana,
        feriadoNacional,
        isFeriado,
        nomeFeriado,
        presenca,
        energia,
        hasCustomOverride,
        motivo
      };

      cursor.setDate(cursor.getDate() + 1);
    }

    // Cálculos Financeiros
    // Feriados não geram diária; nos demais dias, a diária de presença inclui energia baixa.
    const custoPresenca = totalPresenca * (camping.frequencia || 0);

    // Energia baixa só é cobrada sem presença; energia alta é sempre cobrada.
    const custoEnergiaBaixa = totalEnergiaBaixa * (camping.energiaBaixa || 0);
    const custoEnergiaAlta = totalEnergiaAlta * (camping.energiaAlta || 0);
    const custoEnergia = custoEnergiaBaixa + custoEnergiaAlta;

    // 3. Comparativo de Taxas: Mensalidade vs Trimestre vs Anuidade
    const opcoesTaxa = [];

    if (camping.mensalidade > 0) {
      const valorMensal = camping.mensalidade;
      const valorAnual = valorMensal * 12;
      opcoesTaxa.push({
        id: 'mensalidade',
        nome: 'Mensalidade',
        rotulo: 'Mensal',
        icone: '📆',
        valorMensal,
        valorAnual,
        valorTotal: valorAnual,
        detalhe: `${formatarMoeda(valorAnual)} ao ano · ${formatarMoeda(valorMensal)} por mês`
      });
    }

    if (camping.trimestre > 0) {
      const valorMensal = camping.trimestre / 3;
      const valorAnual = camping.trimestre * 4;
      opcoesTaxa.push({
        id: 'trimestre',
        nome: 'Trimestral',
        rotulo: 'Trimestral',
        icone: '📑',
        valorMensal,
        valorAnual,
        valorTotal: valorAnual,
        detalhe: `${formatarMoeda(valorAnual)} ao ano · ${formatarMoeda(valorMensal)} por mês`
      });
    }

    if (camping.anuidade > 0) {
      const valorMensal = camping.anuidade / 12;
      const valorAnual = camping.anuidade;
      opcoesTaxa.push({
        id: 'anuidade',
        nome: 'Anuidade',
        rotulo: 'Anual',
        icone: '🏷️',
        valorMensal,
        valorAnual,
        valorTotal: valorAnual,
        detalhe: `${formatarMoeda(valorAnual)} ao ano · ${formatarMoeda(valorMensal)} por mês`
      });
    }

    // Seleciona a opção de MENOR VALOR (melhor custo para o usuário)
    let melhorTaxa = null;
    if (opcoesTaxa.length > 0) {
      melhorTaxa = opcoesTaxa.reduce((menor, atual) => {
        return atual.valorTotal < menor.valorTotal ? atual : menor;
      }, opcoesTaxa[0]);
    } else {
      melhorTaxa = {
        id: 'nenhuma',
        nome: 'Sem taxas fixas',
        rotulo: 'Sem taxas',
        icone: '⚪',
        valorTotal: 0,
        valorAnual: 0,
        valorMensal: 0,
        detalhe: 'R$ 0,00'
      };
    }

    // O menor valor é aplicado no cálculo do total anual
    const custoTaxaFixaAplicada = melhorTaxa.valorTotal;
    const totalGeral = custoPresenca + custoEnergia + custoTaxaFixaAplicada;

    return {
      totalPresenca,
      custoPresenca,
      totalEnergiaBaixa,
      totalEnergiaAlta,
      custoEnergiaBaixa,
      custoEnergiaAlta,
      custoEnergia,
      opcoesTaxa,
      melhorTaxa,
      custoTaxaFixaAplicada,
      totalGeral,
      diasMap
    };
  }

  function formatarMoeda(val) {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /* ================= RENDERIZAR RESUMO ================= */
  function renderizarResumo(metricas, camping) {
    // 1. Presença (Diárias)
    dom.statPresencaQtd.textContent = `${metricas.totalPresenca} diárias`;
    dom.statPresencaValor.textContent = `${formatarMoeda(metricas.custoPresenca)} total (${formatarMoeda(camping.frequencia)}/dia; inclui energia baixa)`;

    // 2. Energia
    const totalDiasEnergia = metricas.totalEnergiaBaixa + metricas.totalEnergiaAlta;
    dom.statEnergiaQtd.textContent = `${totalDiasEnergia} dias com cobrança`;
    dom.statEnergiaBaixaDet.textContent = `Baixa: ${metricas.totalEnergiaBaixa} dias × ${formatarMoeda(camping.energiaBaixa)} = ${formatarMoeda(metricas.custoEnergiaBaixa)}`;
    dom.statEnergiaAltaDet.textContent = `Alta: ${metricas.totalEnergiaAlta} dias × ${formatarMoeda(camping.energiaAlta)} = ${formatarMoeda(metricas.custoEnergiaAlta)}`;
    dom.statEnergiaValor.textContent = `Total: ${formatarMoeda(metricas.custoEnergia)}`;

    // 3. Melhor Taxa (Menor Valor Aplicado)
    dom.taxaWinnerBadge.textContent = `🏆 ${metricas.melhorTaxa.nome} (Melhor Opção)`;
    dom.statMelhorTaxaValor.textContent = formatarMoeda(metricas.melhorTaxa.valorAnual);
    dom.statMelhorTaxaMensal.textContent = `${formatarMoeda(metricas.melhorTaxa.valorMensal)} por mês`;

    // Comparativo visual de todos os planos
    dom.statComparativoPlanos.innerHTML = '';
    metricas.opcoesTaxa.forEach(opcao => {
      const row = document.createElement('div');
      row.className = `plan-row ${opcao.id === metricas.melhorTaxa.id ? 'winner' : ''}`;

      const label = document.createElement('span');
      label.textContent = `${opcao.icone} ${opcao.rotulo}:`;

      const val = document.createElement('span');
      val.textContent = `${formatarMoeda(opcao.valorAnual)}/ano · ${formatarMoeda(opcao.valorMensal)}/mês${opcao.id === metricas.melhorTaxa.id ? ' ★' : ''}`;

      row.appendChild(label);
      row.appendChild(val);
      dom.statComparativoPlanos.appendChild(row);
    });

    // 4. Total Geral Anual (Diárias + Energia + Menor Taxa Fixa)
    dom.statTotalGeral.textContent = formatarMoeda(metricas.totalGeral);
    dom.statTotalGeralMediaMensal.textContent = `Média mensal: ${formatarMoeda(metricas.totalGeral / 12)}`;
    dom.statTotalGeralSub.textContent = `${formatarMoeda(metricas.custoPresenca)} (diárias) + ${formatarMoeda(metricas.custoEnergia)} (energia) + ${formatarMoeda(metricas.custoTaxaFixaAplicada)} (${metricas.melhorTaxa.nome.toLowerCase()})`;
    renderizarRodapeCamping(camping);
  }

  function renderizarRodapeCamping(camping) {
    const footer = dom.statTotalGeralFooter;
    footer.innerHTML = '';

    const nome = document.createElement('strong');
    nome.className = 'total-card-camping-name';
    nome.textContent = camping.nome;
    footer.appendChild(nome);

    const links = document.createElement('div');
    links.className = 'total-card-links';

    function adicionarLink(rotulo, href, abrirNovaAba) {
      const link = document.createElement('a');
      link.textContent = rotulo;
      link.href = href;
      if (abrirNovaAba) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      links.appendChild(link);
    }

    const localidade = camping.localidade;
    const consultaMapa = [camping.nome, localidade.enderecoCompleto].filter(Boolean).join(', ');
    adicionarLink(
      'Mapa',
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consultaMapa)}`,
      true
    );

    const site = localidade.site.trim();
    if (site) {
      try {
        const urlComProtocolo = /^https?:\/\//i.test(site) ? site : `https://${site}`;
        const urlSite = new URL(urlComProtocolo);
        if (urlSite.protocol === 'http:' || urlSite.protocol === 'https:') {
          adicionarLink('Site', urlSite.href, true);
        }
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
      }
    }

    const telefone = localidade.telefone.trim();
    const numeroTelefone = telefone.replace(/\D/g, '');
    if (numeroTelefone) {
      const prefixoDDI = telefone.startsWith('+') ? '+' : '';
      adicionarLink('Telefone', `tel:${prefixoDDI}${numeroTelefone}`, false);
    }

    const email = localidade.email.trim();
    if (email) {
      const emailParaLink = encodeURIComponent(email).replace(/%40/gi, '@');
      adicionarLink('E-mail', `mailto:${emailParaLink}`, false);
    }

    footer.appendChild(links);
  }

  /* ================= RENDERIZAR CALENDÁRIO ================= */
  function renderizarCalendario(ano, camping, diasMap) {
    dom.calendarGrid.innerHTML = '';

    for (let mes = 0; mes < 12; mes++) {
      const monthCard = document.createElement('div');
      monthCard.className = 'month-card';

      // Header do Mês
      const monthHeader = document.createElement('div');
      monthHeader.className = 'month-header';

      const monthName = document.createElement('span');
      monthName.className = 'month-name';
      monthName.textContent = NOMES_MESES[mes];

      // Conta presenças do mês
      const diasDoMes = Object.values(diasMap).filter(d => d.mes === mes);
      const presencasMes = diasDoMes.filter(d =>
        d.presenca && !d.isFeriado && !d.mesIsentoTaxas
      ).length;

      const monthBadge = document.createElement('span');
      monthBadge.className = 'month-badges';
      monthBadge.textContent = `${presencasMes} diárias cobradas`;

      monthHeader.appendChild(monthName);
      monthHeader.appendChild(monthBadge);
      monthCard.appendChild(monthHeader);

      // Linha dos dias da semana
      const weekdaysRow = document.createElement('div');
      weekdaysRow.className = 'weekdays-row';
      ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(d => {
        const span = document.createElement('span');
        span.textContent = d;
        weekdaysRow.appendChild(span);
      });
      monthCard.appendChild(weekdaysRow);

      // Grade dos dias
      const daysGrid = document.createElement('div');
      daysGrid.className = 'days-grid';

      // Offset do primeiro dia da semana do mês
      const primeiroDiaMes = new Date(ano, mes, 1).getDay();
      for (let i = 0; i < primeiroDiaMes; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        daysGrid.appendChild(emptyCell);
      }

      // Dias reais
      diasDoMes.forEach(diaInfo => {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.dataset.iso = diaInfo.dataISO;

        if (diaInfo.presenca) cell.classList.add('is-presence');
        if (diaInfo.isFeriado) cell.classList.add('is-holiday');
        if (diaInfo.energia === 'baixa') cell.classList.add('energy-baixa');
        if (diaInfo.energia === 'alta') cell.classList.add('energy-alta');
        if (diaInfo.hasCustomOverride) cell.classList.add('has-custom-override');

        // Número do dia
        const numSpan = document.createElement('span');
        numSpan.textContent = diaInfo.diaDoMes;
        cell.appendChild(numSpan);

        // Indicadores visuais pequenos
        const indDiv = document.createElement('div');
        indDiv.className = 'day-indicators';
        if (diaInfo.isFeriado) {
          indDiv.innerHTML += '<span>🚩</span>';
        }
        if (diaInfo.energia === 'baixa') {
          indDiv.innerHTML += '<span title="Energia Baixa">⚡</span>';
        } else if (diaInfo.energia === 'alta') {
          indDiv.innerHTML += '<span title="Energia Alta">⚡⚡</span>';
        }
        cell.appendChild(indDiv);

        // Tooltip explicativo
        let energiaLabel = diaInfo.energia === 'alta' ? 'Alta (cobrada à parte)' : (diaInfo.energia === 'baixa' ? 'Baixa' : 'Nenhuma');
        if (diaInfo.presenca && diaInfo.energia === 'baixa' && (diaInfo.isFeriado || diaInfo.mesIsentoTaxas)) {
          energiaLabel = 'Baixa (não cobrada à parte; presença marcada)';
        } else if (diaInfo.presenca && diaInfo.energia === 'baixa') {
          energiaLabel = 'Baixa (incluída na diária)';
        } else if (!diaInfo.presenca && diaInfo.energia !== 'nenhuma') {
          energiaLabel += ' (cobrada sem diária)';
        }
        let tip = `${diaInfo.diaDoMes}/${mes + 1}/${ano} (${NOMES_DIAS_SEMANA[diaInfo.diaSemana]})\n`;
        if (diaInfo.isFeriado) tip += `★ ${diaInfo.nomeFeriado}\n`;
        tip += `Presença: ${diaInfo.presenca ? 'Sim' : 'Não'}\n`;
        if (diaInfo.presenca && diaInfo.mesIsentoTaxas) {
          tip += 'Diária: Não cobrada (isenção de taxas)\n';
        } else if (diaInfo.isFeriado && diaInfo.presenca) {
          tip += 'Diária: Não cobrada (feriado)\n';
        }
        tip += `Energia: ${energiaLabel}`;
        if (diaInfo.motivo) tip += `\nObs: ${diaInfo.motivo}`;
        if (diaInfo.hasCustomOverride) tip += `\n[Personalizado manualmente]`;
        tip += `\nClique para alterar`;
        cell.title = tip;

        // Clique para abrir modal de edição rápida
        cell.addEventListener('click', () => abrirModalDia(diaInfo));

        daysGrid.appendChild(cell);
      });

      monthCard.appendChild(daysGrid);
      dom.calendarGrid.appendChild(monthCard);
    }
  }

  /* ================= MODAL DE PERSONALIZAÇÃO DO DIA ================= */
  function abrirModalDia(diaInfo) {
    state.diaEdicaoISO = diaInfo.dataISO;
    state.diaEdicaoInfo = diaInfo;
    const camping = obterCampingAtual();

    dom.diaModalTitulo.textContent = `${diaInfo.diaDoMes.toString().padStart(2, '0')}/${(diaInfo.mes + 1).toString().padStart(2, '0')}/${state.anoSelecionado}`;

    let meta = NOMES_DIAS_SEMANA[diaInfo.diaSemana];
    if (diaInfo.isFeriado) meta += ` • 🚩 ${diaInfo.nomeFeriado}`;
    if (diaInfo.hasCustomOverride) meta += ` • (Personalizado)`;
    dom.diaModalMeta.textContent = meta;

    // Preços no radio
    dom.labelPrecoEnergiaBaixa.textContent = formatarMoeda(camping.energiaBaixa);
    dom.labelPrecoEnergiaAlta.textContent = formatarMoeda(camping.energiaAlta);

    // Valores
    dom.checkDiaFeriado.checked = diaInfo.isFeriado;
    dom.checkDiaPresenca.checked = diaInfo.presenca;
    selecionarRadioEnergia(diaInfo.energia);
    dom.inputDiaMotivo.value = diaInfo.motivo || '';

    dom.modalDia.classList.add('active');
  }

  function atualizarPadraoDoDiaPorFeriado() {
    if (!state.diaEdicaoInfo) return;

    if (dom.checkDiaFeriado.checked) {
      dom.checkDiaPresenca.checked = true;
      return;
    }

    const camping = obterCampingAtual();
    const temPresenca = camping.diasSemanaPresenca.includes(state.diaEdicaoInfo.diaSemana);
    dom.checkDiaPresenca.checked = temPresenca;
  }

  function fecharModalDia() {
    dom.modalDia.classList.remove('active');
    state.diaEdicaoISO = null;
    state.diaEdicaoInfo = null;
  }

  function selecionarRadioEnergia(valor) {
    dom.radioCardsEnergia.forEach(card => {
      const radio = card.querySelector('input');
      if (radio.value === valor) {
        radio.checked = true;
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  function salvarDiaPersonalizado() {
    if (!state.diaEdicaoISO) return;

    const ano = state.anoSelecionado.toString();
    if (!state.anosData.anos[ano]) {
      state.anosData.anos[ano] = { excecoes: {} };
    }
    if (!state.anosData.anos[ano].excecoes) {
      state.anosData.anos[ano].excecoes = {};
    }

    const presenca = dom.checkDiaPresenca.checked;
    let energia = 'nenhuma';
    dom.radioCardsEnergia.forEach(card => {
      const radio = card.querySelector('input');
      if (radio.checked) energia = radio.value;
    });
    const motivo = dom.inputDiaMotivo.value.trim();

    const excecaoDia = {
      presenca,
      energia,
      motivo
    };
    if (dom.checkDiaFeriado.checked !== state.diaEdicaoInfo.feriadoNacional) {
      excecaoDia.isFeriado = dom.checkDiaFeriado.checked;
    }
    state.anosData.anos[ano].excecoes[state.diaEdicaoISO] = excecaoDia;

    salvarAnosStorage();
    fecharModalDia();
    atualizarTudo();
    showToast(`Data ${state.diaEdicaoISO} personalizada com sucesso!`);
  }

  function restaurarDiaPadrao() {
    if (!state.diaEdicaoISO) return;
    const ano = state.anoSelecionado.toString();

    if (state.anosData.anos[ano] && state.anosData.anos[ano].excecoes && state.anosData.anos[ano].excecoes[state.diaEdicaoISO]) {
      delete state.anosData.anos[ano].excecoes[state.diaEdicaoISO];
      salvarAnosStorage();
      showToast(`Data ${state.diaEdicaoISO} restaurada para a regra padrão.`);
    }

    fecharModalDia();
    atualizarTudo();
  }

  /* ================= MODAL DE CONFIGURAÇÃO DE CAMPINGS ================= */
  function abrirModalCamping() {
    state.campingEdicaoId = state.campingSelecionadoId;
    renderizarAbasCamping();
    carregarFormularioCamping(state.campingEdicaoId);
    dom.modalCamping.classList.add('active');
  }

  function fecharModalCamping() {
    dom.modalCamping.classList.remove('active');
  }

  function renderizarAbasCamping() {
    dom.campingTabsContainer.innerHTML = '';

    state.campingsData.perfis.forEach(perfil => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab-btn ${perfil.id === state.campingEdicaoId ? 'active' : ''}`;
      btn.textContent = perfil.nome + (perfil.default ? ' ★' : '');
      btn.addEventListener('click', () => {
        state.campingEdicaoId = perfil.id;
        renderizarAbasCamping();
        carregarFormularioCamping(perfil.id);
      });
      dom.campingTabsContainer.appendChild(btn);
    });

    // Botão de Novo Camping
    const btnNovo = document.createElement('button');
    btnNovo.type = 'button';
    btnNovo.className = 'tab-btn';
    btnNovo.textContent = '➕ Novo Camping';
    btnNovo.style.borderStyle = 'dashed';
    btnNovo.addEventListener('click', criarNovoCamping);
    dom.campingTabsContainer.appendChild(btnNovo);
  }

  function carregarFormularioCamping(campingId) {
    const perfil = state.campingsData.perfis.find(p => p.id === campingId);
    if (!perfil) return;

    dom.inputCampingNome.value = perfil.nome;
    dom.inputCampingEndereco.value = perfil.localidade.enderecoCompleto;
    dom.inputCampingTelefone.value = perfil.localidade.telefone;
    dom.inputCampingEmail.value = perfil.localidade.email;
    dom.inputCampingSite.value = perfil.localidade.site;
    dom.selectCampingPais.value = perfil.localidade.pais;
    dom.inputCampingFrequencia.value = perfil.frequencia;
    dom.inputCampingMensalidade.value = perfil.mensalidade;
    dom.inputCampingEnergiaBaixa.value = perfil.energiaBaixa;
    dom.inputCampingEnergiaAlta.value = perfil.energiaAlta;
    dom.inputCampingTrimestre.value = perfil.trimestre;
    dom.inputCampingAnuidade.value = perfil.anuidade;
    dom.checkCampingDefault.checked = Boolean(perfil.default);

    // Dias da semana
    dom.chipsDiasSemana.querySelectorAll('.chip-btn').forEach(btn => {
      const diaNum = parseInt(btn.dataset.dia, 10);
      if (perfil.diasSemanaPresenca.includes(diaNum)) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    // Meses de isenção
    dom.chipsMesesIsencao.querySelectorAll('.chip-btn').forEach(btn => {
      const mesNum = parseInt(btn.dataset.mes, 10);
      if (perfil.mesesIsencaoTaxas && perfil.mesesIsencaoTaxas.includes(mesNum)) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  function criarNovoCamping() {
    // ID Sequencial
    const maxId = state.campingsData.perfis.reduce((max, p) => p.id > max ? p.id : max, 0);
    const novoId = maxId + 1;

    const novoPerfil = {
      id: novoId,
      nome: `Novo Camping ${novoId}`,
      default: false,
      frequencia: 40.00,
      energiaBaixa: 15.00,
      energiaAlta: 25.00,
      trimestre: 150.00,
      anuidade: 500.00,
      mensalidade: 60.00,
      diasSemanaPresenca: [5, 6, 0],
      mesesIsencaoTaxas: [],
      localidade: {
        enderecoCompleto: '',
        telefone: '',
        email: '',
        site: '',
        pais: 'BR'
      }
    };

    state.campingsData.perfis.push(novoPerfil);
    state.campingEdicaoId = novoId;
    salvarCampingsStorage();
    renderizarAbasCamping();
    carregarFormularioCamping(novoId);
    popularSelectCampings();
    showToast(`Camping "${novoPerfil.nome}" criado.`);
  }

  function salvarCampingFormulario() {
    const perfil = state.campingsData.perfis.find(p => p.id === state.campingEdicaoId);
    if (!perfil) return;

    const nome = dom.inputCampingNome.value.trim();
    if (!nome) {
      alert('Por favor, informe o nome do camping.');
      return;
    }

    perfil.nome = nome;
    perfil.localidade = {
      enderecoCompleto: dom.inputCampingEndereco.value.trim(),
      telefone: dom.inputCampingTelefone.value.trim(),
      email: dom.inputCampingEmail.value.trim(),
      site: dom.inputCampingSite.value.trim(),
      pais: dom.selectCampingPais.value
    };
    perfil.frequencia = parseFloat(dom.inputCampingFrequencia.value) || 0;
    perfil.mensalidade = parseFloat(dom.inputCampingMensalidade.value) || 0;
    perfil.energiaBaixa = parseFloat(dom.inputCampingEnergiaBaixa.value) || 0;
    perfil.energiaAlta = parseFloat(dom.inputCampingEnergiaAlta.value) || 0;
    perfil.trimestre = parseFloat(dom.inputCampingTrimestre.value) || 0;
    perfil.anuidade = parseFloat(dom.inputCampingAnuidade.value) || 0;

    // Dias da semana selecionados
    const diasSemana = [];
    dom.chipsDiasSemana.querySelectorAll('.chip-btn.selected').forEach(btn => {
      diasSemana.push(parseInt(btn.dataset.dia, 10));
    });
    perfil.diasSemanaPresenca = diasSemana;

    // Meses de isenção selecionados
    const mesesIsencao = [];
    dom.chipsMesesIsencao.querySelectorAll('.chip-btn.selected').forEach(btn => {
      mesesIsencao.push(parseInt(btn.dataset.mes, 10));
    });
    perfil.mesesIsencaoTaxas = mesesIsencao;

    // Lógica do padrão (default)
    const isDefault = dom.checkCampingDefault.checked;
    if (isDefault) {
      state.campingsData.perfis.forEach(p => p.default = false);
      perfil.default = true;
    } else {
      // Garante que pelo menos um permaneça padrão
      const algumPadrao = state.campingsData.perfis.some(p => p.id !== perfil.id && p.default);
      if (!algumPadrao) {
        perfil.default = true;
        dom.checkCampingDefault.checked = true;
      } else {
        perfil.default = false;
      }
    }

    salvarCampingsStorage();
    popularSelectCampings();
    renderizarAbasCamping();
    atualizarTudo();
    showToast(`Configurações de "${perfil.nome}" salvas com sucesso!`);
  }

  function excluirCampingAtual() {
    if (state.campingsData.perfis.length <= 1) {
      alert('Não é possível excluir o único camping cadastrado.');
      return;
    }

    const perfil = state.campingsData.perfis.find(p => p.id === state.campingEdicaoId);
    if (!perfil) return;

    if (!confirm(`Deseja realmente excluir o perfil "${perfil.nome}"?`)) return;

    state.campingsData.perfis = state.campingsData.perfis.filter(p => p.id !== state.campingEdicaoId);

    // Se o excluído era o padrão, define o primeiro como padrão
    if (perfil.default) {
      state.campingsData.perfis[0].default = true;
    }

    // Se o excluído era o selecionado na tela principal
    if (state.campingSelecionadoId === perfil.id) {
      const padrao = state.campingsData.perfis.find(p => p.default) || state.campingsData.perfis[0];
      state.campingSelecionadoId = padrao.id;
    }

    state.campingEdicaoId = state.campingsData.perfis[0].id;

    salvarCampingsStorage();
    popularSelectCampings();
    renderizarAbasCamping();
    carregarFormularioCamping(state.campingEdicaoId);
    atualizarTudo();
    showToast(`Camping excluído com sucesso.`);
  }

  /* ================= IMPORTAÇÃO E EXPORTAÇÃO JSON ================= */

  // 1. Campings JSON
  function exportarCampingsJSON() {
    const jsonStr = JSON.stringify(state.campingsData, null, 2);
    downloadArquivo(jsonStr, 'campings.json', 'application/json');
    showToast('Arquivo campings.json exportado!');
  }

  function importarCampingsJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.perfis || !Array.isArray(parsed.perfis) || parsed.perfis.length === 0) {
          throw new Error('Arquivo JSON inválido: campo "perfis" ausente ou vazio.');
        }

        // Validação básica dos perfis
        parsed.perfis.forEach((p, idx) => {
          if (!p.id) p.id = idx + 1;
          if (!p.nome) p.nome = `Camping ${p.id}`;
          if (!Array.isArray(p.diasSemanaPresenca)) p.diasSemanaPresenca = [5, 6, 0];
          if (!Array.isArray(p.mesesIsencaoTaxas)) p.mesesIsencaoTaxas = [];
          normalizarLocalidadeCamping(p);
        });

        state.campingsData = parsed;
        definirCampingPadraoInicial();
        salvarCampingsStorage();
        popularSelectCampings();
        renderizarAbasCamping();
        carregarFormularioCamping(state.campingSelecionadoId);
        atualizarTudo();
        showToast('Campings importados com sucesso!');
      } catch (err) {
        alert('Erro ao importar JSON de campings: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // 2. Ano / Calendário JSON
  function exportarAnoJSON() {
    const ano = state.anoSelecionado.toString();
    const dadosExport = {
      versao: '1.0',
      ano: state.anoSelecionado,
      campingIdAplicado: state.campingSelecionadoId,
      excecoes: (state.anosData.anos[ano] && state.anosData.anos[ano].excecoes) ? state.anosData.anos[ano].excecoes : {}
    };

    const jsonStr = JSON.stringify(dadosExport, null, 2);
    downloadArquivo(jsonStr, `calendario_ano_${state.anoSelecionado}.json`, 'application/json');
    showToast(`Dados de ${state.anoSelecionado} exportados com sucesso!`);
  }

  function importarAnoJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const anoAlvo = (parsed.ano || state.anoSelecionado).toString();

        if (!state.anosData.anos) state.anosData.anos = {};
        state.anosData.anos[anoAlvo] = {
          campingIdAplicado: parsed.campingIdAplicado || state.campingSelecionadoId,
          excecoes: parsed.excecoes || {}
        };

        // Se o ano importado for o ano atual, atualiza
        if (parseInt(anoAlvo, 10) === state.anoSelecionado) {
          if (parsed.campingIdAplicado && state.campingsData.perfis.some(p => p.id === parsed.campingIdAplicado)) {
            state.campingSelecionadoId = parsed.campingIdAplicado;
            dom.selectCamping.value = state.campingSelecionadoId.toString();
          }
        } else {
          // Muda para o ano importado
          state.anoSelecionado = parseInt(anoAlvo, 10);
          dom.selectAno.value = anoAlvo;
        }

        salvarAnosStorage();
        atualizarTudo();
        showToast(`Dados do ano ${anoAlvo} importados com sucesso!`);
      } catch (err) {
        alert('Erro ao importar JSON do ano: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function downloadArquivo(conteudo, nomeArquivo, tipoMime) {
    const blob = new Blob([conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ================= REGISTRO DE EVENTOS ================= */
  function registrarEventos() {
    // Mudança de Ano
    dom.selectAno.addEventListener('change', (e) => {
      state.anoSelecionado = parseInt(e.target.value, 10);
      atualizarTudo();
    });

    // Mudança de Camping na Tela Principal
    dom.selectCamping.addEventListener('change', (e) => {
      state.campingSelecionadoId = parseInt(e.target.value, 10);
      atualizarTudo();
    });

    // Modal de Camping
    dom.btnOpenCampingModal.addEventListener('click', abrirModalCamping);
    dom.btnCloseCampingModal.addEventListener('click', fecharModalCamping);
    dom.btnSaveCamping.addEventListener('click', salvarCampingFormulario);
    dom.btnDeleteCamping.addEventListener('click', excluirCampingAtual);

    // Toggle de chips de dias da semana
    dom.chipsDiasSemana.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (btn) btn.classList.toggle('selected');
    });

    // Toggle de chips de meses de isenção
    dom.chipsMesesIsencao.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (btn) btn.classList.toggle('selected');
    });

    // Importar/Exportar Campings
    dom.btnExportCampings.addEventListener('click', exportarCampingsJSON);
    dom.btnImportCampingsTrigger.addEventListener('click', () => dom.inputImportCampings.click());
    dom.inputImportCampings.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importarCampingsJSON(e.target.files[0]);
        e.target.value = '';
      }
    });

    // Modal de Personalização de Dia
    dom.btnCloseDiaModal.addEventListener('click', fecharModalDia);
    dom.btnSalvarDia.addEventListener('click', salvarDiaPersonalizado);
    dom.btnRestaurarDiaPadrao.addEventListener('click', restaurarDiaPadrao);
    dom.checkDiaFeriado.addEventListener('change', atualizarPadraoDoDiaPorFeriado);

    // Seleção de Radio Cards de Energia
    dom.radioCardsEnergia.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.dataset.val;
        selecionarRadioEnergia(val);
      });
    });

    // Importar/Exportar Dados do Ano
    dom.btnExportAno.addEventListener('click', exportarAnoJSON);
    dom.btnImportAnoTrigger.addEventListener('click', () => dom.inputImportAno.click());
    dom.inputImportAno.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importarAnoJSON(e.target.files[0]);
        e.target.value = '';
      }
    });

    // Fechar modais ao clicar no overlay
    window.addEventListener('click', (e) => {
      if (e.target === dom.modalCamping) fecharModalCamping();
      if (e.target === dom.modalDia) fecharModalDia();
    });

    // Fechar modais com Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        fecharModalCamping();
        fecharModalDia();
      }
    });
  }

  /* ================= NOTIFICAÇÕES (TOAST) ================= */
  let toastTimeout;
  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 3200);
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
