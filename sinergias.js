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
  alteracao_visual: [0], // perda súbita da visão
  vomito_sangue: [0, 1, 3], // vômito com sangue/fezes pretas | muito sangue vivo | não sei
  perda_apetite: [1, 2], // quase não come e/ou não bebe | não sei
};

/* Agrupamentos reaproveitados por várias regras. */
const NEUROLOGICOS = ["dor_cabeca", "tontura", "alteracao_consciencia", "convulsao", "alteracao_visual"];
const OBSTRUCAO_RESPIRATORIA = ["asma", "dpoc", "o2_domiciliar"];
const IMUNOSSUPRESSAO = ["cancer_tratamento", "hiv", "imunobiologicos", "esplenectomia", "transplantado", "imunossupressor"];
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

/* ========================= Hipotensão (novo) ============================
   A classificação por patamares acima só olha para cima: 80/50 saía como
   "normal" e, sozinho, virava "cuidado em casa". Limiar de PAS por idade
   (critérios usuais de hipotensão do suporte avançado pediátrico; 90 mmHg
   a partir dos 10 anos). "Grave" = 10 mmHg ou mais abaixo do limiar. */
function limiarHipotensao(state) {
  const idade = state.idade;
  if (typeof idade !== "number") return 90;
  if (idade === 0) return state.subpopulacao === "neonatal" ? 60 : 70;
  if (idade < 10) return 70 + 2 * idade;
  return 90;
}

function classificaHipotensao(state) {
  const st = state.sintomas.pressao_arterial;
  if (!st || !st.checked) return null;
  if (st.pressao) {
    const lim = limiarHipotensao(state);
    if (st.pressao.max < lim - 10) return "hipotensão grave";
    if (st.pressao.max < lim) return "hipotensão";
    return null;
  }
  const item = itemSintoma("pressao_arterial");
  const opt = item && item.sub.options[st.subIndex ?? item.sub.options.length - 1];
  return opt && opt.hipo ? "hipotensão relatada" : null;
}

/* ---------------------------- Contexto de teste -------------------------- */

function criaContexto(state) {
  const sym = (id, indices) => {
    const st = state.sintomas[id];
    if (!st || !st.checked) return false;
    if (!indices) return true;

    const item = itemSintoma(id);
    if (!item || !item.sub) return true;
    const idx = st.subIndex ?? item.sub.options.length - 1;
    return indices.includes(idx);
  };

  const cond = (id) => {
    const st = state.comorbidades[id];
    return !!(st && st.checked);
  };

  const pressaoLeitura = () => {
    const st = state.sintomas.pressao_arterial;
    return st && st.checked && st.pressao ? { sys: st.pressao.max, dia: st.pressao.min } : null;
  };

  return {
    sym,
    cond,
    symGrave: (id) => sym(id, GRAVE[id]),
    algumSym: (ids, indices) => ids.some((id) => sym(id, indices)),
    algumCond: (ids) => ids.some(cond),
    usaInsulina: () =>
      cond("insulina") || !!(state.comorbidades.diabetes && state.comorbidades.diabetes.extraValue === true),
    populacao: state.populacao,
    subpopulacao: state.subpopulacao,
    puerperio: state.puerperio,
    idade: state.idade,
    semanasBebe: state.semanas_bebe,
    /* Bebê com menos de 3 meses (ou semanas desconhecidas). */
    bebeMenos3m: () =>
      state.idade === 0 &&
      (state.semanas_bebe === "nao_sei" || (typeof state.semanas_bebe === "number" && state.semanas_bebe < 13)),
    gravidaTempo: state.gravida_tempo,
    gestanteOuPuerpera: () =>
      state.subpopulacao === "gravida" ||
      (state.subpopulacao === "puerperio" && state.puerperio !== "remoto"),
    pressaoEstagio: () => classificaPressao(state),
    pressaoBanda: () => pressaoBanda(state.idade),
    pressaoLeitura,
    paAtinge: (sys, dia) => {
      const l = pressaoLeitura();
      return !!l && (l.sys >= sys || l.dia >= dia);
    },
    hipotensao: () => classificaHipotensao(state),
    glicoseValor: () => {
      const st = state.sintomas.glicose;
      return st && st.checked && st.glicose ? st.glicose.valor : null;
    },
    historicoRespondido: () => !!state.comorbidadesRespondidas,
  };
}

/* -------------------------------- Regras --------------------------------- */

/* Sinais neurológicos AGUDOS: excluem cefaleia gradual/habitual e vertigem
   rotatória, que dispararam SAMU em quem teve AVC há anos. */
const NEURO_AGUDO = (c) =>
  c.sym("deficit_focal") ||
  c.sym("alteracao_consciencia") ||
  c.sym("convulsao", [0, 2]) ||
  c.sym("tontura", [1]) ||
  c.sym("dor_cabeca", [0]) ||
  c.sym("alteracao_visual", [0]);

const SINERGIAS = [
  /* ---------- Sinais isolados que já são tempo-dependentes ---------- */
  {
    id: "avc_agudo",
    nivel: "samu_hospital",
    titulo: "Fraqueza de um lado, boca torta ou fala enrolada",
    porque: "Sinais de AVC: o tratamento só funciona nas primeiras horas.",
    quando: (c) => c.sym("deficit_focal"),
  },
  {
    id: "hipoxemia_grave",
    nivel: "samu_hospital",
    titulo: "Saturação abaixo de 90% + falta de ar, lábios roxos ou confusão",
    porque: "Hipoxemia grave com repercussão: risco de parada respiratória.",
    quando: (c) => c.sym("spo2", [2]) && c.algumSym(["falta_ar", "cianose", "alteracao_consciencia"]),
  },
  {
    id: "cianose_dispneia",
    nivel: "samu_hospital",
    titulo: "Lábios ou extremidades roxos + falta de ar",
    porque: "Cianose central com desconforto respiratório.",
    quando: (c) => c.sym("cianose") && c.sym("falta_ar"),
  },
  {
    id: "intoxicacao_grave",
    nivel: "samu_hospital",
    titulo: "Intoxicação + sonolência, convulsão ou falta de ar",
    porque: "Intoxicação com sinais sistêmicos pede suporte avançado no transporte.",
    quando: (c) => c.sym("intoxicacao") && c.algumSym(["alteracao_consciencia", "convulsao", "falta_ar"]),
  },

  {
    id: "ferimento_penetrante",
    nivel: "samu_hospital",
    titulo: "Tiro ou facada/perfuração no tronco ou pescoço",
    porque: "Pode atingir órgãos e grandes vasos sem sangramento visível: transporte com suporte e cirurgia.",
    quando: (c) => c.sym("ferida", [2]),
  },
  {
    id: "sincope_cardiaca",
    nivel: "hospital",
    titulo: "Desmaio + palpitação súbita, falta de ar ou frequência cardíaca alterada",
    porque: "Desmaio com sinal cardíaco ou respiratório sugere arritmia ou embolia pulmonar, não um desmaio comum.",
    quando: (c) =>
      c.sym("desmaio") &&
      (c.sym("palpitacao", [1, 2]) || c.sym("falta_ar") || c.sym("frequencia_cardiaca", [1, 2])),
  },
  {
    id: "dor_peito_dispneia_sinais",
    nivel: "hospital",
    titulo: "Dor no peito + falta de ar + saturação baixa ou coração acelerado",
    porque: "Quadro compatível com embolia pulmonar, síndrome coronariana ou pneumotórax.",
    quando: (c) =>
      c.sym("dor_peito") && c.sym("falta_ar") && (c.sym("spo2", [1, 2]) || c.sym("frequencia_cardiaca", [1, 2])),
  },

  /* ---------- Histórico de saúde × sintoma ---------- */
  {
    id: "cardio_infarto",
    nivel: "hospital",
    titulo: "Infarto ou angina prévia + dor no peito",
    porque: "Dor no peito em quem já teve infarto ou angina pode ser um novo evento cardíaco.",
    quando: (c) => c.cond("infarto_angina") && c.sym("dor_peito"),
  },
  {
    id: "ic_dor_peito_desmaio",
    nivel: "hospital",
    titulo: "Insuficiência cardíaca + dor no peito ou desmaio",
    porque: "Com o coração já fraco, dor no peito ou desmaio podem ser isquemia ou arritmia grave.",
    quando: (c) => c.cond("insuf_cardiaca") && c.algumSym(["dor_peito", "desmaio"]),
  },
  {
    id: "avc_neuro",
    nivel: "samu_hospital",
    titulo: "AVC ou AIT prévio + sinal neurológico agudo",
    porque: "Quem já teve AVC ou AIT tem risco alto de recorrência; tempo é decisivo no tratamento.",
    quando: (c) => c.cond("avc_ait") && NEURO_AGUDO(c),
  },
  {
    id: "arritmia_cardio",
    nivel: "hospital",
    titulo: "Arritmia ou fibrilação atrial + desmaio, palpitação ou tontura (que não é de rodar)",
    porque: "Pode indicar arritmia descompensada, com risco de baixo débito cardíaco. Vertigem de rodar costuma ser do ouvido.",
    quando: (c) => c.cond("arritmia") && (c.algumSym(["desmaio", "palpitacao"]) || c.sym("tontura", [1, 2])),
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
    titulo: "Marca-passo ou stent + dor no peito, palpitação ou desmaio",
    porque: "Pode indicar falha do dispositivo, obstrução do stent ou novo evento coronariano.",
    quando: (c) => c.cond("marcapasso_stent") && c.algumSym(["dor_peito", "palpitacao", "desmaio"]),
  },
  {
    id: "ic_descompensada",
    nivel: "hospital",
    titulo: "Insuficiência cardíaca + falta de ar ou inchaço novo",
    porque: "Sugere congestão pulmonar/descompensação, que costuma exigir diurético venoso.",
    quando: (c) => c.cond("insuf_cardiaca") && (c.sym("falta_ar") || c.sym("inchaco_mmii", [1, 2])),
  },
  {
    id: "diabetes_abdome",
    nivel: "hospital",
    titulo: "Diabetes com insulina (ou glicose ≥ 250) + vômito + dor abdominal",
    porque: "Tríade compatível com cetoacidose diabética.",
    quando: (c) =>
      c.cond("diabetes") &&
      c.sym("nausea_vomito") &&
      c.sym("dor_barriga") &&
      (c.usaInsulina() || (c.glicoseValor() ?? 0) >= 250),
  },
  {
    id: "diabetes_abdome_leve",
    nivel: "upa",
    titulo: "Diabetes + vômito + dor abdominal",
    porque: "Medir a glicemia e a hidratação no mesmo dia.",
    quando: (c) => c.cond("diabetes") && c.sym("nausea_vomito") && c.sym("dor_barriga"),
  },
  {
    id: "apetite_diabetes",
    nivel: "upa",
    titulo: "Diabetes + quase não come",
    porque: "Sem se alimentar, dá hipoglicemia em quem usa medicação e desidratação com descompensação nos demais.",
    quando: (c) => c.cond("diabetes") && c.symGrave("perda_apetite"),
  },
  {
    id: "corticoide_estresse",
    nivel: "upa",
    titulo: "Corticoide crônico ou insuficiência adrenal + vômito, diarreia ou febre",
    porque: "Mesmo sintomas leves podem desencadear crise adrenal em quem usa corticoide crônico.",
    quando: (c) => c.algumCond(CORTICOIDE) && c.algumSym(["nausea_vomito", "diarreia", "febre_hipotermia"]),
  },
  {
    id: "crise_adrenal",
    nivel: "samu_hospital",
    titulo: "Corticoide crônico ou insuficiência adrenal + vômito/diarreia + desmaio, pressão baixa ou confusão",
    porque: "Quadro compatível com crise adrenal: precisa de hidrocortisona venosa já.",
    quando: (c) =>
      c.algumCond(CORTICOIDE) &&
      c.algumSym(["nausea_vomito", "diarreia"]) &&
      (c.algumSym(["desmaio", "alteracao_consciencia"]) || !!c.hipotensao()),
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
    id: "renal_hipercalemia",
    nivel: "hospital",
    titulo: "Doença renal crônica ou diálise + palpitação, desmaio ou FC alterada (ou fraqueza em quem faz diálise)",
    porque: "Pode ser hipercalemia, que causa arritmia grave. Cansaço sozinho é comum na doença renal e só pesa em quem faz diálise.",
    quando: (c) =>
      c.algumCond(["dialise", "doenca_renal_cronica"]) &&
      (c.algumSym(["palpitacao", "desmaio"]) ||
        c.sym("frequencia_cardiaca", [1, 2]) ||
        (c.cond("dialise") && c.sym("cansaco_muscular"))),
  },
  {
    id: "cirrose_hemorragia",
    nivel: "samu_hospital",
    titulo: "Cirrose + vômito com sangue ou fezes escuras",
    porque: "Compatível com hemorragia digestiva alta por varizes — risco imediato de vida.",
    quando: (c) => c.cond("cirrose") && c.symGrave("vomito_sangue"),
  },
  {
    id: "cirrose_febre",
    nivel: "hospital",
    titulo: "Cirrose + febre",
    porque: "Pode ser peritonite bacteriana espontânea, que exige antibiótico venoso e punção.",
    quando: (c) => c.cond("cirrose") && c.sym("febre_hipotermia"),
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
    nivel: "upa",
    titulo: "Epilepsia + convulsão",
    porque: "Crise habitual com recuperação completa pode ser avaliada na UPA; crise longa ou sem recuperar a consciência é emergência.",
    quando: (c) => c.cond("epilepsia") && c.sym("convulsao"),
  },
  {
    id: "convulsao_sem_recuperar",
    nivel: "samu_hospital",
    titulo: "Convulsão + não voltou ao normal (alteração de consciência)",
    porque: "Pode ser estado de mal epiléptico.",
    quando: (c) => c.sym("convulsao") && c.sym("alteracao_consciencia"),
  },
  {
    id: "falciforme_crise",
    nivel: "hospital",
    titulo: "Anemia falciforme + febre, dor ou falta de ar",
    porque: "Alto risco de infecção grave, crise vaso-oclusiva e síndrome torácica aguda.",
    quando: (c) =>
      c.cond("anemia_falciforme") &&
      c.algumSym(["febre_hipotermia", "dor_peito", "falta_ar", "dor_barriga", "dor_articulacoes", "dor_fim_costas"]),
  },
  {
    id: "anticoagulado_sangramento",
    nivel: "hospital",
    titulo: "Anticoagulante, antiagregante ou coagulopatia + sangramento, batida ou ferida grande",
    porque: "Sangramentos e traumas podem se tornar graves sem coagulação normal (batida na cabeça pede tomografia).",
    quando: (c) =>
      c.algumCond(SANGRAMENTO_RISCO) && (c.algumSym(["sangramento_geral", "batida"]) || c.sym("ferida", [1, 2, 3])),
  },
  {
    id: "anticoagulado_sangue_urina_fezes",
    nivel: "upa",
    titulo: "Anticoagulante, antiagregante ou coagulopatia + sangue na urina ou nas fezes",
    porque: "Mesmo pouco sangue pede checar a coagulação e a dose do remédio no mesmo dia.",
    quando: (c) => c.algumCond(SANGRAMENTO_RISCO) && c.algumSym(["sangue_urina", "vomito_sangue"]),
  },
  {
    id: "coagulopatia_articulacao",
    nivel: "upa",
    titulo: "Distúrbio de coagulação / hemofilia + dor na articulação",
    porque: "Pode ser sangramento dentro da articulação, que precisa de reposição de fator.",
    quando: (c) => c.cond("disturbio_coagulacao") && c.sym("dor_articulacoes"),
  },
  {
    id: "petequias_risco",
    nivel: "hospital",
    titulo: "Manchas que não somem ao apertar + anticoagulante, coagulopatia ou câncer em tratamento",
    porque: "Nesse contexto sugerem plaquetas baixas ou coagulação alterada, com risco de sangramento grave.",
    quando: (c) => c.sym("petequias") && c.algumCond([...SANGRAMENTO_RISCO, "cancer_tratamento"]),
  },
  {
    id: "petequias_sangramento",
    nivel: "hospital",
    titulo: "Manchas que não somem ao apertar + sangramento",
    porque: "Sugere plaquetas muito baixas: risco de sangramento grave.",
    quando: (c) =>
      c.sym("petequias") &&
      (c.sym("sangramento_geral") || c.sym("sangue_urina") || c.sym("vomito_sangue") || c.sym("sangramento_vaginal_peniano")),
  },
  {
    id: "anticoagulado_ferida",
    nivel: "upa",
    titulo: "Anticoagulante, antiagregante ou coagulopatia + ferida pequena",
    porque: "Comprimir por 10 minutos; se não parar, vale a regra de sangramento.",
    quando: (c) => c.algumCond(SANGRAMENTO_RISCO) && c.sym("ferida", [0]),
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
    nivel: "samu_hospital",
    titulo: "Dor no peito + falta de ar + sudorese ou náusea",
    porque: "Conjunto clássico de síndrome coronariana aguda; o SAMU faz o ECG já no transporte.",
    quando: (c) => c.sym("dor_peito") && c.sym("falta_ar") && c.algumSym(["suando", "nausea_vomito"]),
  },
  {
    id: "dor_peito_sincope",
    nivel: "samu_hospital",
    titulo: "Dor no peito + desmaio",
    porque: "Pode ser infarto com arritmia, dissecção de aorta ou embolia pulmonar grave.",
    quando: (c) => c.sym("dor_peito") && c.sym("desmaio"),
  },
  {
    id: "cefaleia_thunderclap",
    nivel: "hospital",
    titulo: "Dor de cabeça súbita e forte + alteração visual",
    porque: "Pode indicar hemorragia intracraniana.",
    quando: (c) => c.symGrave("dor_cabeca") && c.sym("alteracao_visual"),
  },
  {
    id: "cefaleia_consciencia",
    nivel: "samu_hospital",
    titulo: "Dor de cabeça súbita e forte + alteração de consciência",
    porque: "Hemorragia intracraniana com rebaixamento: tempo é decisivo.",
    quando: (c) => c.symGrave("dor_cabeca") && c.sym("alteracao_consciencia"),
  },
  {
    id: "febre_consciencia",
    nivel: "samu_hospital",
    titulo: "Febre + alteração de consciência",
    porque: "Combinação sugestiva de meningite, encefalite ou sepse.",
    quando: (c) => c.sym("febre_hipotermia") && c.sym("alteracao_consciencia"),
  },
  {
    id: "febre_petequias_nuca",
    nivel: "samu_hospital",
    titulo: "Febre + manchas que não somem ao apertar ou pescoço duro",
    porque: "Meningite ou meningococcemia até prova em contrário — antibiótico na primeira hora.",
    quando: (c) => c.sym("febre_hipotermia") && c.algumSym(["petequias", "rigidez_nuca"]),
  },
  {
    id: "febre_sangramento",
    nivel: "hospital",
    titulo: "Febre + sangramento",
    porque: "Sangramento de mucosa é sinal de alarme na dengue (e em febres hemorrágicas).",
    quando: (c) => c.sym("febre_hipotermia") && c.algumSym(["sangramento_geral", "petequias"]),
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
    titulo: "Sangramento ou ferida grande + tontura ou desmaio",
    porque: "Sinais de perda de sangue significativa com repercussão circulatória.",
    quando: (c) =>
      (c.sym("sangramento_geral") ||
        c.sym("ferida", [1, 2, 3]) ||
        c.symGrave("sangramento_vaginal_peniano") ||
        c.symGrave("vomito_sangue")) &&
      c.algumSym(["tontura", "desmaio"]),
  },
  {
    id: "choque_hemorragico",
    nivel: "samu_hospital",
    titulo: "Hemorragia + desmaio, confusão ou pressão baixa",
    porque: "Choque hemorrágico: controle do sangramento e reposição imediata.",
    quando: (c) =>
      (c.symGrave("sangramento_geral") ||
        c.sym("ferida", [1, 2]) ||
        c.symGrave("vomito_sangue") ||
        c.symGrave("sangramento_vaginal_peniano")) &&
      (c.algumSym(["desmaio", "alteracao_consciencia"]) || !!c.hipotensao()),
  },
  {
    id: "consciencia_autonomico",
    nivel: "hospital",
    titulo: "Alteração de consciência + sudorese ou palpitação",
    porque: "Pode indicar hipoglicemia, arritmia ou choque em instalação.",
    quando: (c) => c.sym("alteracao_consciencia") && c.algumSym(["suando", "palpitacao"]),
  },
  {
    id: "apetite_desidratacao",
    nivel: "upa",
    titulo: "Quase não come nem bebe + vômito ou diarreia",
    porque: "Sem entrada de líquido e com perda em curso, a desidratação se instala em poucas horas.",
    quando: (c) => c.symGrave("perda_apetite") && c.algumSym(["nausea_vomito", "diarreia"]),
  },
  {
    id: "apetite_ictericia",
    nivel: "upa",
    titulo: "Perda de apetite + pele amarelada que surgiu agora",
    porque: "A dupla sugere problema ativo no fígado, na vesícula ou no pâncreas. Pele amarelada que já vinha de antes não conta.",
    quando: (c) => c.sym("perda_apetite") && c.sym("pele_amarelada", [1, 2]),
  },

  {
    id: "hipoglicemia_neuro",
    nivel: "samu_hospital",
    titulo: "Glicose abaixo de 70 + confusão, sonolência ou convulsão",
    porque: "Hipoglicemia com sintomas neurológicos: risco de lesão cerebral. Se a pessoa consegue engolir, dê açúcar agora.",
    quando: (c) => c.sym("glicose", [1]) && c.algumSym(["alteracao_consciencia", "convulsao"]),
  },
  {
    id: "hiperglicemia_sintomatica",
    nivel: "hospital",
    titulo: "Glicose ≥ 250 + vômito, dor abdominal, falta de ar ou confusão",
    porque: "Pode ser cetoacidose ou estado hiperosmolar.",
    quando: (c) =>
      (c.glicoseValor() ?? 0) >= 250 &&
      c.algumSym(["nausea_vomito", "dor_barriga", "falta_ar", "alteracao_consciencia"]),
  },
  {
    id: "hiperglicemia_muito_alta",
    nivel: "upa",
    titulo: "Glicose 300 ou mais",
    porque: "Hiperglicemia acentuada: avaliar hidratação e cetonas no mesmo dia.",
    quando: (c) => (c.glicoseValor() ?? 0) >= 300,
  },
  {
    id: "choque",
    nivel: "hospital",
    titulo: "Pressão baixa + tontura, desmaio, suor frio ou coração acelerado",
    porque: "Hipotensão com sintomas sugere choque (desidratação, sangramento, sepse, causa cardíaca).",
    quando: (c) =>
      !!c.hipotensao() &&
      (c.algumSym(["tontura", "desmaio"]) || c.sym("suando", [1]) || c.sym("frequencia_cardiaca", [1, 2])),
  },
  {
    id: "choque_consciencia",
    nivel: "samu_hospital",
    titulo: "Pressão baixa + alteração de consciência",
    porque: "Choque com hipoperfusão cerebral.",
    quando: (c) => !!c.hipotensao() && c.sym("alteracao_consciencia"),
  },
  {
    id: "hipotensao_medida",
    nivel: "upa",
    titulo: "Pressão medida abaixo do esperado para a idade",
    porque: "Mesmo sem sintomas, pede reavaliação de remédios e hidratação no mesmo dia.",
    quando: (c) => ["hipotensão", "hipotensão grave"].includes(c.hipotensao()),
  },
  {
    id: "emergencia_hipertensiva",
    nivel: "hospital",
    titulo: "Pressão muito alta + dor no peito, falta de ar, alteração visual ou neurológica",
    porque: "Sinais de lesão de órgão-alvo: emergência hipertensiva, com ou sem hipertensão já conhecida.",
    quando: (c) =>
      (c.pressaoEstagio() === "hipertensão 3" ||
        (c.pressaoBanda() !== "adulto" && ["hipertensão 2", "hipertensão"].includes(c.pressaoEstagio()))) &&
      (c.algumSym(["dor_peito", "falta_ar", "alteracao_visual", "alteracao_consciencia", "deficit_focal"]) ||
        c.sym("dor_cabeca", [0])),
  },

  /* ---------- Animais peçonhentos (índices da sub-pergunta de picada) ---------- */
  {
    id: "escorpiao_grave",
    nivel: "hospital",
    titulo: "Escorpião + criança (menos de 10 anos) ou vômito, suor, palpitação",
    porque: "Escorpionismo em criança ou com sinais sistêmicos pode precisar de soro; o soro fica no hospital de referência.",
    quando: (c) =>
      c.sym("picada_mordida", [2]) &&
      ((typeof c.idade === "number" && c.idade < 10) ||
        c.algumSym(["nausea_vomito", "suando", "palpitacao", "falta_ar"])),
  },
  {
    id: "lonomia_sangramento",
    nivel: "hospital",
    titulo: "Lagarta/taturana ou cobra + sangramento",
    porque: "Distúrbio de coagulação pelo veneno: soro em hospital de referência.",
    quando: (c) =>
      c.sym("picada_mordida", [1, 4, 6]) && c.algumSym(["sangramento_geral", "sangue_urina", "vomito_sangue"]),
  },
  {
    id: "aranha_crianca",
    nivel: "hospital",
    titulo: "Aranha + criança (menos de 10 anos)",
    porque: "Crianças têm mais risco de forma grave (armadeira, aranha-marrom).",
    quando: (c) => c.sym("picada_mordida", [3]) && typeof c.idade === "number" && c.idade < 10,
  },

  /* ---------- Perfil × sintoma ---------- */
  {
    id: "neonato_sinal_alarme",
    nivel: "hospital",
    titulo: "Recém-nascido + febre, vômito, diarreia, pele amarelada, perda de apetite ou suor frio",
    porque: "No período neonatal, esses sinais podem indicar infecção grave e desidratam rápido; mamar menos costuma ser o primeiro sinal. Suor frio no recém-nascido sugere problema no coração ou glicose baixa.",
    quando: (c) =>
      c.subpopulacao === "neonatal" &&
      (c.algumSym(["febre_hipotermia", "nausea_vomito", "diarreia", "pele_amarelada", "perda_apetite"]) || c.sym("suando", [1])),
  },
  {
    id: "bebe_respiratorio",
    nivel: "hospital",
    titulo: "Bebê com menos de 3 meses + falta de ar",
    porque: "Nessa idade a bronquiolite e a pneumonia cansam o bebê rápido e podem causar pausas na respiração.",
    quando: (c) => c.bebeMenos3m() && c.sym("falta_ar"),
  },
  {
    id: "bebe_tosse",
    nivel: "upa",
    titulo: "Bebê com menos de 3 meses + tosse",
    porque: "Tosse nessa idade pede avaliação no mesmo dia (coqueluche, bronquiolite).",
    quando: (c) => c.bebeMenos3m() && c.sym("tosse"),
  },
  {
    id: "bebe_nao_mama",
    nivel: "hospital",
    titulo: "Bebê com menos de 3 meses que quase não mama",
    porque: "Recusar o peito/mamadeira nessa idade costuma ser o primeiro sinal de infecção grave ou desidratação.",
    quando: (c) => c.bebeMenos3m() && c.symGrave("perda_apetite"),
  },
  {
    id: "bebe_ictericia",
    nivel: "upa",
    titulo: "Bebê com menos de 3 meses + pele amarelada",
    porque: "Icterícia que persiste depois das 2 semanas de vida precisa de exame no mesmo dia (descartar problema no fígado ou nas vias biliares).",
    quando: (c) => c.bebeMenos3m() && c.sym("pele_amarelada"),
  },
  {
    id: "bebe_sangue_fezes",
    nivel: "upa",
    titulo: "Bebê com menos de 3 meses + sangue nas fezes",
    porque: "Precisa de avaliação no mesmo dia (alergia à proteína do leite, infecção, invaginação).",
    quando: (c) => c.bebeMenos3m() && c.sym("vomito_sangue"),
  },
  {
    id: "bebe_hipotermia",
    nivel: "hospital",
    titulo: "Bebê com menos de 1 ano + hipotermia",
    porque: "Temperatura baixa no bebê pode ser sinal de infecção grave.",
    quando: (c) => c.idade === 0 && c.sym("febre_hipotermia", [3]),
  },
  {
    id: "bebe_queimadura",
    nivel: "hospital",
    titulo: "Bebê com menos de 1 ano + queimadura média ou grave",
    porque: "No bebê, uma área pequena já é proporcionalmente grande e desidrata rápido.",
    quando: (c) => c.idade === 0 && c.sym("queimadura", [1, 2, 3]),
  },
  {
    id: "queimadura_febre",
    nivel: "hospital",
    titulo: "Queimadura média ou grave + febre",
    porque: "Pode ser infecção da queimadura.",
    quando: (c) => c.sym("queimadura", [1, 2, 3]) && c.sym("febre_hipotermia", [0, 1, 2, 4]),
  },
  {
    id: "lactente_jovem_febre",
    nivel: "hospital",
    titulo: "Bebê com menos de 3 meses + febre",
    porque: "Febre a partir de 38 °C nessa idade exige avaliação médica imediata (risco de infecção bacteriana grave).",
    quando: (c) =>
      c.idade === 0 &&
      (c.semanasBebe === "nao_sei" || (typeof c.semanasBebe === "number" && c.semanasBebe < 13)) &&
      c.sym("febre_hipotermia"),
  },
  {
    id: "idoso_consciencia",
    nivel: "samu_hospital",
    titulo: "Idoso + alteração de consciência",
    porque: "No idoso, confusão aguda costuma ser a única manifestação de AVC, sepse ou infarto.",
    quando: (c) => c.populacao === "idoso_clinico" && c.sym("alteracao_consciencia"),
  },
  {
    id: "idoso_queda",
    nivel: "hospital",
    titulo: "Idoso + batida ou queda",
    porque: "No idoso, quedas escondem fratura de fêmur e sangramento na cabeça com frequência.",
    quando: (c) => c.populacao === "idoso_clinico" && c.sym("batida"),
  },
  {
    id: "idoso_dor_peito_dispneia",
    nivel: "hospital",
    titulo: "Idoso + dor no peito + falta de ar",
    porque: "No idoso a dupla costuma ser infarto, embolia ou insuficiência cardíaca.",
    quando: (c) => c.populacao === "idoso_clinico" && c.sym("dor_peito") && c.sym("falta_ar"),
  },
  {
    id: "idoso_febre_dispneia",
    nivel: "hospital",
    titulo: "Idoso + febre + falta de ar",
    porque: "Pneumonia com desconforto respiratório no idoso costuma precisar de internação.",
    quando: (c) => c.populacao === "idoso_clinico" && c.sym("febre_hipotermia") && c.sym("falta_ar"),
  },
  {
    id: "idoso_febre_urinaria",
    nivel: "upa",
    titulo: "Idoso + febre + dor ao urinar ou dor nos rins",
    porque: "Infecção urinária com febre no idoso pode virar sepse rápido.",
    quando: (c) => c.populacao === "idoso_clinico" && c.sym("febre_hipotermia") && c.algumSym(["dor_urinar", "dor_lombar_rim"]),
  },
  {
    id: "idoso_febre_respiratoria",
    nivel: "upa",
    titulo: "Idoso + febre + tosse ou falta de ar",
    porque: "Pneumonia no idoso evolui rápido; saturação e exame no mesmo dia.",
    quando: (c) => c.populacao === "idoso_clinico" && c.sym("febre_hipotermia") && c.algumSym(["tosse", "falta_ar"]),
  },
  {
    id: "gestante_trauma",
    nivel: "hospital",
    titulo: "Gestante + batida ou ferida",
    porque: "Trauma na gestação pede avaliação obstétrica e monitorização do bebê, mesmo sem sangramento.",
    quando: (c) => c.subpopulacao === "gravida" && (c.sym("batida") || c.sym("ferida", [1, 2, 3])),
  },
  {
    id: "hemorragia_pos_parto",
    nivel: "samu_hospital",
    titulo: "Puerpério imediato + sangramento intenso + tontura ou desmaio",
    porque: "Hemorragia pós-parto com repercussão circulatória.",
    quando: (c) =>
      c.puerperio === "imediato" &&
      c.symGrave("sangramento_vaginal_peniano") &&
      c.algumSym(["tontura", "desmaio", "alteracao_consciencia"]),
  },
  {
    id: "apetite_crianca",
    nivel: "upa",
    titulo: "Criança + quase não come nem bebe",
    porque: "A reserva de água e de açúcar da criança é pequena: desidrata e tem queda de glicose bem antes de um adulto.",
    quando: (c) => c.populacao === "crianca_clinica" && c.symGrave("perda_apetite"),
  },
  {
    id: "apetite_idoso",
    nivel: "upa",
    titulo: "Idoso + quase não come nem bebe",
    porque: "No idoso parar de comer costuma ser o primeiro sinal de infecção ou descompensação, muitas vezes sem febre.",
    quando: (c) => c.populacao === "idoso_clinico" && c.symGrave("perda_apetite"),
  },
  {
    id: "gestante_convulsao",
    nivel: "hospital",
    titulo: "Gestante + convulsão",
    porque: "Qualquer convulsão na gestação pede avaliação hospitalar (mãe e bebê), mesmo em quem já tem epilepsia.",
    quando: (c) => c.subpopulacao === "gravida" && c.sym("convulsao"),
  },
  {
    id: "obstetrica_tep",
    nivel: "hospital",
    titulo: "Gestante ou puérpera + falta de ar",
    porque: "Gestação e pós-parto aumentam muito o risco de embolia pulmonar e de doença do coração da gravidez.",
    quando: (c) => c.gestanteOuPuerpera() && c.sym("falta_ar") && (c.sym("dor_peito") || c.subpopulacao === "puerperio"),
  },
  {
    id: "eclampsia",
    nivel: "samu_hospital",
    titulo: "Gestante (2º/3º trimestre) ou puérpera + convulsão",
    porque: "Convulsão nessa fase é eclâmpsia até prova em contrário: sulfato de magnésio e parto.",
    quando: (c) =>
      ((c.subpopulacao === "gravida" && c.gravidaTempo !== 1) ||
        (c.subpopulacao === "puerperio" && c.puerperio !== "remoto")) &&
      c.sym("convulsao"),
  },
  {
    id: "gestante_preeclampsia",
    nivel: "samu_hospital",
    titulo: "Gestante/puérpera + dor de cabeça + alteração visual, ou pressão ≥ 160/110 com sintoma",
    porque: "Sinais de pré-eclâmpsia grave, com risco de eclâmpsia.",
    quando: (c) =>
      c.gestanteOuPuerpera() &&
      ((c.sym("dor_cabeca") && c.sym("alteracao_visual")) ||
        (c.paAtinge(160, 110) && c.algumSym(["dor_cabeca", "alteracao_visual", "dor_barriga"]))),
  },
  {
    id: "gestante_hipertensao",
    nivel: "hospital",
    titulo: "Gestante/puérpera + pressão ≥ 140/90",
    porque: "Investigar pré-eclâmpsia em maternidade no mesmo dia, com ou sem hipertensão prévia.",
    quando: (c) => c.gestanteOuPuerpera() && c.paAtinge(140, 90),
  },
  {
    id: "gestante_sangramento_grave",
    nivel: "samu_hospital",
    titulo: "Gestante + sangramento vaginal intenso ou doloroso",
    porque: "Pode indicar descolamento de placenta ou outra emergência obstétrica.",
    quando: (c) => c.subpopulacao === "gravida" && c.symGrave("sangramento_vaginal_peniano"),
  },
  {
    id: "gestante_sangramento",
    nivel: "hospital",
    titulo: "Gestante + sangramento vaginal",
    porque: "Precisa de avaliação obstétrica no mesmo dia.",
    quando: (c) => c.subpopulacao === "gravida" && c.sym("sangramento_vaginal_peniano"),
  },
  {
    id: "possivel_ectopica",
    nivel: "hospital",
    titulo: "Possível gravidez + dor na barriga + sangramento vaginal",
    porque: "Gravidez ectópica precisa ser descartada no mesmo dia (β-hCG e ultrassom).",
    quando: (c) =>
      c.subpopulacao === "possivel_gravida" && c.sym("dor_barriga") && c.sym("sangramento_vaginal_peniano"),
  },
  {
    id: "gestante_cefaleia",
    nivel: "upa",
    titulo: "Gestante (2º/3º trimestre) ou puérpera + dor de cabeça",
    porque: "A pressão precisa ser medida no mesmo dia para afastar pré-eclâmpsia.",
    quando: (c) =>
      ((c.subpopulacao === "gravida" && c.gravidaTempo !== 1) ||
        (c.subpopulacao === "puerperio" && c.puerperio !== "remoto")) &&
      c.sym("dor_cabeca"),
  },
  {
    id: "gestante_febre",
    nivel: "upa",
    titulo: "Gestante + febre",
    porque: "Febre na gestação pede investigação no mesmo dia (infecção urinária, corioamnionite, arboviroses).",
    quando: (c) => c.subpopulacao === "gravida" && c.sym("febre_hipotermia"),
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
  {
    id: "puerperio_febre",
    nivel: "upa",
    titulo: "Puerpério (até 6 semanas) + febre",
    porque: "Endometrite, infecção da ferida ou mastite precisam de avaliação no mesmo dia.",
    quando: (c) => c.subpopulacao === "puerperio" && c.puerperio === "tardio" && c.sym("febre_hipotermia"),
  },

  /* ---------- Pressão arterial × idade (sem diagnóstico prévio) ----------
     Estágios 1 e 2 assintomáticos voltam para a UBS (confirmar o diagnóstico
     com MRPA/MAPA); estágio 3 assintomático vai à UPA; com sintoma, vale
     a regra de emergência hipertensiva acima. */
  {
    id: "pa_neonatal_hipertensao",
    nivel: "hospital",
    titulo: "Pressão em nível de hipertensão (até 1 ano, sem diagnóstico prévio)",
    porque: "Em bebês até 1 ano sem hipertensão conhecida, esse nível de pressão pede avaliação hospitalar.",
    quando: (c) => c.pressaoBanda() === "neonatal" && c.historicoRespondido() && !c.cond("hipertensao") && c.pressaoEstagio() === "hipertensão",
  },
  {
    id: "pa_crianca_hipertensao2",
    nivel: "upa",
    titulo: "Pressão em hipertensão estágio 2 (1 a 17 anos, sem diagnóstico prévio)",
    porque: "Sem hipertensão conhecida, esse nível pede avaliação no mesmo dia.",
    quando: (c) =>
      c.pressaoBanda() === "crianca" && c.historicoRespondido() && !c.cond("hipertensao") && c.pressaoEstagio() === "hipertensão 2",
  },
  {
    id: "pa_adulto_hipertensao3",
    nivel: "upa",
    titulo: "Pressão em hipertensão estágio 3 (18 anos ou mais, sem diagnóstico prévio)",
    porque: "Sem sintomas, é urgência hipertensiva: avaliação no mesmo dia.",
    quando: (c) => c.pressaoBanda() === "adulto" && c.historicoRespondido() && !c.cond("hipertensao") && c.pressaoEstagio() === "hipertensão 3",
  },
];

/* ------------------------------ Avaliação -------------------------------- */

function avaliaSinergias(state, baseDestino) {
  const c = criaContexto(state);

  const disparadas = SINERGIAS.filter((regra) => {
    try {
      return regra.quando(c);
    } catch (e) {
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

/* Alguma regra de SAMU ainda pode disparar com o que falta perguntar?
   Testa a regra em perfis hipotéticos que preenchem só os blocos ainda não
   respondidos (idade, sexo/gestação, histórico). Se nenhum perfil possível
   leva ao SAMU, a triagem pode parar no hospital sem perder nada. */
function samuAindaPossivel(state) {
  const regrasSamu = SINERGIAS.filter((r) => r.nivel === "samu_hospital");

  const idades = state.idadeRespondida
    ? [{}]
    : [
        { idade: 30, populacao: "adulto_clinico" },
        { idade: 60, populacao: "idoso_clinico" },
        { idade: 0, populacao: "crianca_clinica", subpopulacao: "neonatal", semanas_bebe: 1 },
      ];
  const sexos = state.generoRespondido
    ? [{}]
    : [
        {},
        { subpopulacao: "gravida", gravida_tempo: 3 },
        { subpopulacao: "puerperio", puerperio: "imediato" },
        { subpopulacao: "possivel_gravida" },
      ];
  let comorbidades = state.comorbidades;
  if (!state.comorbidadesRespondidas) {
    comorbidades = {};
    COMORBIDITY_CATEGORIES.forEach((cat) =>
      cat.items.forEach((it) => (comorbidades[it.id] = { checked: true, extraValue: true }))
    );
  }

  for (const a of idades) {
    for (const b of sexos) {
      const hip = { ...state, ...a, ...b, comorbidades, comorbidadesRespondidas: true };
      const c = criaContexto(hip);
      if (regrasSamu.some((r) => { try { return r.quando(c); } catch (e) { return false; } })) return true;
    }
  }
  return false;
}
