"use strict";

/* =========================================================================
   SINERGIAS — combinações de risco
   -------------------------------------------------------------------------
   Regras que cruzam histórico de saúde, perfil (idade, gestação, puerpério)
   e sintomas. Uma sinergia só ELEVA o encaminhamento calculado pela tabela
   base — nunca rebaixa.

   Níveis, do menor para o maior:
     ubs < upa < hospital < samu_hospital

   Depende de SYMPTOM_CATEGORIES (definido em app.js). Como todo acesso
   acontece dentro de funções chamadas em tempo de execução, a ordem de
   carregamento dos dois arquivos é indiferente.
   ========================================================================= */

const NIVEL_ORDEM = { ubs: 0, upa: 1, hospital: 2, samu_hospital: 3 };

/* Sub-respostas que contam como versão grave de cada sintoma.
   O índice de "não sei" entra junto porque a triagem inteira trata
   incerteza de forma conservadora — é assim que a tabela base opera. */
const GRAVE = {
  dor_cabeca: [0, 2], // veio do nada muito forte | não sei
  tosse: [0, 2], // com sangue | não sei
  dor_barriga: [1, 2], // forte e/ou do nada | não sei
  sangramento_geral: [1, 2], // grave (hemorragia) | não sei
  sangramento_vaginal_peniano: [1, 2], // doloroso e/ou muito sangue | não sei
};

/* Agrupamentos reaproveitados por várias regras. */
const NEUROLOGICOS = ["dor_cabeca", "tontura", "alteracao_consciencia", "convulsao", "alteracao_visual"];
const OBSTRUCAO_RESPIRATORIA = ["asma", "dpoc", "o2_domiciliar"];
const IMUNOSSUPRESSAO = ["cancer_tratamento", "hiv", "imunobiologicos", "esplenectomia"];
const SANGRAMENTO_RISCO = ["disturbio_coagulacao", "anticoagulante", "antiagregante"];
const CORTICOIDE = ["corticoide_cronico", "insuf_adrenal"];

/* ------------------------- Índice de sintomas ---------------------------- */

let _indiceSintomas = null;

function itemSintoma(id) {
  if (!_indiceSintomas) {
    _indiceSintomas = {};
    SYMPTOM_CATEGORIES.forEach((cat) => cat.items.forEach((it) => (_indiceSintomas[it.id] = it)));
  }
  return _indiceSintomas[id];
}

/* ================== Classificação de pressão arterial ==================== */
/* Usa as tabelas de dadospressao.js (variável global `dados`) para
   classificar a leitura do manômetro em normal / pré-hipertensão /
   hipertensão (1, 2 e, no adulto, 3), por faixa etária:

     idade === 0             -> dados.neonatal (0 a 1 ano)
     idade entre 1 e 12       -> dados.meninos/meninas[idade], por altura
     idade entre 13 e 17      -> dados["maior de 13 e menor de 18"]
     idade >= 18 ou "não sei" -> dados["maior de idade"]

   Critério de estágio: a leitura atinge um patamar se a sistólica OU a
   diastólica alcançar o valor de referência daquele patamar — o mesmo
   critério usado nas diretrizes de aferição em que essas tabelas se
   baseiam (o maior dos dois eixos manda). */

function parsePA(str) {
  const [sys, dia] = str.split("/").map(Number);
  return { sys, dia };
}

/* Chave de altura (string) mais próxima do valor medido, dentro de um
   dicionário {"altura_cm": "sys/dia"}. */
function alturaMaisProxima(dict, altura) {
  let melhor = null;
  let menorDist = Infinity;
  for (const chave of Object.keys(dict)) {
    const d = Math.abs(Number(chave) - altura);
    if (d < menorDist) {
      menorDist = d;
      melhor = chave;
    }
  }
  return melhor;
}

/* `patamares` em ordem crescente de gravidade. Devolve o rótulo do
   patamar mais alto atingido, ou "normal" se nenhum for atingido. */
function classificaPorPatamares(leitura, patamares) {
  let rotulo = "normal";
  patamares.forEach((p) => {
    if (leitura.sys >= p.limite.sys || leitura.dia >= p.limite.dia) rotulo = p.rotulo;
  });
  return rotulo;
}

/* Banda etária usada tanto para escolher a tabela quanto pelas sinergias
   de roteamento (que tratam "criança" como 1–17, juntando a tabela por
   percentil com a de adolescente). */
function pressaoBanda(idade) {
  if (typeof idade !== "number") return "adulto"; // "não sei" -> mesmo padrão da faixa etária geral
  if (idade === 0) return "neonatal";
  if (idade <= 17) return "crianca";
  return "adulto";
}

/* Devolve o estágio da pressão para o estado atual, ou null quando não há
   leitura numérica (sintoma não marcado, ou "não consigo medir"). */
function classificaPressao(state) {
  if (typeof dados === "undefined") return null; // dadospressao.js não carregou

  const st = state.sintomas.pressao_arterial;
  if (!st || !st.checked || !st.pressao) return null;
  const leitura = { sys: st.pressao.max, dia: st.pressao.min };
  const idade = state.idade;

  if (typeof idade === "number" && idade === 0) {
    const t = dados.neonatal;
    return classificaPorPatamares(leitura, [
      { rotulo: "pre-hipertensão", limite: parsePA(t.base) },
      { rotulo: "hipertensão", limite: parsePA(t.hiper) },
    ]);
  }

  if (typeof idade === "number" && idade >= 1 && idade <= 12) {
    if (state.altura == null) return null; // sem altura não há como consultar a tabela
    const grupo = state.genero === "mulher" ? dados.meninas : dados.meninos;
    const porIdade = grupo && grupo[String(idade)];
    if (!porIdade) return null;
    const chave = alturaMaisProxima(porIdade.P90, state.altura);
    return classificaPorPatamares(leitura, [
      { rotulo: "pre-hipertensão", limite: parsePA(porIdade.P90[chave]) },
      { rotulo: "hipertensão 1", limite: parsePA(porIdade.P95[chave]) },
      { rotulo: "hipertensão 2", limite: parsePA(porIdade["P95+12"][chave]) },
    ]);
  }

  if (typeof idade === "number" && idade >= 13 && idade <= 17) {
    const t = dados["maior de 13 e menor de 18"];
    return classificaPorPatamares(leitura, [
      { rotulo: "pre-hipertensão", limite: parsePA(t.base) },
      { rotulo: "hipertensão 1", limite: parsePA(t.pre) },
      { rotulo: "hipertensão 2", limite: parsePA(t.hiper) },
    ]);
  }

  // 18+ ou idade "não sei".
  const t = dados["maior de idade"];
  return classificaPorPatamares(leitura, [
    { rotulo: "pre-hipertensão", limite: parsePA(t.base) },
    { rotulo: "hipertensão 1", limite: parsePA(t.pre) },
    { rotulo: "hipertensão 2", limite: parsePA(t.hiper) },
    { rotulo: "hipertensão 3", limite: parsePA(t.mega) },
  ]);
}

/* ---------------------------- Contexto de teste -------------------------- */

function criaContexto(state) {
  /* Marcado? Com `indices`, exige que a sub-resposta seja uma delas.
     Sem resposta na sub-pergunta, assume a última opção ("não sei"),
     exatamente como faz o cálculo base em app.js. */
  const sym = (id, indices) => {
    const st = state.sintomas[id];
    if (!st || !st.checked) return false;
    if (!indices) return true;

    const item = itemSintoma(id);
    if (!item || !item.sub) return true; // sintoma sem sub-pergunta
    const idx = st.subIndex ?? item.sub.options.length - 1;
    return indices.includes(idx);
  };

  const cond = (id) => {
    const st = state.comorbidades[id];
    return !!(st && st.checked);
  };

  return {
    sym,
    cond,
    symGrave: (id) => sym(id, GRAVE[id]),
    algumSym: (ids, indices) => ids.some((id) => sym(id, indices)),
    algumCond: (ids) => ids.some(cond),
    populacao: state.populacao,
    subpopulacao: state.subpopulacao,
    puerperio: state.puerperio,
    pressaoEstagio: () => classificaPressao(state),
    pressaoBanda: () => pressaoBanda(state.idade),
  };
}

/* -------------------------------- Regras --------------------------------- */

const SINERGIAS = [
  /* ---------- Histórico de saúde × sintoma ---------- */
  {
    id: "cardio_infarto",
    nivel: "hospital",
    titulo: "Infarto ou angina prévia + dor no peito",
    porque: "Dor no peito em quem já teve infarto ou angina pode ser um novo evento cardíaco.",
    quando: (c) => c.cond("infarto_angina") && c.sym("dor_peito"),
  },
  {
    id: "avc_neuro",
    nivel: "samu_hospital",
    titulo: "AVC ou AIT prévio + sintoma neurológico",
    porque: "Quem já teve AVC ou AIT tem risco alto de recorrência; tempo é decisivo no tratamento.",
    quando: (c) => c.cond("avc_ait") && c.algumSym(NEUROLOGICOS),
  },
  {
    id: "arritmia_cardio",
    nivel: "hospital",
    titulo: "Arritmia ou fibrilação atrial + desmaio, palpitação ou tontura",
    porque: "Pode indicar arritmia descompensada, com risco de baixo débito cardíaco.",
    quando: (c) => c.cond("arritmia") && c.algumSym(["desmaio", "palpitacao", "tontura"]),
  },
  {
    id: "has_neuro",
    nivel: "hospital",
    titulo: "Hipertensão + dor de cabeça súbita intensa ou alteração visual",
    porque: "Combinação sugestiva de emergência hipertensiva ou evento cerebral.",
    quando: (c) => c.cond("hipertensao") && (c.symGrave("dor_cabeca") || c.sym("alteracao_visual")),
  },
  {
    id: "dispositivo_cardiaco",
    nivel: "hospital",
    titulo: "Marca-passo ou stent + dor no peito ou palpitação",
    porque: "Pode indicar falha do dispositivo, obstrução do stent ou novo evento coronariano.",
    quando: (c) => c.cond("marcapasso_stent") && c.algumSym(["dor_peito", "palpitacao"]),
  },
  {
    id: "diabetes_abdome",
    nivel: "hospital",
    titulo: "Diabetes + vômito + dor abdominal",
    porque: "Tríade compatível com cetoacidose diabética.",
    quando: (c) => c.cond("diabetes") && c.sym("nausea_vomito") && c.sym("dor_barriga"),
  },
  {
    id: "corticoide_estresse",
    nivel: "upa",
    titulo: "Corticoide crônico ou insuficiência adrenal + vômito, diarreia ou febre",
    porque: "Mesmo sintomas leves podem desencadear crise adrenal em quem usa corticoide crônico.",
    quando: (c) => c.algumCond(CORTICOIDE) && c.algumSym(["nausea_vomito", "diarreia", "febre_hipotermia"]),
  },
  {
    id: "corticoide_abdome_grave",
    nivel: "hospital",
    titulo: "Corticoide crônico ou insuficiência adrenal + dor abdominal forte",
    porque: "Dor abdominal intensa nesse contexto exige investigação hospitalar.",
    quando: (c) =>
      c.algumCond(CORTICOIDE) &&
      c.algumSym(["nausea_vomito", "diarreia", "febre_hipotermia"]) &&
      c.symGrave("dor_barriga"),
  },
  {
    id: "pneumo_dispneia",
    nivel: "hospital",
    titulo: "Asma, DPOC ou oxigênio domiciliar + falta de ar",
    porque: "Doença pulmonar de base eleva muito o risco de insuficiência respiratória.",
    quando: (c) => c.algumCond(OBSTRUCAO_RESPIRATORIA) && c.sym("falta_ar"),
  },
  {
    id: "tb_hemoptise",
    nivel: "hospital",
    titulo: "Tuberculose em tratamento + tosse com sangue",
    porque: "Hemoptise na tuberculose pode evoluir para sangramento volumoso.",
    quando: (c) => c.cond("tuberculose") && c.symGrave("tosse"),
  },
  {
    id: "dialise_dispneia",
    nivel: "hospital",
    titulo: "Diálise + falta de ar",
    porque: "Sugere sobrecarga de volume ou distúrbio eletrolítico entre sessões.",
    quando: (c) => c.cond("dialise") && c.sym("falta_ar"),
  },
  {
    id: "cirrose_hemorragia",
    nivel: "samu_hospital",
    titulo: "Cirrose + vômito com sangue ou fezes escuras",
    porque: "Compatível com hemorragia digestiva alta por varizes — risco imediato de vida.",
    quando: (c) => c.cond("cirrose") && c.sym("vomito_sangue"),
  },
  {
    id: "imunossuprimido_febre",
    nivel: "hospital",
    titulo: "Imunossupressão + febre",
    porque: "Febre em imunossuprimido pode ser neutropenia febril ou sepse de evolução rápida.",
    quando: (c) => c.algumCond(IMUNOSSUPRESSAO) && c.sym("febre_hipotermia"),
  },
  {
    id: "epilepsia_convulsao",
    nivel: "hospital",
    titulo: "Epilepsia + convulsão",
    porque: "Mesmo em crise habitual, é preciso descartar estado de mal epiléptico e causas agudas.",
    quando: (c) => c.cond("epilepsia") && c.sym("convulsao"),
  },
  {
    id: "falciforme_febre",
    nivel: "hospital",
    titulo: "Anemia falciforme + febre",
    porque: "Alto risco de infecção grave e de crise vaso-oclusiva.",
    quando: (c) => c.cond("anemia_falciforme") && c.sym("febre_hipotermia"),
  },
  {
    id: "anticoagulado_sangramento",
    nivel: "hospital",
    titulo: "Anticoagulante, antiagregante ou coagulopatia + sangramento ou trauma",
    porque: "Sangramentos e traumas pequenos podem se tornar graves sem coagulação normal.",
    quando: (c) => c.algumCond(SANGRAMENTO_RISCO) && c.algumSym(["sangramento_geral", "batida", "ferida"]),
  },
  {
    id: "betabloqueador_sincope",
    nivel: "hospital",
    titulo: "Betabloqueador + desmaio ou falta de ar",
    porque: "O medicamento pode mascarar a resposta do corpo e agravar bradicardia ou broncoespasmo.",
    quando: (c) => c.cond("betabloqueador") && c.algumSym(["desmaio", "falta_ar"]),
  },
  {
    id: "pos_operatorio",
    nivel: "hospital",
    titulo: "Cirurgia recente + febre ou falta de ar",
    porque: "Levanta suspeita de infecção de sítio cirúrgico ou de embolia pulmonar.",
    quando: (c) => c.cond("cirurgia_recente") && c.algumSym(["febre_hipotermia", "falta_ar"]),
  },

  /* ---------- Sintoma × sintoma ---------- */
  {
    id: "sindrome_coronariana",
    nivel: "hospital",
    titulo: "Dor no peito + falta de ar + sudorese ou náusea",
    porque: "Conjunto clássico de síndrome coronariana aguda.",
    quando: (c) => c.sym("dor_peito") && c.sym("falta_ar") && c.algumSym(["suando", "nausea_vomito"]),
  },
  {
    id: "cefaleia_thunderclap",
    nivel: "hospital",
    titulo: "Dor de cabeça súbita e forte + alteração visual ou de consciência",
    porque: "Pode indicar hemorragia intracraniana.",
    quando: (c) => c.symGrave("dor_cabeca") && c.algumSym(["alteracao_visual", "alteracao_consciencia"]),
  },
  {
    id: "febre_consciencia",
    nivel: "hospital",
    titulo: "Febre + alteração de consciência",
    porque: "Combinação sugestiva de infecção grave do sistema nervoso ou sepse.",
    quando: (c) => c.sym("febre_hipotermia") && c.sym("alteracao_consciencia"),
  },
  {
    id: "abdome_agudo",
    nivel: "hospital",
    titulo: "Dor abdominal forte + vômito + febre",
    porque: "Quadro compatível com abdome agudo inflamatório ou obstrutivo.",
    quando: (c) => c.symGrave("dor_barriga") && c.sym("nausea_vomito") && c.sym("febre_hipotermia"),
  },
  {
    id: "hipovolemia",
    nivel: "hospital",
    titulo: "Ferida ou sangramento + tontura ou desmaio",
    porque: "Sinais de perda de sangue significativa com repercussão circulatória.",
    quando: (c) => c.algumSym(["ferida", "sangramento_geral"]) && c.algumSym(["tontura", "desmaio"]),
  },
  {
    id: "consciencia_autonomico",
    nivel: "hospital",
    titulo: "Alteração de consciência + sudorese ou palpitação",
    porque: "Pode indicar hipoglicemia, arritmia ou choque em instalação.",
    quando: (c) => c.sym("alteracao_consciencia") && c.algumSym(["suando", "palpitacao"]),
  },

  /* ---------- Perfil × sintoma ---------- */
  {
    id: "neonato_sinal_alarme",
    nivel: "hospital",
    titulo: "Recém-nascido + febre, vômito ou diarreia",
    porque: "No período neonatal, esses sinais podem indicar infecção grave e desidratam rápido.",
    quando: (c) =>
      c.subpopulacao === "neonatal" && c.algumSym(["febre_hipotermia", "nausea_vomito", "diarreia"]),
  },
  {
    id: "idoso_consciencia",
    nivel: "samu_hospital",
    titulo: "Idoso + alteração de consciência ou fraqueza sem febre",
    porque: "No idoso esses sinais costumam ser a única manifestação de AVC, sepse ou infarto.",
    quando: (c) =>
      c.populacao === "idoso_clinico" &&
      (c.sym("alteracao_consciencia") || (c.sym("cansaco_muscular") && !c.sym("febre_hipotermia"))),
  },
  {
    id: "gestante_preeclampsia",
    nivel: "samu_hospital",
    titulo: "Gestante + dor de cabeça + alteração visual",
    porque: "Sinais de pré-eclâmpsia grave, com risco de eclâmpsia.",
    quando: (c) => c.subpopulacao === "gravida" && c.sym("dor_cabeca") && c.sym("alteracao_visual"),
  },
  {
    id: "gestante_sangramento",
    nivel: "samu_hospital",
    titulo: "Gestante + sangramento vaginal",
    porque: "Pode indicar descolamento de placenta ou outra emergência obstétrica.",
    quando: (c) => c.subpopulacao === "gravida" && c.sym("sangramento_vaginal_peniano"),
  },
  {
    id: "puerperio_imediato",
    nivel: "hospital",
    titulo: "Puerpério imediato + sangramento intenso ou febre",
    porque: "Risco de hemorragia pós-parto e de infecção puerperal.",
    quando: (c) =>
      c.puerperio === "imediato" &&
      (c.symGrave("sangramento_vaginal_peniano") ||
        c.symGrave("sangramento_geral") ||
        c.sym("febre_hipotermia")),
  },

  /* ---------- Pressão arterial × idade (dadospressao.js) ----------
     Só valem para quem NÃO tem hipertensão já diagnosticada — a pessoa
     com hipertensão conhecida pode estar controlada, então uma leitura
     alterada não é por si só um sinal de descompensação aguda. */
  {
    id: "pa_neonatal_hipertensao",
    nivel: "hospital",
    titulo: "Pressão em nível de hipertensão (até 1 ano, sem diagnóstico prévio)",
    porque: "Em bebês até 1 ano sem hipertensão conhecida, esse nível de pressão pede avaliação hospitalar.",
    quando: (c) => c.pressaoBanda() === "neonatal" && !c.cond("hipertensao") && c.pressaoEstagio() === "hipertensão",
  },
  {
    id: "pa_crianca_hipertensao1",
    nivel: "upa",
    titulo: "Pressão em hipertensão estágio 1 (1 a 17 anos, sem diagnóstico prévio)",
    porque: "Sem hipertensão conhecida, esse nível pede avaliação de urgência.",
    quando: (c) =>
      c.pressaoBanda() === "crianca" && !c.cond("hipertensao") && c.pressaoEstagio() === "hipertensão 1",
  },
  {
    id: "pa_crianca_hipertensao2",
    nivel: "hospital",
    titulo: "Pressão em hipertensão estágio 2 (1 a 17 anos, sem diagnóstico prévio)",
    porque: "Sem hipertensão conhecida, esse nível pede avaliação hospitalar.",
    quando: (c) =>
      c.pressaoBanda() === "crianca" && !c.cond("hipertensao") && c.pressaoEstagio() === "hipertensão 2",
  },
  {
    id: "pa_adulto_hipertensao1e2",
    nivel: "upa",
    titulo: "Pressão em hipertensão estágio 1 ou 2 (18 anos ou mais, sem diagnóstico prévio)",
    porque: "Sem hipertensão conhecida, esse nível pede avaliação de urgência.",
    quando: (c) =>
      c.pressaoBanda() === "adulto" &&
      !c.cond("hipertensao") &&
      ["hipertensão 1", "hipertensão 2"].includes(c.pressaoEstagio()),
  },
  {
    id: "pa_adulto_hipertensao3",
    nivel: "hospital",
    titulo: "Pressão em hipertensão estágio 3 (18 anos ou mais, sem diagnóstico prévio)",
    porque: "Sem hipertensão conhecida, esse nível pede avaliação hospitalar.",
    quando: (c) => c.pressaoBanda() === "adulto" && !c.cond("hipertensao") && c.pressaoEstagio() === "hipertensão 3",
  },
];

/* ------------------------------ Avaliação -------------------------------- */

/**
 * Cruza o estado da triagem com as regras de sinergia.
 * @param {object} state estado corrente da triagem
 * @param {"ubs"|"upa"|"hospital"} baseDestino resultado da tabela base
 * @returns {{destino: string, samu: boolean, disparadas: object[]}}
 */
function avaliaSinergias(state, baseDestino) {
  const c = criaContexto(state);

  const disparadas = SINERGIAS.filter((regra) => {
    try {
      return regra.quando(c);
    } catch (e) {
      // Uma regra com problema nunca deve derrubar a triagem inteira.
      return false;
    }
  });

  let nivel = baseDestino;
  disparadas.forEach((r) => {
    if (NIVEL_ORDEM[r.nivel] > NIVEL_ORDEM[nivel]) nivel = r.nivel;
  });

  disparadas.sort((a, b) => NIVEL_ORDEM[b.nivel] - NIVEL_ORDEM[a.nivel]);

  return {
    destino: nivel === "samu_hospital" ? "hospital" : nivel,
    samu: nivel === "samu_hospital",
    disparadas,
  };
}
