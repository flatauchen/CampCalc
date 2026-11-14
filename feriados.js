/**
 * feriados.js
 * Calendários nacionais offline para qualquer ano selecionado.
 */

const FeriadosUtil = (() => {
  const calendarios = {
    BR: {
      fixos: [
        ['01-01', 'Confraternização Universal (Ano Novo)'],
        ['04-21', 'Tiradentes'],
        ['05-01', 'Dia Mundial do Trabalho'],
        ['09-07', 'Independência do Brasil'],
        ['10-12', 'Nossa Senhora Aparecida'],
        ['11-02', 'Finados'],
        ['11-15', 'Proclamação da República'],
        ['11-20', 'Dia Nacional de Zumbi e da Consciência Negra'],
        ['12-25', 'Natal']
      ],
      moveis: [
        [-48, 'Carnaval (Segunda-feira)'],
        [-47, 'Carnaval (Terça-feira)'],
        [-2, 'Sexta-feira Santa (Paixão de Cristo)'],
        [0, 'Domingo de Páscoa'],
        [60, 'Corpus Christi']
      ]
    },
    PT: {
      fixos: [
        ['01-01', 'Ano Novo'],
        ['04-25', 'Dia da Liberdade'],
        ['05-01', 'Dia do Trabalhador'],
        ['06-10', 'Dia de Portugal'],
        ['08-15', 'Assunção de Nossa Senhora'],
        ['10-05', 'Implantação da República'],
        ['11-01', 'Todos os Santos'],
        ['12-01', 'Restauração da Independência'],
        ['12-08', 'Imaculada Conceição'],
        ['12-25', 'Natal']
      ],
      moveis: [
        [-2, 'Sexta-feira Santa'],
        [60, 'Corpo de Deus']
      ]
    },
    ES: {
      fixos: [
        ['01-01', 'Ano Novo'],
        ['01-06', 'Epifania do Senhor'],
        ['05-01', 'Dia do Trabalhador'],
        ['08-15', 'Assunção de Nossa Senhora'],
        ['10-12', 'Festa Nacional de Espanha'],
        ['11-01', 'Todos os Santos'],
        ['12-06', 'Dia da Constituição'],
        ['12-08', 'Imaculada Conceição'],
        ['12-25', 'Natal']
      ],
      moveis: [
        [-2, 'Sexta-feira Santa']
      ]
    },
    FR: {
      fixos: [
        ['01-01', 'Ano Novo'],
        ['05-01', 'Dia do Trabalhador'],
        ['05-08', 'Vitória de 1945'],
        ['07-14', 'Festa Nacional'],
        ['08-15', 'Assunção'],
        ['11-01', 'Todos os Santos'],
        ['11-11', 'Armistício de 1918'],
        ['12-25', 'Natal']
      ],
      moveis: [
        [1, 'Segunda-feira de Páscoa'],
        [39, 'Ascensão'],
        [50, 'Segunda-feira de Pentecostes']
      ]
    },
    DE: {
      fixos: [
        ['01-01', 'Ano Novo'],
        ['05-01', 'Dia do Trabalhador'],
        ['10-03', 'Dia da Unidade Alemã'],
        ['12-25', 'Natal'],
        ['12-26', 'Segundo dia de Natal']
      ],
      moveis: [
        [-2, 'Sexta-feira Santa'],
        [1, 'Segunda-feira de Páscoa'],
        [39, 'Ascensão'],
        [50, 'Segunda-feira de Pentecostes']
      ]
    }
  };

  function calcularDomingoPascoa(ano) {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
  }

  function somarDias(data, dias) {
    const novaData = new Date(data.getTime());
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  }

  function formatarISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  function obterFeriadosAno(ano, pais = 'BR') {
    const calendario = calendarios[pais];
    if (!calendario) return {};

    const feriados = {};
    calendario.fixos.forEach(([mesDia, nome]) => {
      feriados[`${ano}-${mesDia}`] = nome;
    });

    const pascoa = calcularDomingoPascoa(ano);
    calendario.moveis.forEach(([dias, nome]) => {
      feriados[formatarISO(somarDias(pascoa, dias))] = nome;
    });

    return feriados;
  }

  return {
    obterFeriadosAno,
    formatarISO
  };
})();
