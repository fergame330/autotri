"use strict";

/* =========================================================================
   AUTO TRIAGEM
   - Sem login, sem backend, sem persistência (localStorage/cookies).
   - Todo o estado vive apenas em memória (variável JS `state`).
   - Recarregar ou fechar a página apaga tudo.
   ========================================================================= */

/* ---------------------------- Dados clínicos ---------------------------- */

const SYMPTOM_CATEGORIES = [
  {
    title: "Geral / Sistêmico",
    curto: "Geral",
    icon: "M14.1 14.7V5.5a2.1 2.1 0 1 0-4.2 0v9.2a4 4 0 1 0 4.2 0Z",
    items: [
      {
        id: "febre_hipotermia",
        label: "Febre e/ou hipotermia",
        painel: "febre",
        sub: {
          options: [
            { label: "Febre baixa", code: [0], casa: true },
            { label: "Febre moderada", code: [1] },
            { label: "Febre muito alta", code: [1] },
            { label: "Hipotermia", code: [1] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      {
        id: "pressao_arterial",
        label: "Pressão alta / baixa",
        painel: "pressao",
        sub: {
          options: [
            { label: "Está alta", code: [0] },
            { label: "Está baixa", code: [0], hipo: true },
            { label: "Não sei", code: [0] },
          ],
        },
      },
      {
        id: "spo2",
        label: "Saturação de oxigênio (SpO2)",
        painel: "oximetro",
        sub: {
          options: [
            { label: "94% ou mais — saturação normal", code: [0], casa: true },
            { label: "90% a 93% — hipoxemia leve", code: [1] },
            { label: "Abaixo de 90% — hipoxemia grave", code: [1, 2] },
            { label: "Não consegui medir", code: [0] },
          ],
        },
      },
      {
        id: "frequencia_cardiaca",
        label: "Frequência cardíaca (FC)",
        painel: "oximetro",
        sub: {
          options: [
            { label: "Normal para a idade", code: [0], casa: true },
            { label: "Um pouco baixa ou alta para a idade", code: [1] },
            { label: "Muito baixa ou muito alta para a idade", code: [1, 2] },
            { label: "Não consegui medir", code: [0] },
          ],
        },
      },
      {
        id: "glicose",
        label: "Glicose (glicemia)",
        painel: "glicose",
        sub: {
          options: [
            { label: "Dentro do esperado para a faixa", code: [0], casa: true },
            { label: "Abaixo de 70 mg/dL — hipoglicemia", code: [1] },
            { label: "Acima do esperado para a faixa", code: [0] },
            { label: "Bem acima do esperado para a faixa", code: [0] },
            { label: "Não consegui medir", code: [0] },
          ],
        },
      },
      { id: "cansaco_muscular", label: "Cansaço muscular", code: [0] },
      { id: "perda_peso", label: "Perda de peso não intencional", code: [0] },
      {
        id: "inchaco_mmii",
        label: "Inchaço dos membros inferiores",
        sub: {
          options: [
            { label: "Já é normal há muito tempo", code: [0] },
            { label: "Primeira vez / acontece com pouca frequência", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "dor_garganta",
        label: "Dor de garganta",
        sub: {
          options: [
            { label: "Garganta não obstruída", code: [0] },
            { label: "Garganta obstruída", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "alergia",
        label: "Alergia",
        sub: {
          options: [
            { label: "Leve (coceira, espirros e/ou poucas manchas)", code: [0] },
            { label: "Moderada (inchaço e/ou manchas espalhadas)", code: [1] },
            { label: "Grave (falta de ar e/ou inchaço na boca ou garganta)", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "suando",
        label: "Suando de mais e/ou suando frio",
        sub: {
          options: [
            { label: "É frequente", code: [0] },
            { label: "Aconteceu do nada", code: [1] },
          ],
        },
      },
    ],
  },
  {
    title: "Cardiovascular / Respiratório",
    curto: "Cardio / Resp.",
    icon: "M12 20.3 4.9 13.2a4.6 4.6 0 0 1 6.5-6.5l.6.6.6-.6a4.6 4.6 0 0 1 6.5 6.5Z",
    items: [
      { id: "dor_peito", label: "Dor no peito", code: [1] },
      { id: "falta_ar", label: "Falta de ar", code: [1] },
      {
        id: "palpitacao",
        label: "Coração batendo mais forte e/ou mais rápido",
        sub: {
          options: [
            { label: "Frequente", code: [0] },
            { label: "Do nada", code: [1] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      { id: "desmaio", label: "Desmaio / Pré-desmaio", code: [1] },
      {
        id: "tosse",
        label: "Tosse",
        sub: {
          options: [
            { label: "Com sangue", code: [1] },
            { label: "Sem sangue", code: [0] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
    ],
  },
  {
    title: "Neurológico",
    curto: "Neuro",
    icon: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z@@M13 7.4 9.7 12.5h3.2l-1 4.1",
    items: [
      {
        id: "dor_cabeca",
        label: "Dor de cabeça",
        sub: {
          options: [
            { label: "Veio do nada, muito forte", code: [1, 2] },
            { label: "Veio aos poucos e/ou já é frequente", code: [0] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      {
        id: "tontura",
        label: "Tontura",
        sub: {
          options: [
            { label: "Sensação de rotação, com ou sem zumbido no ouvido, sem outros sinais mais graves", code: [0] },
            { label: "Falta de coordenação e/ou desequilíbrio e/ou passo cambaleante", code: [1, 2] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      { id: "alteracao_consciencia", label: "Alteração de consciência", code: [1, 2] },
      {
        id: "convulsao",
        label: "Convulsão",
        sub: {
          options: [
            { label: "Primeira vez", code: [1, 2] },
            { label: "Frequente", code: [1] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "alteracao_visual",
        label: "Alteração visual",
        sub: {
          options: [
            { label: "Perda súbita da visão, em um ou nos dois olhos", code: [1, 2] },
            { label: "Visão turva, embaçada ou dupla", code: [1] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      {
        id: "deficit_focal",
        label: "Fraqueza ou dormência de um lado do corpo, boca torta ou fala enrolada (começou de repente)",
        code: [1, 2],
      },
      { id: "rigidez_nuca", label: "Pescoço duro (não consegue encostar o queixo no peito)", code: [1, 2] },
    ],
  },
  {
    title: "Saúde mental",
    curto: "Saúde mental",
    icon: "M20.5 12.4c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.3L4.5 21l1.3-3.6A6.9 6.9 0 0 1 3.5 12.4C3.5 8.4 7.3 5.2 12 5.2s8.5 3.2 8.5 7.2Z@@M12 15l-2-2a1.5 1.5 0 0 1 2-2.1 1.5 1.5 0 0 1 2 2.1Z",
    items: [
      {
        id: "ideacao_suicida",
        label: "Pensamentos de morte ou de tirar a própria vida",
        sub: {
          options: [
            { label: "Tenho tido esses pensamentos", code: [0], cvv: true, caps: true },
            { label: "Tenho um plano de como fazer", code: [1], cvv: true },
            { label: "Já tentei recentemente", code: [1, 2], cvv: true },
          ],
        },
      },
    ],
  },
  {
    title: "Gastrointestinal",
    curto: "Gastro",
    icon: "M8.2 4.4c0 3 .8 4 .8 6.4 0 2.9-2.3 3.4-2.3 5.4a3 3 0 0 0 5.9.6c.5-2 2-2.5 3.4-3.1 2-.9 3.2-2.4 3.2-4.6a6 6 0 0 0-11-4.7Z",
    items: [
      {
        id: "dor_barriga",
        label: "Dor na barriga (abdômen)",
        sub: {
          options: [
            { label: "Leve e/ou crônica", code: [0] },
            { label: "Forte e/ou do nada", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "nausea_vomito",
        label: "Náusea / vômito sem sangue",
        sub: {
          options: [
            { label: "Leve", code: [0] },
            { label: "Pessoa desidratada", code: [1, 2] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      {
        id: "perda_apetite",
        label: "Perda de apetite",
        sub: {
          options: [
            { label: "Come menos que o normal, mas segue comendo e bebendo", code: [0] },
            { label: "Quase não come há dias e/ou não consegue beber líquidos", code: [1] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      {
        id: "diarreia",
        label: "Diarreia",
        sub: {
          options: [
            { label: "Leve/moderada, sem perda excessiva de líquidos e/ou desidratação", code: [0] },
            { label: "Perda intensa de líquidos e/ou desidratação", code: [1, 2] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      {
        id: "constipacao",
        label: "Constipação",
        sub: {
          options: [
            { label: "Frequente e/ou leve", code: [0] },
            { label: "Alguma possível obstrução", code: [1, 2] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      { id: "intoxicacao", label: "Engoliu ou teve contato com remédio, veneno, produto de limpeza ou agrotóxico", code: [1, 2], ciatox: true },
      {
        id: "vomito_sangue",
        label: "Vômito com sangue / fezes muito escuras / fezes com sangue",
        sub: {
          options: [
            { label: "Vômito com sangue ou fezes pretas", code: [1, 2] },
            { label: "Muito sangue vivo nas fezes", code: [1, 2] },
            { label: "Pouco sangue vivo no papel ou nas fezes", code: [0] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "pele_amarelada",
        label: "Pele muito amarelada",
        sub: {
          options: [
            { label: "Frequente", code: [0] },
            { label: "Do nada", code: [1] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
    ],
  },
  {
    title: "Geniturinário",
    curto: "Geniturinário",
    icon: "M12 3.4s5.4 5.6 5.4 9.2a5.4 5.4 0 0 1-10.8 0C6.6 9 12 3.4 12 3.4Z",
    items: [
      { id: "dor_urinar", label: "Dor ao urinar", code: [0] },
      { id: "dor_testiculo", label: "Dor ou inchaço súbito no testículo / saco", code: [1, 2] },
      { id: "perda_controle_esfincter", label: "Perda do controle da urina ou das fezes, ou pernas fracas, que começou agora", code: [1, 2] },
      { id: "sinais_obstetricos", label: "Grávida: perda de líquido, contrações ou bebê mexendo menos", code: [1, 2] },
      {
        id: "sangue_urina",
        label: "Sangue na urina",
        sub: {
          options: [
            { label: "Leve", code: [0] },
            { label: "Doloroso e/ou com muito sangue", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      { id: "dor_lombar_rim", label: "Dor no fim das costas (próximo ao rim)", code: [1] },
      { id: "corrimento", label: "Corrimento na vagina/pênis", code: [0] },
      {
        id: "sangramento_vaginal_peniano",
        label: "Sangramento anormal na vagina/pênis",
        sub: {
          options: [
            { label: "Leve", code: [1] },
            { label: "Doloroso e/ou com muito sangue", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "sexo_desprotegido",
        label: "Sexo desprotegido",
        sub: {
          options: [
            { label: "Foi consensual", code: [1] },
            { label: "Não foi consensual", code: [1, 2], policia: true },
            { label: "Não sei", code: [1] },
          ],
        },
      },
    ],
  },
  {
    title: "Musculoesquelético / Trauma",
    curto: "Trauma",
    icon: "M4.6 14.2 9.8 19.4a3.7 3.7 0 0 0 5.2 0l4.4-4.4a3.7 3.7 0 0 0 0-5.2L14.2 4.6a3.7 3.7 0 0 0-5.2 0L4.6 9a3.7 3.7 0 0 0 0 5.2Z@@M9 9l6 6",
    items: [
      {
        id: "batida",
        label: "Batida",
        sub: {
          options: [
            { label: "Leve e em uma parte do corpo", code: [1] },
            { label: "Em mais de uma parte", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "dor_fim_costas",
        label: "Dor no fim das costas",
        sub: {
          options: [
            { label: "Leve", code: [0] },
            { label: "Moderada e/ou intensa", code: [1] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      { id: "dor_articulacoes", label: "Dor nas articulações (juntas do corpo)", code: [0] },
      {
        id: "sangramento_geral",
        label: "Sangramento",
        sub: {
          options: [
            { label: "Leve ou moderado", code: [1] },
            { label: "Grave (hemorragia)", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
    ],
  },
  {
    title: "Dermatológico",
    curto: "Pele",
    icon: "M12 3.5 3.5 8 12 12.5 20.5 8Z@@M3.6 12.2 12 16.6l8.4-4.4@@M3.6 16.1 12 20.5l8.4-4.4",
    items: [
      {
        id: "ferida",
        label: "Ferida",
        sub: {
          options: [
            { label: "Pequena e/ou média", code: [0] },
            { label: "Grande", code: [1, 2] },
            { label: "Tiro, ou facada/perfuração no peito, barriga, costas ou pescoço", code: [1, 2] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
      { id: "mancha", label: "Mancha", code: [0] },
      { id: "petequias", label: "Manchas roxas ou vermelhas que não somem ao apertar a pele", code: [1] },
      { id: "cianose", label: "Extremidades da pele ou boca azuladas", code: [1, 2] },
      {
        id: "queimadura",
        label: "Queimaduras e/ou insolação",
        sub: {
          options: [
            { label: "Leve e/ou pequena", code: [0] },
            { label: "Moderada e/ou média", code: [1] },
            { label: "Grave e/ou bem espalhada", code: [1, 2] },
            { label: "Não sei", code: [1, 2] },
          ],
        },
      },
      {
        id: "picada_mordida",
        label: "Picadas / mordida",
        sub: {
          options: [
            { label: "Inseto, cachorro, gato ou rato", code: [0] },
            { label: "Cobra", code: [1, 2] },
            { label: "Escorpião", code: [1] },
            { label: "Aranha", code: [1] },
            { label: "Lagarta / taturana", code: [1] },
            { label: "Morcego ou macaco", code: [1] },
            { label: "Não sei", code: [1] },
          ],
        },
      },
    ],
  },
];

const COMORBIDITY_CATEGORIES = [
  {
    title: "Cardiovascular",
    items: [
      { id: "hipertensao", label: "Hipertensão" },
      { id: "infarto_angina", label: "Infarto ou angina prévia" },
      { id: "insuf_cardiaca", label: "Insuficiência cardíaca" },
      { id: "arritmia", label: "Arritmia / fibrilação atrial" },
      { id: "avc_ait", label: "AVC ou AIT prévio" },
      { id: "marcapasso_stent", label: "Marca-passo ou stent" },
    ],
  },
  {
    title: "Metabólico / Endócrino",
    items: [
      { id: "diabetes", label: "Diabetes", extra: { id: "usa_insulina", type: "checkbox", label: "Usa insulina" } },
      { id: "obesidade_grave", label: "Obesidade grave" },
      { id: "doenca_tireoide", label: "Doença da tireoide" },
      { id: "insuf_adrenal", label: "Insuficiência adrenal / uso crônico de corticoide" },
    ],
  },
  {
    title: "Respiratório",
    items: [
      { id: "asma", label: "Asma / já foi intubado alguma vez" },
      { id: "dpoc", label: "DPOC" },
      { id: "o2_domiciliar", label: "Uso de oxigênio domiciliar" },
      { id: "tuberculose", label: "Tuberculose em tratamento" },
    ],
  },
  {
    title: "Renal / Hepático",
    items: [
      { id: "doenca_renal_cronica", label: "Doença renal crônica" },
      { id: "dialise", label: "Diálise", extra: { id: "data_ultima_dialise", type: "date", label: "Data da última sessão" } },
      { id: "cirrose", label: "Cirrose / doença hepática" },
      { id: "transplantado", label: "Transplantado" },
    ],
  },
  {
    title: "Imunossupressão",
    items: [
      { id: "cancer_tratamento", label: "Câncer em tratamento (quimio/radio)" },
      { id: "hiv", label: "HIV" },
      { id: "imunobiologicos", label: "Uso de imunobiológicos ou imunossupressores" },
      { id: "esplenectomia", label: "Esplenectomia" },
    ],
  },
  {
    title: "Neurológico / Psiquiátrico",
    items: [
      { id: "epilepsia", label: "Epilepsia" },
      { id: "demencia", label: "Demência" },
      { id: "transtorno_psiquiatrico", label: "Transtorno psiquiátrico em acompanhamento" },
      { id: "deficiencia_comunicacao", label: "Deficiência que afete comunicação" },
    ],
  },
  {
    title: "Hematológico",
    items: [
      { id: "anemia_falciforme", label: "Anemia falciforme" },
      { id: "disturbio_coagulacao", label: "Distúrbio de coagulação / hemofilia" },
    ],
  },
  {
    title: "Medicamentos em uso",
    items: [
      { id: "anticoagulante", label: "Anticoagulante" },
      { id: "antiagregante", label: "Antiagregante (AAS, clopidogrel)" },
      { id: "corticoide_cronico", label: "Corticoide crônico" },
      { id: "imunossupressor", label: "Imunossupressor" },
      { id: "insulina", label: "Insulina" },
      { id: "betabloqueador", label: "Betabloqueador" },
    ],
  },
  {
    title: "Situacional (últimos 30 dias)",
    items: [
      { id: "cirurgia_recente", label: "Cirurgia recente" },
      { id: "internacao_recente", label: "Internação recente" },
      { id: "antibiotico_recente", label: "Antibiótico recente" },
      { id: "contato_animal", label: "Contato com animal peçonhento ou silvestre" },
    ],
  },
];

/* =========================================================================
   Estado — vive só em memória.
   Nada é escrito em localStorage / sessionStorage / cookies.
   Recarregar ou fechar a página apaga tudo (inclusive o tema escolhido).
   ========================================================================= */

const app = document.getElementById("app");

/* Número do atendimento pré-hospital. Onde o SAMU 192 ainda não opera
   (ex.: municípios em implantação, com resgate pelos Bombeiros 193),
   basta trocar aqui. */
const TELEFONE_EMERGENCIA = "192";

let state = null;
let history_ = [];

function freshState() {
  return {
    step: "intro",
    idade: null, // number | "nao_sei"
    populacao: null,
    subpopulacao: "x",
    semanas_bebe: null,
    genero: null, // "homem" | "mulher" | "nao_sei"
    gravida_tempo: "x", // 1 | 2 | 3 | "x"
    puerperio: "x", // "imediato" | "tardio" | "remoto" | "x"
    lactante: "nao",
    altura: null, // number (cm), só perguntada quando a pressão precisa dela
    comorbidades: {}, // id -> { checked, extraValue }
    sintomas: {}, // id -> { checked, subIndex }
    // Acordeão do histórico de saúde: só a primeira seção começa aberta.
    aberto: { comorb: new Set([0]) },
    // Sintomas são percorridos em partes, uma por sistema do corpo.
    sintomaParte: 0,
    // Partes já abertas, para avisar quem pede o encaminhamento antes do fim.
    partesVistas: new Set([0]),

    // Blocos de perfil já respondidos. A triagem só pergunta o que ainda
    // pode mudar o encaminhamento, e nunca repete um bloco já respondido.
    idadeRespondida: false,
    generoRespondido: false,
    diabetesRespondida: false,
    alturaRespondida: false,
    comorbidadesRespondidas: false,
    // Para onde voltar quando um bloco de perfil termina.
    retomar: null, // null (triagem) | { tipo:"painel", painel, parte, itemId }
  };
}

function resetState() {
  state = freshState();
  history_ = [];
  render();
}

/* -------------------------------- Tema ----------------------------------- */
/* Também só em memória: ao recarregar volta ao padrão claro. */

function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn || btn.dataset.ligado) return; // idempotente: o catálogo também chama
  btn.dataset.ligado = "1";
  btn.addEventListener("click", () => {
    const atual = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", atual === "dark" ? "light" : "dark");
  });
}

/* ------------------------------- Utilidades ------------------------------ */

function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

function el(html) {
  return h(html).firstElementChild;
}

/* O histórico guarda passo + parte dos sintomas, para que "Voltar"
   percorra as partes uma a uma antes de sair da etapa. */
function go(step) {
  history_.push({ step: state.step, parte: state.sintomaParte });
  state.step = step;
  render();
  window.scrollTo(0, 0);
}

function irParaParte(i) {
  history_.push({ step: state.step, parte: state.sintomaParte });
  state.sintomaParte = i;
  state.partesVistas.add(i);
  render();
  window.scrollTo(0, 0);
}

function back() {
  if (!history_.length) return;
  const anterior = history_.pop();
  state.step = anterior.step;
  state.sintomaParte = anterior.parte;
  render();
  window.scrollTo(0, 0);
}

/* ===================== Roteamento em degraus ============================
   Os sintomas vêm primeiro. Depois deles, cada bloco de perfil só é
   perguntado se ainda puder mudar o encaminhamento: assim que o resultado
   chega em hospital (ou SAMU), a triagem para e mostra o resultado.

   O painel de pressão é o outro consumidor desses blocos — ele precisa da
   idade e, entre 1 e 12 anos, também de gênero e altura para classificar a
   leitura por percentil. `state.retomar` guarda para onde voltar quando o
   bloco pedido pelo painel termina. Um bloco já respondido nunca se repete.
   ======================================================================= */

/* O que ainda falta para o painel de pressão poder classificar a leitura. */
function pendenciaPressao() {
  if (!state.idadeRespondida) return "idade";
  const idade = state.idade;
  // Só a faixa de 1 a 12 anos usa a tabela por percentil (sexo + altura).
  const usaPercentil = typeof idade === "number" && idade >= 1 && idade <= 12;
  if (usaPercentil && !state.generoRespondido) return "sexo";
  if (usaPercentil && !state.alturaRespondida) return "altura";
  return null;
}

/* O glicosímetro precisa da faixa etária, de saber se há gestação e do
   diagnóstico prévio de diabetes — os três mudam a tabela de referência.
   Quem já respondeu o histórico de saúde não precisa repetir a diabetes. */
function pendenciaGlicose() {
  if (!state.idadeRespondida) return "idade";
  if (!state.generoRespondido) return "sexo";
  if (!state.diabetesRespondida && !state.comorbidadesRespondidas) return "diabetes";
  return null;
}

/* Cada painel de medição diz o que precisa saber antes de abrir. */
/* A FC normal depende da idade (um bebê tem FC bem mais alta). */
function pendenciaOximetro() {
  return state.idadeRespondida ? null : "idade";
}

const PENDENCIA_PAINEL = {
  pressao: pendenciaPressao,
  glicose: pendenciaGlicose,
  oximetro: pendenciaOximetro,
};

function pendenciaDoPainel(painel) {
  const f = PENDENCIA_PAINEL[painel];
  return f ? f() : null;
}

/* Sobe um degrau: pergunta o próximo bloco que ainda pode mudar o destino. */
/* Para no hospital só se nenhuma regra de SAMU ainda puder disparar com o
   que falta perguntar. Antes, a triagem parava no hospital e as regras
   SAMU que dependem de perfil/histórico (AVC prévio, cirrose, gestante,
   idoso) nunca eram avaliadas justamente nos casos mais graves. */
function triagemPodeParar(r) {
  if (r.samu) return true;
  if (r.destino !== "hospital") return false;
  const faltaPerfil = !state.idadeRespondida || !state.generoRespondido || !state.comorbidadesRespondidas;
  if (!faltaPerfil) return true;
  return !(typeof samuAindaPossivel === "function" && samuAindaPossivel(state));
}

function avancaTriagem() {
  const r = computeResultado();
  if (triagemPodeParar(r)) return go("resultado");

  if (!state.idadeRespondida) return go("idade");
  if (!state.generoRespondido) return go("sexo");
  if (!state.comorbidadesRespondidas) return go("comorbidades");
  return go("resultado");
}

/* Chamado ao fim de cada bloco de perfil. */
function retomaContexto() {
  const ctx = state.retomar;

  if (ctx && ctx.tipo === "painel") {
    const falta = pendenciaDoPainel(ctx.painel);
    if (falta) return go(falta);
    state.retomar = null;
    return reabrePainel(ctx);
  }

  state.retomar = null;
  return avancaTriagem();
}

/* Volta à lista de sintomas na parte certa e reabre o painel de medição. */
function reabrePainel(ctx) {
  history_.push({ step: state.step, parte: state.sintomaParte });
  state.step = "sintomas";
  state.sintomaParte = ctx.parte;
  state.partesVistas.add(ctx.parte);
  render();
  window.scrollTo(0, 0);

  const item = SYMPTOM_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === ctx.itemId);
  if (item) abrePainel(item);
}

/* Etapas de perfil e histórico são condicionais, então a barra mostra o
   nome da fase em vez de um "etapa N de M" que mudaria de total. */
const STEP_META = {
  sintomas: { fase: "Sintomas", pct: 30 },
  idade: { fase: "Perfil", pct: 62 },
  semanas_bebe: { fase: "Perfil", pct: 66 },
  sexo: { fase: "Perfil", pct: 70 },
  gravidez: { fase: "Perfil", pct: 73 },
  trimestre: { fase: "Perfil", pct: 76 },
  puerperio_tempo: { fase: "Perfil", pct: 76 },
  suspeita_gravidez: { fase: "Perfil", pct: 76 },
  lactante: { fase: "Perfil", pct: 79 },
  altura: { fase: "Perfil", pct: 82 },
  diabetes: { fase: "Perfil", pct: 85 },
  comorbidades: { fase: "Histórico de saúde", pct: 92 },
};

function progressHtml() {
  const meta = STEP_META[state.step];
  if (!meta) return "";

  // Na etapa de sintomas a barra avança conforme as partes percorridas.
  let pct = meta.pct;
  if (state.step === "sintomas") {
    const total = SYMPTOM_CATEGORIES.length;
    pct = 8 + ((state.sintomaParte + 1) / total) * 48;
  }

  return `
    <div class="progress">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-step">${meta.fase}</div>
    </div>`;
}

function backHtml() {
  return history_.length
    ? `<button class="back-btn" type="button" data-action="back">
         <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
         Voltar
       </button>`
    : "";
}

function wireBack() {
  const b = app.querySelector('[data-action="back"]');
  if (b) b.onclick = back;
}

const CARET = `<svg class="section-caret" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5 12 15.5 18 9.5"/></svg>`;

/* -------------------- Componente: campo de intervalo (range) -------------- */

function rangeFieldHtml(opts) {
  const { id, min, max, value, unit, plusAtMax } = opts;
  const fill = ((value - min) / (max - min)) * 100;
  const shown = plusAtMax && value === max ? `${max}+` : `${value}`;
  return `
    <div class="range-field">
      <div class="range-readout">
        <div class="range-value" id="${id}-out">${shown}</div>
        <span class="range-unit">${unit}</span>
      </div>
      <input type="range" id="${id}" min="${min}" max="${max}" step="1" value="${value}"
             style="--fill:${fill}%" aria-label="${unit}" />
      <div class="range-scale">
        <span>${min}</span>
        <span>${plusAtMax ? max + "+" : max}</span>
      </div>
    </div>`;
}

function wireRange(id, plusAtMax) {
  const input = app.querySelector("#" + id);
  const out = app.querySelector("#" + id + "-out");
  const min = Number(input.min);
  const max = Number(input.max);
  const update = () => {
    const v = Number(input.value);
    input.style.setProperty("--fill", ((v - min) / (max - min)) * 100 + "%");
    out.textContent = plusAtMax && v === max ? `${max}+` : `${v}`;
  };
  input.addEventListener("input", update);
  update();
  return input;
}

/* ------------------------------- Render ---------------------------------- */

function render() {
  app.innerHTML = "";
  const renderers = {
    intro: renderIntro,
    samu: renderSamu,
    idade: renderIdade,
    semanas_bebe: renderSemanasBebe,
    sexo: renderSexo,
    gravidez: renderGravidez,
    trimestre: renderTrimestre,
    puerperio_tempo: renderPuerperioTempo,
    suspeita_gravidez: renderSuspeitaGravidez,
    lactante: renderLactante,
    altura: renderAltura,
    diabetes: renderDiabetes,
    comorbidades: renderComorbidades,
    sintomas: renderSintomas,
    resultado: renderResultado,
  };
  (renderers[state.step] || renderIntro)();
}

/* --------------------------- 1. Emergência ------------------------------- */

function renderIntro() {
  app.appendChild(
    h(`
    <div class="card">
      <h1>Para onde procurar ajuda?</h1>
      <p class="lede">Responda algumas perguntas rápidas e receba uma orientação de encaminhamento: SAMU, Polícia, UBS, UPA ou Hospital.</p>
      <p class="question" style="margin-top:22px">É uma emergência — ou seja, você ou alguém sofre risco imediato (ou nos próximos minutos) de morte?</p>
      <div class="options">
        <button class="btn danger" type="button" data-v="sim">Sim</button>
        <button class="btn center" type="button" data-v="nao">Não</button>
      </div>
    </div>
  `)
  );
  app.querySelector('[data-v="sim"]').onclick = () => go("samu");
  app.querySelector('[data-v="nao"]').onclick = () => go("sintomas");
}

function renderSamu() {
  app.appendChild(
    h(`
    <div class="verdict samu">
      <div class="verdict-kicker">Emergência</div>
      <svg class="verdict-icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Z"/><path d="M12 7.6v5"/><path d="M12 16.1h.01"/>
      </svg>
      <div class="verdict-name">Ligue ${TELEFONE_EMERGENCIA}</div>
      <div class="verdict-sub">Não espere. Ligue agora e siga as orientações do atendente.</div>
    </div>

    <div class="card">
      <a class="call-btn solid-samu" href="tel:${TELEFONE_EMERGENCIA}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6.3 3.8h3.2l1.6 4-2 1.2a11.4 11.4 0 0 0 5.9 5.9l1.2-2 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6A16.4 16.4 0 0 1 4.7 5.5a1.6 1.6 0 0 1 1.6-1.7Z"/></svg>
        SAMU — ${TELEFONE_EMERGENCIA}
      </a>
      <a class="call-btn outline" style="color:var(--danger)" href="tel:193">Bombeiros / resgate — 193</a>
      <a class="call-btn outline" style="color:var(--police)" href="tel:190">Polícia Militar — 190</a>
    </div>

    <div class="card">
      <p class="lede">Se a situação mudar e não houver mais risco imediato de morte, você pode seguir com a triagem.</p>
      <div class="btn-row">
        <button class="btn grow-2 center" type="button" data-action="continuar">Continuar triagem</button>
        <button class="btn subtle" type="button" data-action="reiniciar">Recomeçar</button>
      </div>
    </div>
  `)
  );
  app.querySelector('[data-action="continuar"]').onclick = () => go("sintomas");
  app.querySelector('[data-action="reiniciar"]').onclick = resetState;
}

/* ------------------------------ Idade ------------------------------------ */

function classificaIdade(idade) {
  if (idade === "nao_sei") return "adulto_clinico";
  if (idade < 10) return "crianca_clinica";
  if (idade < 20) return "adolescente_clinico";
  if (idade < 60) return "adulto_clinico";
  return "idoso_clinico";
}

function renderIdade() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Qual a idade de quem apresenta os sintomas?</p>
      <p class="hint">Arraste para escolher. O valor máximo cobre 60 anos ou mais.</p>
      ${rangeFieldHtml({ id: "idade-range", min: 0, max: 60, value: 30, unit: "anos", plusAtMax: true })}
      <div class="btn-row">
        <button class="btn primary grow-2" type="button" data-action="confirmar">Confirmar</button>
        <button class="btn subtle" type="button" data-action="nao-sei">Não sei</button>
      </div>
    </div>
  `)
  );

  const input = wireRange("idade-range", true);

  const avancar = (idade) => {
    state.idade = idade;
    state.populacao = classificaIdade(idade);
    // Até 2 anos o bloco continua na pergunta de semanas de vida.
    if (idade !== "nao_sei" && idade <= 2) return go("semanas_bebe");
    state.idadeRespondida = true;
    retomaContexto();
  };

  app.querySelector('[data-action="confirmar"]').onclick = () => avancar(Number(input.value));
  app.querySelector('[data-action="nao-sei"]').onclick = () => avancar("nao_sei");
  wireBack();
}

/* -------------------------- 3.11 Semanas do bebê ------------------------- */

function renderSemanasBebe() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Quantas semanas tem o bebê?</p>
      <p class="hint">Semanas de vida desde o nascimento.</p>
      ${rangeFieldHtml({ id: "semanas-range", min: 0, max: 24, value: 8, unit: "semanas", plusAtMax: true })}
      <div class="btn-row">
        <button class="btn primary grow-2" type="button" data-action="confirmar">Confirmar</button>
        <button class="btn subtle" type="button" data-action="nao-sei">Não sei</button>
      </div>
    </div>
  `)
  );

  const input = wireRange("semanas-range", true);

  const avancar = (semanas) => {
    state.semanas_bebe = semanas;
    state.subpopulacao = semanas !== "nao_sei" && semanas < 4 ? "neonatal" : "lactente";
    state.idadeRespondida = true;
    retomaContexto();
  };

  app.querySelector('[data-action="confirmar"]').onclick = () => avancar(Number(input.value));
  app.querySelector('[data-action="nao-sei"]').onclick = () => avancar("nao_sei");
  wireBack();
}

/* --------------------------- 3.2 Sexo biológico -------------------------- */

/* Gestação e lactação só fazem sentido a partir dos 10 anos (ou idade
   desconhecida). Antes disso a pergunta também apagava a condição de
   recém-nascido/lactente, que vive no mesmo campo `subpopulacao`. */
function perguntaGestacao() {
  return !(typeof state.idade === "number" && state.idade < 10);
}
/* "Não sei se está grávida" é tratado como possível gravidez (conservador). */
const SUBPOP_GESTACAO_NAO_SEI = "possivel_gravida";

function renderSexo() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Qual o sexo biológico de quem apresenta os sintomas?</p>
      <div class="options">
        <button class="btn" type="button" data-v="homem">Homem biológico</button>
        <button class="btn" type="button" data-v="mulher">Mulher biológica</button>
        <button class="btn subtle" type="button" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((b) => {
    b.onclick = () => {
      if (b.dataset.v === "mulher" || b.dataset.v === "nao_sei") {
        // "Não sei" não vira "homem": a pergunta de gestação continua sendo
        // feita (a partir dos 10 anos), que é o caminho conservador.
        state.genero = b.dataset.v;
        if (!perguntaGestacao()) {
          state.generoRespondido = true;
          return retomaContexto();
        }
        go("gravidez");
      } else {
        state.genero = "homem";
        state.generoRespondido = true;
        retomaContexto();
      }
    };
  });
  wireBack();
}

/* ------------------------ 3.21 Gravidez / puerpério ---------------------- */

function renderGravidez() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Essa mulher está grávida ou fez o parto recentemente e ainda não menstruou?</p>
      <div class="options">
        <button class="btn" type="button" data-v="gravida">Está grávida</button>
        <button class="btn" type="button" data-v="puerperio">Fez o parto recentemente e ainda não menstruou</button>
        <button class="btn" type="button" data-v="suspeita">Tem suspeita de gravidez</button>
        <button class="btn" type="button" data-v="nao">Não está grávida nem fez parto recente</button>
        <button class="btn subtle" type="button" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((b) => {
    b.onclick = () => {
      const v = b.dataset.v;
      if (v === "gravida") {
        state.subpopulacao = "gravida";
        go("trimestre");
      } else if (v === "puerperio") {
        state.subpopulacao = "puerperio";
        go("puerperio_tempo");
      } else if (v === "suspeita") {
        state.subpopulacao = "possivel_gravida";
        go("suspeita_gravidez");
      } else if (v === "nao_sei") {
        state.subpopulacao = SUBPOP_GESTACAO_NAO_SEI;
        go("lactante");
      } else {
        state.subpopulacao = "x";
        go("lactante");
      }
    };
  });
  wireBack();
}

/* ---------------------------- 3.211 Trimestre ---------------------------- */

function renderTrimestre() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Essa gestante está grávida há quantos trimestres?</p>
      <div class="chip-row">
        <button class="chip" type="button" data-v="1">1<small>trimestre</small></button>
        <button class="chip" type="button" data-v="2">2<small>trimestre</small></button>
        <button class="chip" type="button" data-v="3">3<small>trimestre</small></button>
      </div>
      <div class="btn-row">
        <button class="btn subtle" type="button" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((b) => {
    b.onclick = () => {
      state.gravida_tempo = b.dataset.v === "nao_sei" ? 2 : Number(b.dataset.v);
      go("lactante");
    };
  });
  wireBack();
}

/* -------------------------- 3.212 Tempo de parto ------------------------- */

function classificaPuerperio(dias) {
  if (dias === "nao_sei") return "tardio";
  if (dias < 10) return "imediato";
  if (dias < 42) return "tardio";
  return "remoto";
}

function renderPuerperioTempo() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Há quanto tempo foi o parto?</p>
      <p class="hint">Em dias. O valor máximo cobre 42 dias ou mais.</p>
      ${rangeFieldHtml({ id: "parto-range", min: 0, max: 42, value: 14, unit: "dias", plusAtMax: true })}
      <div class="btn-row">
        <button class="btn primary grow-2" type="button" data-action="confirmar">Confirmar</button>
        <button class="btn subtle" type="button" data-action="nao-sei">Não sei</button>
      </div>
    </div>
  `)
  );

  const input = wireRange("parto-range", true);

  const avancar = (dias) => {
    state.puerperio = classificaPuerperio(dias);
    go("lactante");
  };

  app.querySelector('[data-action="confirmar"]').onclick = () => avancar(Number(input.value));
  app.querySelector('[data-action="nao-sei"]').onclick = () => avancar("nao_sei");
  wireBack();
}

/* ----------------------- 3.213 Suspeita de gravidez ---------------------- */

function renderSuspeitaGravidez() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">A menstruação está atrasada há mais de 7 dias?</p>
      <div class="options">
        <button class="btn" type="button" data-v="sim">Sim</button>
        <button class="btn" type="button" data-v="nao">Não</button>
        <button class="btn subtle" type="button" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((b) => {
    b.onclick = () => {
      if (b.dataset.v === "nao") {
        state.subpopulacao = "x";
      } else {
        state.subpopulacao = "gravida";
        state.gravida_tempo = 1;
      }
      go("lactante");
    };
  });
  wireBack();
}

/* ------------------------------ 3.22 Lactante ---------------------------- */

function renderLactante() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Essa mulher é lactante / amamenta?</p>
      <div class="options">
        <button class="btn" type="button" data-v="sim">Sim</button>
        <button class="btn" type="button" data-v="nao">Não</button>
        <button class="btn subtle" type="button" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((b) => {
    b.onclick = () => {
      state.lactante = b.dataset.v === "sim" ? "sim" : "nao";
      state.generoRespondido = true;
      retomaContexto();
    };
  });
  wireBack();
}

/* ------------------- 3.3 Altura (crianças de 1 a 12 anos) ---------------- */
/* Régua horizontal arrastável, com as extremidades desvanescidas, e um
   personagem cuja altura acompanha o valor. A altura é usada depois para
   consultar a tabela de percentis de pressão arterial em dadospressao.js. */

const ALT_MIN = 75;
const ALT_MAX = 176;
const ALT_PX_MIN = 92; // altura do personagem, em px, no valor mínimo
const ALT_PX_MAX = 232; // altura do personagem, em px, no valor máximo
const ALT_PX_CM = 12; // escala da régua: pixels por centímetro

/* A fita começa em `left: 50%` da máscara (ver styles.css) e cada marca fica
   a (v - ALT_MIN) * ALT_PX_CM da borda dela. Com a fita deslocada de
   -(valor - ALT_MIN) * ALT_PX_CM, a marca do valor atual cai exatamente em
   50% — que é onde o ponteiro está. Assim o alinhamento não depende da
   largura da tela: nada aqui assume um tamanho fixo de janela. */

function alturaLabel(v) {
  if (v === ALT_MIN) return `${ALT_MIN}-`;
  if (v === ALT_MAX) return `${ALT_MAX}+`;
  return `${v}`;
}
function alturaParaPx(v) {
  return ALT_PX_MIN + ((v - ALT_MIN) / (ALT_MAX - ALT_MIN)) * (ALT_PX_MAX - ALT_PX_MIN);
}
function alturaOffset(v) {
  return -(v - ALT_MIN) * ALT_PX_CM;
}

function alturaMarcasHtml() {
  let out = "";
  for (let v = ALT_MIN; v <= ALT_MAX; v++) {
    const maior = v % 10 === 0;
    const media = !maior && v % 5 === 0;
    const x = (v - ALT_MIN) * ALT_PX_CM;
    out += `<div class="altura-marca ${maior ? "maior" : media ? "media" : ""}" style="left:${x}px">${
      maior ? `<span>${v}</span>` : ""
    }</div>`;
  }
  return out;
}

/* Pictograma minimalista, de uma cor só: azul para menino, rosa para menina.
   A cor vem de uma classe no <svg>, para acompanhar o tema claro/escuro. */
function personagemSvg(genero) {
  const ehMenina = genero === "mulher";

  const corpo = ehMenina
    ? // vestido trapezoidal + pernas
      `<path d="M50 54c-10 0-17 5-19 13l-13 51h64l-13-51c-2-8-9-13-19-13z"/>
       <rect x="34" y="116" width="13" height="82" rx="6.5"/>
       <rect x="53" y="116" width="13" height="82" rx="6.5"/>`
    : // tronco com ombros + pernas
      `<rect x="22" y="54" width="56" height="62" rx="17"/>
       <rect x="30" y="112" width="16" height="86" rx="8"/>
       <rect x="54" y="112" width="16" height="86" rx="8"/>`;

  return `
    <svg viewBox="0 0 100 210" preserveAspectRatio="xMidYMax meet" role="img"
         class="figura ${ehMenina ? "menina" : "menino"}"
         aria-label="${ehMenina ? "Menina" : "Menino"}">
      <circle cx="50" cy="30" r="19"/>
      ${corpo}
    </svg>`;
}

function renderAltura() {
  const valorInicial = state.altura ?? 110;

  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Qual a altura dessa criança?</p>
      <p class="hint">Arraste a régua até a altura medida.</p>

      <div class="altura-readout">
        <span class="altura-valor" id="altura-valor">${alturaLabel(valorInicial)}</span>
        <span class="altura-un">cm</span>
      </div>

      <div class="altura-palco">
        <div class="altura-chao"></div>
        <div class="altura-personagem-wrap" id="altura-personagem-wrap" style="height:${alturaParaPx(valorInicial)}px">
          ${personagemSvg(state.genero)}
        </div>
      </div>

      <div class="altura-regua" id="altura-regua" tabindex="0" role="slider"
           aria-label="Altura em centímetros"
           aria-valuemin="${ALT_MIN}" aria-valuemax="${ALT_MAX}" aria-valuenow="${valorInicial}">
        <div class="altura-ponteiro"></div>
        <div class="altura-regua-mask">
          <div class="altura-fita" id="altura-fita" style="transform:translateX(${alturaOffset(valorInicial)}px)">
            ${alturaMarcasHtml()}
          </div>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn primary" type="button" data-action="continuar">Continuar</button>
      </div>
    </div>
  `)
  );

  ligaAltura(valorInicial);
  wireBack();
}

function ligaAltura(valorInicial) {
  let valor = valorInicial;
  const regua = app.querySelector("#altura-regua");
  const fita = app.querySelector("#altura-fita");
  const leitura = app.querySelector("#altura-valor");
  const personagemWrap = app.querySelector("#altura-personagem-wrap");

  const clamp = (v) => Math.min(ALT_MAX, Math.max(ALT_MIN, v));

  const aplica = () => {
    fita.style.transform = `translateX(${alturaOffset(valor)}px)`;
    leitura.textContent = alturaLabel(valor);
    personagemWrap.style.height = alturaParaPx(valor) + "px";
    regua.setAttribute("aria-valuenow", String(valor));
    state.altura = valor;
  };
  aplica(); // grava o valor inicial mesmo sem interação

  let arrastando = false;
  let inicioX = 0;
  let valorInicioArraste = valor;

  const mover = (ev) => {
    if (!arrastando) return;
    const deltaPx = ev.clientX - inicioX;
    valor = clamp(Math.round(valorInicioArraste - deltaPx / ALT_PX_CM));
    aplica();
  };
  const soltar = () => {
    arrastando = false;
    window.removeEventListener("pointermove", mover);
    window.removeEventListener("pointerup", soltar);
  };

  regua.addEventListener("pointerdown", (ev) => {
    arrastando = true;
    inicioX = ev.clientX;
    valorInicioArraste = valor;
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
  });

  regua.addEventListener("keydown", (ev) => {
    if (ev.key === "Home") {
      valor = ALT_MIN;
      aplica();
      ev.preventDefault();
      return;
    }
    if (ev.key === "End") {
      valor = ALT_MAX;
      aplica();
      ev.preventDefault();
      return;
    }
    const passo = ev.key === "PageUp" || ev.key === "PageDown" ? 10 : 1;
    let d = 0;
    if (ev.key === "ArrowRight" || ev.key === "ArrowUp" || ev.key === "PageUp") d = passo;
    if (ev.key === "ArrowLeft" || ev.key === "ArrowDown" || ev.key === "PageDown") d = -passo;
    if (!d) return;
    ev.preventDefault();
    valor = clamp(valor + d);
    aplica();
  });

  app.querySelector('[data-action="continuar"]').onclick = () => {
    state.alturaRespondida = true;
    retomaContexto();
  };
}

/* ------------------- Acordeão de itens marcáveis (4 e 5) ----------------- */

function itemHtml(item, kind) {
  const store = kind === "sint" ? state.sintomas : state.comorbidades;
  const st = store[item.id];
  const checked = !!(st && st.checked);
  let extra = "";

  // Itens com painel (febre, pressão) mostram a medição e um atalho para editá-la.
  if (checked && kind === "sint" && item.painel) {
    extra = `
      <div class="medicao">
        <span class="medicao-valor">${resumoMedicao(item)}</span>
        <button class="btn-mini" type="button" data-abrir="${item.id}">Alterar</button>
      </div>`;
  } else if (checked && kind === "sint" && item.sub) {
    extra = `
      <div class="follow-up">
        <div class="follow-up-label">Qual descreve melhor?</div>
        <div class="radio-list">
          ${item.sub.options
            .map(
              (o, i) => `
            <label class="radio-opt">
              <input type="radio" name="sub-${item.id}" data-sub="${item.id}" value="${i}" ${
                st.subIndex === i ? "checked" : ""
              } />
              <span>${o.label}</span>
            </label>`
            )
            .join("")}
        </div>
      </div>`;
  }

  if (checked && kind === "comorb" && item.extra) {
    extra =
      item.extra.type === "checkbox"
        ? `<div class="extra-field">
             <label class="radio-opt">
               <input type="checkbox" data-extra="${item.id}" ${st.extraValue ? "checked" : ""} />
               <span>${item.extra.label}</span>
             </label>
           </div>`
        : `<div class="extra-field">
             <span class="extra-label">${item.extra.label}</span>
             <input type="date" data-extra="${item.id}" value="${st.extraValue || ""}" />
           </div>`;
  }

  return `
    <div class="check-item ${checked ? "checked" : ""}" data-item="${item.id}">
      <label class="check-head">
        <input type="checkbox" data-check="${item.id}" ${checked ? "checked" : ""} />
        <span>${item.label}</span>
      </label>
      ${extra}
    </div>`;
}

function accordionHtml(categories, kind) {
  const abertas = state.aberto[kind];
  return `<div class="accordion">${categories
    .map((cat, i) => {
      const marcados = contaMarcados(cat, kind);
      return `
      <div class="section ${abertas.has(i) ? "open" : ""} ${marcados ? "has-marks" : ""}" data-sec="${i}">
        <button class="section-head" type="button" data-toggle="${i}" aria-expanded="${abertas.has(i)}">
          <span class="section-title">${cat.title}</span>
          ${marcados ? `<span class="section-count">${marcados}</span>` : ""}
          ${CARET}
        </button>
        <div class="section-body">
          ${cat.items.map((item) => itemHtml(item, kind)).join("")}
        </div>
      </div>`;
    })
    .join("")}</div>`;
}

function contaMarcados(cat, kind) {
  const store = kind === "sint" ? state.sintomas : state.comorbidades;
  return cat.items.filter((it) => store[it.id] && store[it.id].checked).length;
}

/* Atualiza o contador e o destaque de uma seção sem redesenhar a tela. */
function atualizaSecao(categories, kind, secEl) {
  const idx = Number(secEl.dataset.sec);
  const marcados = contaMarcados(categories[idx], kind);
  secEl.classList.toggle("has-marks", marcados > 0);
  const head = secEl.querySelector(".section-head");
  let badge = head.querySelector(".section-count");
  if (marcados) {
    if (!badge) {
      badge = el(`<span class="section-count"></span>`);
      head.insertBefore(badge, head.querySelector(".section-caret"));
    }
    badge.textContent = marcados;
  } else if (badge) {
    badge.remove();
  }
}

/* Redesenha um único item no lugar, preservando a rolagem da página. */
function trocaItem(item, kind, categories) {
  const antigo = app.querySelector(`.check-item[data-item="${item.id}"]`);
  if (!antigo) return;
  const secEl = antigo.closest(".section");
  const novo = el(itemHtml(item, kind));
  antigo.replaceWith(novo);
  ligaItem(novo, item, kind, categories);

  // Histórico de saúde usa acordeão; sintomas usam partes com trilha de sistemas.
  if (secEl) {
    atualizaSecao(categories, kind, secEl);
  } else {
    atualizaTrilha();
    // O item patcheado pode ter mudado de altura (ex.: abriu ou fechou uma
    // sub-pergunta). Resincroniza o wrap só quando ele mostra #pane-main —
    // se um painel estiver aberto, abrePainel/fechaPainel já cuidam disso.
    const wrap = app.querySelector("#slide-wrap");
    const main = app.querySelector("#pane-main");
    if (wrap && main && !wrap.classList.contains("aberto")) {
      animaAlturaSlide(wrap, wrap.offsetHeight, main.offsetHeight);
    }
  }
}

function ligaItem(node, item, kind, categories) {
  const store = kind === "sint" ? state.sintomas : state.comorbidades;

  const cb = node.querySelector("[data-check]");
  cb.onchange = () => {
    if (!store[item.id]) store[item.id] = { checked: false, subIndex: null, extraValue: null };
    store[item.id].checked = cb.checked;
    if (!cb.checked) {
      store[item.id].subIndex = null;
      store[item.id].extraValue = null;
      store[item.id].medida = null;
      store[item.id].pressao = null;
      store[item.id].oxi = null;
      store[item.id].glicose = null;
      store[item.id].modo = "medir";
      store[item.id].subEtapa = "medida";
      store[item.id].alterada = null;
    }
    trocaItem(item, kind, categories);

    // Marcar febre ou pressão já abre o painel de medição.
    if (cb.checked && item.painel) abrePainelOuPerfil(item);
  };

  const abrir = node.querySelector("[data-abrir]");
  if (abrir) abrir.onclick = () => abrePainelOuPerfil(item);

  node.querySelectorAll("[data-sub]").forEach((r) => {
    r.onchange = () => {
      store[item.id].subIndex = Number(r.value);
    };
  });

  node.querySelectorAll("[data-extra]").forEach((f) => {
    f.onchange = () => {
      store[item.id].extraValue = f.type === "checkbox" ? f.checked : f.value;
    };
  });
}

function ligaAcordeao(categories, kind) {
  app.querySelectorAll("[data-toggle]").forEach((head) => {
    head.onclick = () => {
      const i = Number(head.dataset.toggle);
      const sec = head.closest(".section");
      const abertas = state.aberto[kind];
      if (abertas.has(i)) abertas.delete(i);
      else abertas.add(i);
      sec.classList.toggle("open", abertas.has(i));
      head.setAttribute("aria-expanded", String(abertas.has(i)));
    };
  });

  categories.forEach((cat) =>
    cat.items.forEach((item) => {
      const node = app.querySelector(`.check-item[data-item="${item.id}"]`);
      if (node) ligaItem(node, item, kind, categories);
    })
  );
}

/* --------------------------- 4. Histórico de saúde ----------------------- */

/* --------------------------- Diabetes (glicemia) ------------------------- */
/* Perguntada antes do glicosímetro, porque a faixa esperada de glicose é
   outra para quem tem o diagnóstico. A resposta já entra no histórico de
   saúde: ao chegar lá, a pessoa encontra a diabetes marcada. */

function renderDiabetes() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">Você tem diabetes?</p>
      <p class="hint">A faixa esperada de glicose é diferente para quem já tem o diagnóstico. Esta resposta já fica marcada no histórico de saúde, mais adiante.</p>
      <div class="options">
        <button class="btn" type="button" data-v="sim">Sim</button>
        <button class="btn" type="button" data-v="nao">Não</button>
        <button class="btn subtle" type="button" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );

  app.querySelectorAll("[data-v]").forEach((b) => {
    b.onclick = () => {
      if (b.dataset.v === "sim") {
        const st = state.comorbidades.diabetes || { checked: false, extraValue: null };
        st.checked = true;
        state.comorbidades.diabetes = st;
      }
      state.diabetesRespondida = true;
      retomaContexto();
    };
  });
  wireBack();
}

function renderComorbidades() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <span class="eyebrow">Histórico de saúde</span>
      <p class="question">Marque as condições que você sabe que a pessoa tem</p>
      <p class="hint">Opcional — mas ajuda a equipe de saúde a avaliar melhor. Toque em uma seção para abrir.</p>
      ${accordionHtml(COMORBIDITY_CATEGORIES, "comorb")}
      <div class="btn-row">
        <button class="btn primary" type="button" data-action="continuar">Continuar</button>
      </div>
    </div>
  `)
  );
  ligaAcordeao(COMORBIDITY_CATEGORIES, "comorb");
  app.querySelector('[data-action="continuar"]').onclick = () => {
    state.comorbidadesRespondidas = true;
    go("resultado");
  };
  wireBack();
}

/* ========================= Modal de confirmação ========================== */

function abreModal({ titulo, texto, confirmar, cancelar, aoConfirmar, aoCancelar }) {
  const fundo = el(`
    <div class="modal-fundo" role="dialog" aria-modal="true">
      <div class="modal">
        <h2>${titulo}</h2>
        <p>${texto}</p>
        <div class="btn-row">
          <button class="btn subtle" type="button" data-m="cancelar">${cancelar}</button>
          <button class="btn primary grow-2" type="button" data-m="ok">${confirmar}</button>
        </div>
      </div>
    </div>`);

  const fecha = () => {
    fundo.classList.remove("aberto");
    setTimeout(() => fundo.remove(), 200);
  };

  fundo.querySelector('[data-m="cancelar"]').onclick = () => {
    fecha();
    if (aoCancelar) aoCancelar();
  };
  fundo.querySelector('[data-m="ok"]').onclick = () => {
    fecha();
    aoConfirmar();
  };
  fundo.onclick = (e) => {
    if (e.target === fundo) fecha();
  };

  document.body.appendChild(fundo);
  requestAnimationFrame(() => fundo.classList.add("aberto"));
  fundo.querySelector('[data-m="ok"]').focus();
}

/* ===================== Painéis deslizantes de medição ==================== */
/* A caixa principal desliza para a esquerda e o painel entra pela direita. */

const PAINEIS = {
  febre: { titulo: "Temperatura", montaHtml: painelFebreHtml, liga: ligaPainelFebre },
  pressao: { titulo: "Pressão arterial", montaHtml: painelPressaoHtml, liga: ligaPainelPressao },
  oximetro: { titulo: "Oxímetro", montaHtml: painelOximetroHtml, liga: ligaPainelOximetro },
  glicose: { titulo: "Glicosímetro", montaHtml: painelGlicoseHtml, liga: ligaPainelGlicose },
};

function estadoItem(id) {
  if (!state.sintomas[id]) {
    state.sintomas[id] = {
      checked: true,
      subIndex: null,
      medida: null,
      pressao: null,
      oxi: null, // oxímetro: { spo2, fc }
      glicose: null, // glicosímetro: { valor, momento }
      modo: "medir",
      subEtapa: "medida", // pressão: "medida" | "confundidores"
      alterada: null, // pressão: true/false depois da pergunta de fatores de alteração
    };
  }
  const st = state.sintomas[id];
  if (st.modo === undefined) st.modo = "medir";
  if (st.subEtapa === undefined) st.subEtapa = "medida";
  return st;
}

/* Componente de slide horizontal com altura de repouso controlada por JS.
   Usado no painel de sintomas (lista <-> medição) e, dentro do painel de
   pressão, entre a medição e a pergunta sobre fatores de alteração.

   A altura NUNCA fica em "auto": os dois painéis são irmãos num flex-row
   (para o slide funcionar via transform), e um flex-row mede sua altura
   pelo MAIOR filho — mesmo o que está fora de tela. Deixar a altura em
   auto faz o contêiner "herdar" a altura do painel escondido sempre que
   ele for mais alto que o visível, abrindo um vão em branco embaixo. */
const DUR_SLIDE = 360;

function inicializaAlturaSlide(wrapEl, paneAtivoEl) {
  wrapEl.style.height = paneAtivoEl.offsetHeight + "px";
}

function animaAlturaSlide(wrapEl, de, para, aoFim) {
  if (!wrapEl) return;
  clearTimeout(wrapEl._timerAltura);
  wrapEl.style.height = de + "px";
  void wrapEl.offsetHeight; // força o reflow para a transição sair do valor certo
  wrapEl.style.height = para + "px";
  wrapEl._timerAltura = setTimeout(() => {
    if (aoFim) aoFim();
  }, DUR_SLIDE);
}

/* A pressão só pode ser classificada com idade (e, entre 1 e 12 anos, com
   gênero e altura). Se algo disso ainda não foi perguntado, sai da lista de
   sintomas para perguntar e volta ao painel depois. Blocos já respondidos
   em outro momento da triagem não são pedidos de novo. */
function abrePainelOuPerfil(item) {
  const falta = pendenciaDoPainel(item.painel);
  if (falta) {
    state.retomar = { tipo: "painel", painel: item.painel, parte: state.sintomaParte, itemId: item.id };
    return go(falta);
  }
  abrePainel(item);
}

function abrePainel(item) {
  const cfg = PAINEIS[item.painel];
  if (!cfg) return;
  state.painel = item.id;

  const wrap = app.querySelector("#slide-wrap");
  const pane = app.querySelector("#pane-painel");
  pane.innerHTML = "";
  pane.appendChild(
    h(`
    <div class="card painel-card">
      <button class="back-btn" type="button" data-p="voltar">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
        Voltar aos sintomas
      </button>
      <span class="eyebrow">${cfg.titulo}</span>
      <div id="painel-corpo">${cfg.montaHtml(item)}</div>
      <div class="btn-row">
        <button class="btn primary" type="button" data-p="pronto">Pronto</button>
      </div>
    </div>`)
  );

  const concluir = () => fechaPainel(item);
  pane.querySelector('[data-p="voltar"]').onclick = concluir;
  pane.querySelector('[data-p="pronto"]').onclick = concluir;
  cfg.liga(item);

  const de = app.querySelector("#pane-main").offsetHeight;
  const para = pane.offsetHeight;
  wrap.classList.add("aberto");
  animaAlturaSlide(wrap, de, para);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function fechaPainel(item) {
  const wrap = app.querySelector("#slide-wrap");
  if (!wrap) return;
  state.painel = null;

  const de = app.querySelector("#pane-painel").offsetHeight;
  wrap.classList.remove("aberto");

  /* O oxímetro mede dois sintomas de uma vez: o companheiro também precisa
     ser redesenhado ANTES de medir a altura do painel principal. */
  [item, ...companheirosDeMedicao(item)].forEach((it) => trocaItem(it, "sint", SYMPTOM_CATEGORIES));

  const para = app.querySelector("#pane-main").offsetHeight;

  animaAlturaSlide(wrap, de, para, () => {
    const pane = app.querySelector("#pane-painel");
    if (pane && !state.painel) pane.innerHTML = "";
  });
}

/* Reconstrói o corpo do painel a partir do estado atual do item — mesma
   técnica para trocar entre medir/"não consigo medir" e, na pressão, entre
   a medição e a pergunta de fatores de alteração. Resincroniza a altura do
   wrap externo, já que o novo conteúdo quase sempre tem tamanho diferente. */
function reconstroiCorpoPainel(item) {
  const wrap = app.querySelector("#slide-wrap");
  const pane = app.querySelector("#pane-painel");
  const de = pane.offsetHeight;

  const corpo = app.querySelector("#painel-corpo");
  corpo.innerHTML = PAINEIS[item.painel].montaHtml(item);
  PAINEIS[item.painel].liga(item);

  // Reinicia a animação de entrada — mesmo truque do "força o reflow" usado
  // em animaAlturaSlide, para o corpo "deslizar" a cada troca, não só na 1ª.
  corpo.classList.remove("painel-slide-in");
  void corpo.offsetWidth;
  corpo.classList.add("painel-slide-in");

  animaAlturaSlide(wrap, de, pane.offsetHeight);
}

/* Alterna entre medir e escolher uma opção descritiva. */
function trocaModoPainel(item, modo) {
  estadoItem(item.id).modo = modo;
  reconstroiCorpoPainel(item);
}

/* Lista de opções usada quando a pessoa não consegue medir. */
function opcoesPainelHtml(item, dica) {
  const st = estadoItem(item.id);
  return `
    <p class="hint">${dica}</p>
    <div class="radio-list radio-cards">
      ${item.sub.options
        .map(
          (o, i) => `
        <label class="radio-opt radio-card">
          <input type="radio" name="op-${item.id}" data-op="${i}" ${st.subIndex === i ? "checked" : ""} />
          <span>${o.label}</span>
        </label>`
        )
        .join("")}
    </div>
    <button class="btn subtle" type="button" data-modo="medir">Voltar a medir</button>`;
}

function ligaOpcoesPainel(item) {
  app.querySelectorAll("[data-op]").forEach((r) => {
    r.onchange = () => {
      const st = estadoItem(item.id);
      st.subIndex = Number(r.dataset.op);
      st.medida = null;
      st.pressao = null;
    };
  });
  const voltar = app.querySelector('[data-modo="medir"]');
  if (voltar) voltar.onclick = () => trocaModoPainel(item, "medir");
}

/* ------------------------- Painel: termômetro ---------------------------- */

const TEMP_MIN = 340; // décimos de grau, para evitar passo fracionário
const TEMP_MAX = 440;

/* Classifica a temperatura em uma das opções já existentes do sintoma. */
function classificaTemperatura(t) {
  if (t < 35.0) return { indice: 3, rotulo: "Hipotermia", zona: "frio" };
  if (t < 37.8) return { indice: 0, rotulo: "Temperatura normal", zona: "normal" };
  if (t < 38.6) return { indice: 0, rotulo: "Febre baixa", zona: "baixa" };
  if (t < 39.6) return { indice: 1, rotulo: "Febre moderada", zona: "moderada" };
  return { indice: 2, rotulo: "Febre muito alta", zona: "alta" };
}

function painelFebreHtml(item) {
  const st = estadoItem(item.id);
  if (st.modo === "opcoes") {
    return opcoesPainelHtml(item, "Escolha o que mais se aproxima do que a pessoa sente.");
  }

  const dec = st.medida != null ? Math.round(st.medida * 10) : 380;
  const t = dec / 10;
  const cls = classificaTemperatura(t);
  const pct = ((dec - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;

  const marcas = [];
  for (let v = TEMP_MIN; v <= TEMP_MAX; v += 10) {
    const p = ((v - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;
    marcas.push(
      `<div class="termo-marca" style="bottom:${p}%"><span>${v === TEMP_MAX ? "44+" : v / 10}</span></div>`
    );
  }

  return `
    <p class="hint">Arraste o termômetro até a temperatura medida.</p>
    <div class="termo-leitura">
      <span class="termo-valor" id="termo-valor">${t.toFixed(1)}</span><span class="termo-un">°C</span>
      <div class="termo-rotulo zona-${cls.zona}" id="termo-rotulo">${cls.rotulo}</div>
    </div>

    <div class="termo" id="termo">
      <div class="termo-marcas">${marcas.join("")}</div>
      <div class="termo-corpo">
        <div class="termo-tubo">
          <div class="termo-merc zona-${cls.zona}" id="termo-merc" style="height:${pct}%"></div>
        </div>
        <div class="termo-bulbo zona-${cls.zona}" id="termo-bulbo"></div>
      </div>
      <input type="range" id="termo-range" class="termo-range"
             min="${TEMP_MIN}" max="${TEMP_MAX}" step="1" value="${dec}"
             aria-label="Temperatura em graus Celsius" />
    </div>

    <button class="btn subtle" type="button" data-modo="opcoes">Não consigo medir</button>`;
}

function ligaPainelFebre(item) {
  const st = estadoItem(item.id);

  if (st.modo === "opcoes") {
    ligaOpcoesPainel(item);
    return;
  }

  const range = app.querySelector("#termo-range");
  const valor = app.querySelector("#termo-valor");
  const rotulo = app.querySelector("#termo-rotulo");
  const merc = app.querySelector("#termo-merc");
  const bulbo = app.querySelector("#termo-bulbo");

  const aplica = () => {
    const dec = Number(range.value);
    const t = dec / 10;
    const cls = classificaTemperatura(t);
    const pct = ((dec - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;

    valor.textContent = t.toFixed(1);
    rotulo.textContent = cls.rotulo;
    rotulo.className = "termo-rotulo zona-" + cls.zona;
    merc.style.height = pct + "%";
    merc.className = "termo-merc zona-" + cls.zona;
    bulbo.className = "termo-bulbo zona-" + cls.zona;

    st.medida = t;
    st.subIndex = cls.indice;
  };

  range.addEventListener("input", aplica);
  aplica(); // grava já a leitura inicial

  app.querySelector('[data-modo="opcoes"]').onclick = () => trocaModoPainel(item, "opcoes");
}

/* --------------------- Painel: manômetro (pressão) ----------------------- */

const PA_MIN = 0;
const PA_MAX = 300;
const PA_PASSO = 5;
const PA_CX = 140;
const PA_CY = 140;
const PA_R_ARCO = 106;
const PA_ANG = 270; // varredura total do mostrador, em graus

function paAngulo(v) {
  return -PA_ANG / 2 + ((v - PA_MIN) / (PA_MAX - PA_MIN)) * PA_ANG;
}

function paPonto(v, raio) {
  const a = (paAngulo(v) * Math.PI) / 180;
  return [PA_CX + raio * Math.sin(a), PA_CY - raio * Math.cos(a)];
}

function paArco(de, ate, raio) {
  if (ate - de < 0.01) return "";
  const [x0, y0] = paPonto(de, raio);
  const [x1, y1] = paPonto(ate, raio);
  const grande = ((ate - de) / (PA_MAX - PA_MIN)) * PA_ANG > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${raio} ${raio} 0 ${grande} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/* Zonas do mostrador: verde até 120, amarelo até 180, vermelho acima. */
const PA_ZONAS = [
  { de: 0, ate: 120, cor: "verde" },
  { de: 120, ate: 180, cor: "amarelo" },
  { de: 180, ate: 300, cor: "vermelho" },
];

/* Só o trecho entre as duas bolinhas fica colorido, recortado por zona. */
function paSegmentosHtml(min, max) {
  return PA_ZONAS.map((z) => {
    const de = Math.max(z.de, min);
    const ate = Math.min(z.ate, max);
    const d = ate > de ? paArco(de, ate, PA_R_ARCO) : "";
    return `<path class="pa-seg pa-${z.cor}" d="${d}" />`;
  }).join("");
}

function paMarcasHtml() {
  let out = "";
  for (let v = PA_MIN; v <= PA_MAX; v += PA_PASSO) {
    const maior = v % 20 === 0;
    const r1 = PA_R_ARCO + 9;
    const r2 = r1 + (maior ? 10 : 5);
    const [x1, y1] = paPonto(v, r1);
    const [x2, y2] = paPonto(v, r2);
    out += `<line class="pa-marca ${maior ? "maior" : ""}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
    if (v % 50 === 0) {
      const [xt, yt] = paPonto(v, r2 + 13);
      out += `<text class="pa-num" x="${xt.toFixed(1)}" y="${yt.toFixed(1)}">${v}</text>`;
    }
  }
  return out;
}

/* Pergunta sobre fatores que podem alterar a leitura, mostrada antes de
   fechar o painel de pressão (só quando houve medição numérica). */
function confundidoresHtml() {
  return `
    <p class="question">Antes e/ou enquanto você mediu, você tomou café, fumou, bebeu álcool, praticou exercícios, comeu, ficou com a bexiga cheia, conversou ou cruzou as pernas?</p>
    <p class="hint">Qualquer um desses fatores pode alterar temporariamente a leitura.</p>
    <div class="options">
      <button class="btn" type="button" data-conf="sim">Sim</button>
      <button class="btn" type="button" data-conf="nao">Não</button>
    </div>`;
}

function ligaConfundidores(item) {
  app.querySelectorAll("[data-conf]").forEach((b) => {
    b.onclick = () => {
      if (b.dataset.conf === "sim") {
        abreModal({
          titulo: "A pressão pode estar alterada",
          texto:
            "Café, cigarro, álcool, exercício, uma refeição recente, a bexiga cheia, conversar ou cruzar as pernas podem alterar temporariamente a leitura.",
          confirmar: "Medir novamente",
          cancelar: "Continuar mesmo assim",
          aoConfirmar: () => voltaParaMedida(item),
          aoCancelar: () => finalizaPressao(item, true),
        });
      } else {
        finalizaPressao(item, false);
      }
    };
  });
}

function avancaParaConfundidores(item) {
  estadoItem(item.id).subEtapa = "confundidores";
  reconstroiCorpoPainel(item);
}
function voltaParaMedida(item) {
  estadoItem(item.id).subEtapa = "medida";
  reconstroiCorpoPainel(item);
}
function finalizaPressao(item, alterada) {
  estadoItem(item.id).alterada = alterada;
  fechaPainel(item);
}

/* Mostra/some o botão "Pronto"/"Continuar" compartilhado do painel e ajusta
   seu rótulo e ação conforme a sub-etapa da pressão. A pergunta de
   confundidores tem seus próprios botões Sim/Não, então o botão do rodapé
   fica escondido enquanto ela estiver visível. */
function configuraRodapePressao(item) {
  const st = estadoItem(item.id);
  const btn = app.querySelector('[data-p="pronto"]');
  if (!btn) return;
  const row = btn.closest(".btn-row");

  if (st.modo === "medir" && st.subEtapa === "confundidores") {
    if (row) row.hidden = true;
    return;
  }
  if (row) row.hidden = false;

  if (st.modo === "opcoes") {
    btn.textContent = "Pronto";
    btn.onclick = () => fechaPainel(item);
  } else {
    btn.textContent = "Continuar";
    // Sem leitura (nada mexido), fecha direto: vale como "não sei".
    btn.onclick = () => (st.pressao ? avancaParaConfundidores(item) : fechaPainel(item));
  }
}

function painelPressaoHtml(item) {
  const st = estadoItem(item.id);
  if (st.modo === "opcoes") {
    return opcoesPainelHtml(item, "Escolha o que mais se aproxima do que você sabe.");
  }
  if (st.subEtapa === "confundidores") {
    return confundidoresHtml();
  }

  // Começa com uma bolinha no 0 e a outra no 300.
  const pa = st.pressao || { min: PA_MIN, max: PA_MAX };
  const [xmin, ymin] = paPonto(pa.min, PA_R_ARCO);
  const [xmax, ymax] = paPonto(pa.max, PA_R_ARCO);

  return `
    <p class="hint">Arraste as duas bolinhas no mostrador ou escreva os valores abaixo.</p>

    <div class="pa-wrap">
      <!-- viewBox folgado nas laterais: os rótulos 50 e 250 ficam nas pontas. -->
      <svg id="pa-svg" viewBox="-16 -6 312 300" class="pa-svg" role="group" aria-label="Mostrador de pressão arterial">
        <path class="pa-trilho" d="${paArco(PA_MIN, PA_MAX, PA_R_ARCO)}" />
        <g class="pa-marcas">${paMarcasHtml()}</g>
        <g id="pa-segs">${paSegmentosHtml(pa.min, pa.max)}</g>
        <circle id="pa-h-min" class="pa-bolinha min" cx="${xmin.toFixed(2)}" cy="${ymin.toFixed(2)}" r="13"
                tabindex="0" role="slider" aria-label="Pressão mínima"
                aria-valuemin="${PA_MIN}" aria-valuemax="${PA_MAX}" aria-valuenow="${pa.min}" />
        <circle id="pa-h-max" class="pa-bolinha max" cx="${xmax.toFixed(2)}" cy="${ymax.toFixed(2)}" r="13"
                tabindex="0" role="slider" aria-label="Pressão máxima"
                aria-valuemin="${PA_MIN}" aria-valuemax="${PA_MAX}" aria-valuenow="${pa.max}" />
        <text id="pa-leitura" class="pa-leitura" x="140" y="150">${pa.max} / ${pa.min}</text>
        <text class="pa-leitura-un" x="140" y="172">mmHg</text>
      </svg>
    </div>

    <div class="pa-campos">
      <label class="pa-campo">
        <span class="pa-campo-rot">Máxima (sistólica)</span>
        <input type="number" id="pa-in-max" min="${PA_MIN}" max="${PA_MAX}" step="1" inputmode="numeric" value="${pa.max}" />
      </label>
      <span class="pa-barra">/</span>
      <label class="pa-campo">
        <span class="pa-campo-rot">Mínima (diastólica)</span>
        <input type="number" id="pa-in-min" min="${PA_MIN}" max="${PA_MAX}" step="1" inputmode="numeric" value="${pa.min}" />
      </label>
    </div>

    <button class="btn subtle" type="button" data-modo="opcoes">Não consigo medir</button>`;
}

function ligaPainelPressao(item) {
  const st = estadoItem(item.id);

  if (st.modo === "opcoes") {
    ligaOpcoesPainel(item);
    configuraRodapePressao(item);
    return;
  }
  if (st.subEtapa === "confundidores") {
    ligaConfundidores(item);
    configuraRodapePressao(item);
    return;
  }

  /* O mostrador abre com as bolinhas em 0 e 300, mas essa posição NÃO é uma
     leitura: só passa a valer depois que a pessoa mexe. Antes, fechar o
     painel sem tocar gravava 300/0 (hipertensão estágio 3). */
  const pa = st.pressao || { min: PA_MIN, max: PA_MAX };

  const svg = app.querySelector("#pa-svg");
  const segs = app.querySelector("#pa-segs");
  const hMin = app.querySelector("#pa-h-min");
  const hMax = app.querySelector("#pa-h-max");
  const leitura = app.querySelector("#pa-leitura");
  const inMin = app.querySelector("#pa-in-min");
  const inMax = app.querySelector("#pa-in-max");

  const limita = (v) => Math.min(PA_MAX, Math.max(PA_MIN, v));

  // `origem` diz quem disparou, para não sobrescrever o campo sendo digitado.
  const redesenha = (origem) => {
    const [xa, ya] = paPonto(pa.min, PA_R_ARCO);
    const [xb, yb] = paPonto(pa.max, PA_R_ARCO);
    hMin.setAttribute("cx", xa.toFixed(2));
    hMin.setAttribute("cy", ya.toFixed(2));
    hMin.setAttribute("aria-valuenow", pa.min);
    hMax.setAttribute("cx", xb.toFixed(2));
    hMax.setAttribute("cy", yb.toFixed(2));
    hMax.setAttribute("aria-valuenow", pa.max);
    segs.innerHTML = paSegmentosHtml(pa.min, pa.max);
    leitura.textContent = `${pa.max} / ${pa.min}`;
    if (origem !== "campo-min") inMin.value = pa.min;
    if (origem !== "campo-max") inMax.value = pa.max;
    if (origem === "inicial") return;
    st.pressao = pa;
    st.subIndex = null; // valor medido tem prioridade sobre a opção descritiva
  };

  /* Converte a posição do ponteiro em um valor do mostrador.
     A matriz do próprio SVG cuida do viewBox e do preserveAspectRatio. */
  const valorDoEvento = (ev) => {
    const p = svg.createSVGPoint();
    p.x = ev.clientX;
    p.y = ev.clientY;
    const loc = p.matrixTransform(svg.getScreenCTM().inverse());
    const x = loc.x - PA_CX;
    const y = loc.y - PA_CY;
    let ang = (Math.atan2(x, -y) * 180) / Math.PI; // 0 = 12h, cresce no sentido horário
    ang = Math.max(-PA_ANG / 2, Math.min(PA_ANG / 2, ang));
    const v = ((ang + PA_ANG / 2) / PA_ANG) * (PA_MAX - PA_MIN) + PA_MIN;
    return limita(Math.round(v / PA_PASSO) * PA_PASSO);
  };

  let arrastando = null;

  const move = (ev) => {
    if (!arrastando) return;
    ev.preventDefault();
    const v = valorDoEvento(ev);
    if (arrastando === "min") pa.min = Math.min(v, pa.max);
    else pa.max = Math.max(v, pa.min);
    redesenha();
  };

  const solta = () => {
    arrastando = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", solta);
  };

  const pega = (qual) => (ev) => {
    ev.preventDefault();
    arrastando = qual;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", solta);
  };

  hMin.addEventListener("pointerdown", pega("min"));
  hMax.addEventListener("pointerdown", pega("max"));

  // Tocar no mostrador leva a bolinha mais próxima até ali.
  svg.addEventListener("pointerdown", (ev) => {
    if (ev.target === hMin || ev.target === hMax) return;
    const v = valorDoEvento(ev);
    const qual = Math.abs(v - pa.min) <= Math.abs(v - pa.max) ? "min" : "max";
    if (qual === "min") pa.min = Math.min(v, pa.max);
    else pa.max = Math.max(v, pa.min);
    redesenha();
    pega(qual)(ev);
  });

  // Setas do teclado nas bolinhas.
  const teclado = (qual) => (ev) => {
    const passo = ev.key === "PageUp" || ev.key === "PageDown" ? 20 : PA_PASSO;
    let d = 0;
    if (ev.key === "ArrowRight" || ev.key === "ArrowUp" || ev.key === "PageUp") d = passo;
    if (ev.key === "ArrowLeft" || ev.key === "ArrowDown" || ev.key === "PageDown") d = -passo;
    if (!d) return;
    ev.preventDefault();
    if (qual === "min") pa.min = limita(Math.min(pa.min + d, pa.max));
    else pa.max = limita(Math.max(pa.max + d, pa.min));
    redesenha();
  };
  hMin.addEventListener("keydown", teclado("min"));
  hMax.addEventListener("keydown", teclado("max"));

  // Campos escritos e mostrador andam juntos nos dois sentidos.
  inMin.addEventListener("input", () => {
    const v = parseInt(inMin.value, 10);
    if (Number.isNaN(v)) return;
    pa.min = Math.min(limita(v), pa.max);
    redesenha("campo-min");
  });
  inMax.addEventListener("input", () => {
    const v = parseInt(inMax.value, 10);
    if (Number.isNaN(v)) return;
    pa.max = Math.max(limita(v), pa.min);
    redesenha("campo-max");
  });
  // Ao sair do campo, mostra o valor já ajustado.
  inMin.addEventListener("blur", () => redesenha(st.pressao ? undefined : "inicial"));
  inMax.addEventListener("blur", () => redesenha(st.pressao ? undefined : "inicial"));

  redesenha("inicial");

  app.querySelector('[data-modo="opcoes"]').onclick = () => trocaModoPainel(item, "opcoes");
  configuraRodapePressao(item);
}

/* --------------------- Painel: oxímetro (SpO2 e FC) ---------------------- */
/* Um aparelho só, dois sintomas. Medir por qualquer um dos dois grava a
   mesma leitura nos dois — é o que o oxímetro de dedo mostra na prática. */

const SPO2_MIN = 70;
const SPO2_MAX = 100;
const FC_MIN = 20;
const FC_MAX = 220;
const SPO2_PADRAO = 97;
const FC_PADRAO = 75;
const OXIMETRO_ITENS = ["spo2", "frequencia_cardiaca"];

/* Segundos de traçado que cabem na tela do aparelho. Define quantas batidas
   aparecem para cada frequência: mais rápido, mais batidas na mesma largura. */
const OXI_JANELA_S = 4;
const OXI_W = 240;
const OXI_H = 56;
const OXI_BASE = OXI_H - 7;
const OXI_AMP = OXI_H - 17;
/* Velocidade de varredura, em unidades por segundo. Constante: o que muda
   com a frequência é quantas batidas cabem, não a rapidez do traçado. */
const OXI_VEL = OXI_W / OXI_JANELA_S;

/* `abertoMin` / `abertoMax` marcam as pontas que significam "ou menos" e
   "ou mais" — um oxímetro pode mostrar valor fora da régua, e a ponta é
   onde ele é registrado. A saturação não passa de 100%, então só a ponta
   de baixo é aberta. */
const ESCALAS_OXI = {
  spo2: {
    rotulo: "SpO2",
    aria: "Saturação de oxigênio, em porcentagem",
    unidade: "%",
    min: SPO2_MIN,
    max: SPO2_MAX,
    passo: 1,
    rotulos: [70, 80, 90, 94, 100],
    abertoMin: true,
    abertoMax: false,
    classifica: (v) => classificaSpo2(v),
  },
  fc: {
    rotulo: "Frequência cardíaca",
    aria: "Frequência cardíaca, em batimentos por minuto",
    unidade: " bpm",
    min: FC_MIN,
    max: FC_MAX,
    passo: 5,
    rotulos: [20, 40, 60, 100, 140, 220],
    abertoMin: true,
    abertoMax: true,
    classifica: (v) => classificaFc(v),
  },
};

/* Rótulo de um valor da escala: "70-" e "220+" nas pontas abertas. */
function oxiRotuloEscala(esc, v) {
  if (esc.abertoMin && v === esc.min) return `${v}-`;
  if (esc.abertoMax && v === esc.max) return `${v}+`;
  return String(v);
}

/* O mesmo, por extenso, para o resumo mostrado no item e no fim. */
function oxiTextoValor(esc, v) {
  if (esc.abertoMin && v <= esc.min) return `${esc.min}${esc.unidade} ou menos`;
  if (esc.abertoMax && v >= esc.max) return `${esc.max}${esc.unidade} ou mais`;
  return `${v}${esc.unidade}`;
}

function sintomaPorId(id) {
  for (const cat of SYMPTOM_CATEGORIES) {
    const item = cat.items.find((i) => i.id === id);
    if (item) return item;
  }
  return null;
}

/* Sintomas que compartilham a medição deste item. */
function companheirosDeMedicao(item) {
  if (item.painel !== "oximetro") return [];
  return OXIMETRO_ITENS.filter((id) => id !== item.id)
    .map(sintomaPorId)
    .filter(Boolean);
}

/* Classificam a leitura em uma das opções já existentes do sintoma. */
function classificaSpo2(v) {
  if (v < 90) return { indice: 2, rotulo: "Hipoxemia grave", zona: "grave" };
  if (v < 94) return { indice: 1, rotulo: "Hipoxemia leve", zona: "leve" };
  return { indice: 0, rotulo: "Saturação normal", zona: "normal" };
}

/* Faixas de FC (bpm, acordado) por idade. As pediátricas seguem as faixas
   usuais do suporte avançado de vida pediátrico; antes, um bebê com FC 150
   (normal) ia ao hospital e um com FC 80 (bradicardia grave) ia à UBS.
   min/max = faixa normal; gMin/gMax = a partir daqui é "muito alterada". */
const FAIXAS_FC = {
  bebe_ate_3m: { rotulo: "Até 3 meses", min: 85, max: 205, gMin: 70, gMax: 220 },
  bebe_ate_2a: { rotulo: "3 meses a 2 anos", min: 100, max: 190, gMin: 80, gMax: 220 },
  crianca: { rotulo: "2 a 10 anos", min: 60, max: 140, gMin: 50, gMax: 180 },
  adulto: { rotulo: "Mais de 10 anos e adultos", min: 50, max: 100, gMin: 40, gMax: 140 },
};

function bandaFc() {
  const st = typeof state !== "undefined" ? state : null;
  if (!st || typeof st.idade !== "number") return "adulto"; // sem idade: padrão adulto
  if (st.idade === 0) {
    const sem = st.semanas_bebe;
    return typeof sem === "number" && sem >= 13 ? "bebe_ate_2a" : "bebe_ate_3m";
  }
  if (st.idade < 2) return "bebe_ate_2a";
  if (st.idade <= 10) return "crianca";
  return "adulto";
}

function classificaFc(v, banda = bandaFc()) {
  const f = FAIXAS_FC[banda];
  if (v < f.gMin) return { indice: 2, rotulo: "Bradicardia grave", zona: "grave" };
  if (v >= f.gMax) return { indice: 2, rotulo: "Taquicardia grave", zona: "grave" };
  if (v < f.min) return { indice: 1, rotulo: "Bradicardia", zona: "leve" };
  if (v > f.max) return { indice: 1, rotulo: "Taquicardia", zona: "leve" };
  return { indice: 0, rotulo: "Frequência normal para a idade", zona: "normal" };
}

/* Recalcula a FC pela idade antes de usar (a idade pode mudar depois). */
function sincronizaOximetro() {
  const st = state.sintomas.frequencia_cardiaca;
  if (!st || !st.checked || !st.oxi) return;
  st.subIndex = classificaFc(st.oxi.fc).indice;
}

/* A leitura vive nos dois sintomas; vale a primeira que existir. */
function leituraOximetro() {
  for (const id of OXIMETRO_ITENS) {
    const st = state.sintomas[id];
    if (st && st.oxi) return { spo2: st.oxi.spo2, fc: st.oxi.fc };
  }
  return { spo2: SPO2_PADRAO, fc: FC_PADRAO };
}

function gravaOximetro(oxi) {
  OXIMETRO_ITENS.forEach((id) => {
    const st = estadoItem(id);
    st.checked = true;
    st.oxi = { spo2: oxi.spo2, fc: oxi.fc };
  });
  state.sintomas.spo2.subIndex = classificaSpo2(oxi.spo2).indice;
  state.sintomas.frequencia_cardiaca.subIndex = classificaFc(oxi.fc).indice;
}

/* "Não consegui medir": sem aparelho não há o que estimar, então os dois
   sintomas ficam na última opção — que não encaminha por si só. */
function naoMediuOximetro() {
  OXIMETRO_ITENS.forEach((id) => {
    const st = estadoItem(id);
    st.checked = true;
    st.oxi = null;
    st.subIndex = sintomaPorId(id).sub.options.length - 1;
  });
}

/* Uma batida da curva pletismográfica, em x..x+w: subida rápida, pico,
   entalhe dicrótico e queda até a linha de base. */
function oxiBatidaPath(x, w, base, amp) {
  const px = (f) => (x + f * w).toFixed(2);
  const py = (f) => (base - f * amp).toFixed(2);
  return (
    `M${px(0)},${py(0)}` +
    `C${px(0.08)},${py(0)} ${px(0.13)},${py(1)} ${px(0.22)},${py(1)}` +
    `C${px(0.3)},${py(1)} ${px(0.33)},${py(0.46)} ${px(0.41)},${py(0.43)}` +
    `C${px(0.47)},${py(0.41)} ${px(0.49)},${py(0.56)} ${px(0.56)},${py(0.52)}` +
    `C${px(0.7)},${py(0.46)} ${px(0.8)},${py(0)} ${px(1)},${py(0)}`
  );
}

/* O traçado é periódico: a animação o desloca por exatamente uma batida,
   então ele precisa ser desenhado além da borda direita para emendar.
   Largura/período é constante, ou seja, a varredura corre sempre na mesma
   velocidade — o que muda com a frequência é quantas batidas cabem. */
function oxiLarguraBatida(fc) {
  return OXI_W / Math.max(1, (fc / 60) * OXI_JANELA_S);
}

/* Traçado uniforme, usado quando o movimento está desligado no sistema. */
function oxiOnda(fc) {
  const largura = oxiLarguraBatida(fc);
  let d = "";
  for (let i = 0; i < Math.ceil(OXI_W / largura) + 2; i++) {
    d += oxiBatidaPath(i * largura, largura, OXI_BASE, OXI_AMP);
  }
  return { d, largura, periodo: 60 / fc };
}

function oxiMarcasHtml(esc) {
  const marcas = [];
  for (let v = esc.min; v <= esc.max; v += esc.passo) {
    const p = ((v - esc.min) / (esc.max - esc.min)) * 100;
    const maior = esc.rotulos.includes(v);
    marcas.push(
      `<i class="oxi-traco zona-${esc.classifica(v).zona}${maior ? " maior" : ""}" style="left:${p.toFixed(3)}%">` +
        `${maior ? `<b>${oxiRotuloEscala(esc, v)}</b>` : ""}</i>`
    );
  }
  return marcas.join("");
}

function oxiControleHtml(chave, valor) {
  const esc = ESCALAS_OXI[chave];
  const fill = ((valor - esc.min) / (esc.max - esc.min)) * 100;
  const cls = esc.classifica(valor);
  return `
    <div class="oxi-controle">
      <div class="oxi-ctrl-topo">
        <span class="oxi-ctrl-rot">${esc.rotulo}</span>
        <span class="oxi-ctrl-estado zona-${cls.zona}" id="oxi-est-${chave}">${cls.rotulo}</span>
      </div>
      <div class="oxi-regua">
        <div class="oxi-tracos">${oxiMarcasHtml(esc)}</div>
        <input type="range" class="oxi-range" id="oxi-range-${chave}"
               min="${esc.min}" max="${esc.max}" step="1" value="${valor}"
               style="--fill:${fill.toFixed(2)}%" aria-label="${esc.aria}" />
      </div>
    </div>`;
}

function painelOximetroHtml(item) {
  const oxi = leituraOximetro();
  const cs = classificaSpo2(oxi.spo2);
  const cf = classificaFc(oxi.fc);
  const onda = oxiOnda(oxi.fc);

  return `
    <p class="hint">Ajuste os valores como aparecem no oxímetro — pelas réguas ou escrevendo direto no número. A mesma leitura vale para a saturação e para a frequência cardíaca.</p>

    <div class="oxi">
      <div class="oxi-corpo">
        <div class="oxi-tela">
          <div class="oxi-numeros">
            <div class="oxi-medida zona-${cs.zona}" id="oxi-med-spo2">
              <span class="oxi-rot">%SpO2</span>
              <input class="oxi-num" id="oxi-num-spo2" type="number" inputmode="numeric"
                     min="${SPO2_MIN}" max="${SPO2_MAX}" step="1" value="${oxi.spo2}"
                     aria-label="Saturação de oxigênio, em porcentagem" />
            </div>
            <div class="oxi-medida zona-${cf.zona}" id="oxi-med-fc">
              <span class="oxi-rot">PR bpm</span>
              <input class="oxi-num" id="oxi-num-fc" type="number" inputmode="numeric"
                     min="${FC_MIN}" max="${FC_MAX}" step="1" value="${oxi.fc}"
                     aria-label="Frequência cardíaca, em batimentos por minuto" />
            </div>
          </div>

          <svg class="oxi-onda zona-${cf.zona}" id="oxi-onda" viewBox="0 0 ${OXI_W} ${OXI_H}"
               preserveAspectRatio="none" aria-hidden="true">
            <g id="oxi-onda-g">
              <path id="oxi-onda-path" d="${onda.d}" />
            </g>
          </svg>
        </div>
        <div class="oxi-garra" aria-hidden="true"><span></span></div>
      </div>

      ${oxiControleHtml("spo2", oxi.spo2)}
      ${oxiControleHtml("fc", oxi.fc)}
    </div>

    <button class="btn subtle" type="button" data-modo="opcoes">Não consegui medir</button>`;
}

function ligaPainelOximetro(item) {
  const oxi = leituraOximetro();

  const numSpo2 = app.querySelector("#oxi-num-spo2");
  const numFc = app.querySelector("#oxi-num-fc");
  const rgSpo2 = app.querySelector("#oxi-range-spo2");
  const rgFc = app.querySelector("#oxi-range-fc");
  const medSpo2 = app.querySelector("#oxi-med-spo2");
  const medFc = app.querySelector("#oxi-med-fc");
  const estSpo2 = app.querySelector("#oxi-est-spo2");
  const estFc = app.querySelector("#oxi-est-fc");
  const svgOnda = app.querySelector("#oxi-onda");
  const grupoOnda = app.querySelector("#oxi-onda-g");
  const traco = app.querySelector("#oxi-onda-path");

  const limita = (v, min, max) => Math.min(max, Math.max(min, v));
  const pct = (v, min, max) => (((v - min) / (max - min)) * 100).toFixed(2) + "%";
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // `origem` diz quem disparou, para não sobrescrever o campo em digitação.
  const redesenha = (origem) => {
    const cs = classificaSpo2(oxi.spo2);
    const cf = classificaFc(oxi.fc);

    if (origem !== "num-spo2") numSpo2.value = oxi.spo2;
    if (origem !== "num-fc") numFc.value = oxi.fc;
    if (origem !== "range-spo2") rgSpo2.value = oxi.spo2;
    if (origem !== "range-fc") rgFc.value = oxi.fc;

    rgSpo2.style.setProperty("--fill", pct(oxi.spo2, SPO2_MIN, SPO2_MAX));
    rgFc.style.setProperty("--fill", pct(oxi.fc, FC_MIN, FC_MAX));

    medSpo2.className = "oxi-medida zona-" + cs.zona;
    medFc.className = "oxi-medida zona-" + cf.zona;
    estSpo2.textContent = cs.rotulo;
    estSpo2.className = "oxi-ctrl-estado zona-" + cs.zona;
    estFc.textContent = cf.rotulo;
    estFc.className = "oxi-ctrl-estado zona-" + cf.zona;

    svgOnda.setAttribute("class", "oxi-onda zona-" + cf.zona);
    if (semMovimento) traco.setAttribute("d", oxiOnda(oxi.fc).d);

    gravaOximetro(oxi);
  };

  /* ---------------------------- Traçado rolante -------------------------
     Cada batida guarda a largura que a frequência tinha quando ela entrou
     na tela. Mudar a FC só afeta as batidas que entram depois — as que já
     estão desenhadas continuam com o espaçamento antigo, como num monitor
     de verdade. O traçado rola sempre na mesma velocidade. */

  let batidas = [];
  let fimTracado = 0; // x da borda direita da última batida criada
  let rolagem = 0; // quanto o traçado já correu, em unidades do viewBox

  /* Completa à direita e descarta o que saiu pela esquerda.
     Devolve true quando a lista mudou e o caminho precisa ser refeito. */
  const completaTracado = () => {
    let mudou = false;

    while (fimTracado < rolagem + OXI_W + 1) {
      const largura = oxiLarguraBatida(oxi.fc);
      batidas.push({ x: fimTracado, largura });
      fimTracado += largura;
      mudou = true;
    }

    const primeiraVisivel = batidas.findIndex((b) => b.x + b.largura > rolagem);
    if (primeiraVisivel > 0) {
      batidas = batidas.slice(primeiraVisivel);
      mudou = true;
    }

    // Reancora de vez em quando, para os números não crescerem sem fim.
    if (batidas.length && batidas[0].x > 1e4) {
      const base = batidas[0].x;
      batidas.forEach((b) => (b.x -= base));
      fimTracado -= base;
      rolagem -= base;
      mudou = true;
    }

    return mudou;
  };

  const refazTracado = () => {
    traco.setAttribute("d", batidas.map((b) => oxiBatidaPath(b.x, b.largura, OXI_BASE, OXI_AMP)).join(""));
  };

  let quadroAnterior = null;

  const quadro = (t) => {
    // O painel foi fechado ou refeito: o laço morre junto com o elemento.
    if (!document.contains(svgOnda)) return;

    if (quadroAnterior != null) {
      // Limita o salto de quando a aba fica em segundo plano.
      rolagem += Math.min((t - quadroAnterior) / 1000, 0.25) * OXI_VEL;
    }
    quadroAnterior = t;

    if (completaTracado()) refazTracado();
    grupoOnda.setAttribute("transform", `translate(${(-rolagem).toFixed(2)} 0)`);
    requestAnimationFrame(quadro);
  };

  if (!semMovimento) {
    completaTracado();
    refazTracado();
    requestAnimationFrame(quadro);
  }

  rgSpo2.addEventListener("input", () => {
    oxi.spo2 = Number(rgSpo2.value);
    redesenha("range-spo2");
  });
  rgFc.addEventListener("input", () => {
    oxi.fc = Number(rgFc.value);
    redesenha("range-fc");
  });

  numSpo2.addEventListener("input", () => {
    const v = parseInt(numSpo2.value, 10);
    if (Number.isNaN(v)) return;
    oxi.spo2 = limita(v, SPO2_MIN, SPO2_MAX);
    redesenha("num-spo2");
  });
  numFc.addEventListener("input", () => {
    const v = parseInt(numFc.value, 10);
    if (Number.isNaN(v)) return;
    oxi.fc = limita(v, FC_MIN, FC_MAX);
    redesenha("num-fc");
  });

  // Ao sair do campo, mostra o valor já ajustado aos limites.
  numSpo2.addEventListener("blur", () => redesenha());
  numFc.addEventListener("blur", () => redesenha());

  redesenha(); // grava já a leitura inicial, como o termômetro

  app.querySelector('[data-modo="opcoes"]').onclick = () => {
    naoMediuOximetro();
    fechaPainel(item);
  };
}

/* ------------------------ Painel: glicosímetro --------------------------- */

const GLIC_MIN = 0;
const GLIC_MAX = 300;
const GLIC_PADRAO = 95;
const GLIC_BAIXA = 70; // abaixo disso é hipoglicemia, em qualquer faixa
const GLIC_ROTULOS = [0, 70, 140, 210, 300];

/* Gota de sangue: ponta em cima, barriga redonda embaixo. */
const GLIC_GOTA = "M55 6C55 6 103 66 103 100A48 48 0 1 1 7 100C7 66 55 6 55 6Z";
const GLIC_GOTA_TOPO = 6;
const GLIC_GOTA_BASE = 148;

const GLICOSE_MOMENTOS = { jejum: "Em jejum", poscomer: "2 h depois de comer" };

/* Limites de glicemia em mg/dL, por faixa etária, momento da medição e
   diagnóstico prévio de diabetes.
     alvo   = maior valor ainda dentro do esperado
     alerta = valor a partir do qual a leitura é "bem acima"; null quando a
              tabela de referência não traz um segundo corte para o caso. */
const GLICOSE_TABELA = {
  crianca_adolescente: {
    rotulo: "Crianças e adolescentes",
    jejum: { sem: { alvo: 100, alerta: 126 }, com: { alvo: 125, alerta: null } },
    poscomer: { sem: { alvo: 139, alerta: null }, com: { alvo: 180, alerta: null } },
  },
  adulto: {
    rotulo: "Adultos",
    jejum: { sem: { alvo: 99, alerta: 126 }, com: { alvo: 125, alerta: null } },
    poscomer: { sem: { alvo: 139, alerta: null }, com: { alvo: 179, alerta: 200 } },
  },
  idoso: {
    rotulo: "Idosos",
    jejum: { sem: { alvo: 110, alerta: 126 }, com: { alvo: 125, alerta: null } },
    poscomer: { sem: { alvo: 139, alerta: null }, com: { alvo: 180, alerta: null } },
  },
  /* Na gestação a referência é a mesma com ou sem diagnóstico: são as metas
     do pré-natal, e é justamente ultrapassá-las que caracteriza a diabetes
     gestacional. */
  gestante: {
    rotulo: "Gestantes",
    jejum: { sem: { alvo: 91, alerta: 92 }, com: { alvo: 91, alerta: null } },
    poscomer: { sem: { alvo: 119, alerta: null }, com: { alvo: 119, alerta: null } },
  },
};

/* Reaproveita as faixas etárias da própria triagem, para não existirem duas
   definições de "adolescente" no mesmo código. */
function bandaGlicose() {
  if (state.subpopulacao === "gravida") return "gestante";
  const pop = state.populacao;
  if (pop === "crianca_clinica" || pop === "adolescente_clinico") return "crianca_adolescente";
  if (pop === "idoso_clinico") return "idoso";
  return "adulto"; // inclui idade "não sei"
}

function temDiabetes() {
  const st = state.comorbidades.diabetes;
  return !!(st && st.checked);
}

function glicoseLimites(momento) {
  const chave = bandaGlicose();
  const faixa = GLICOSE_TABELA[chave];
  const com = temDiabetes();
  const lim = faixa[momento][com ? "com" : "sem"];
  return { chave, rotulo: faixa.rotulo, alvo: lim.alvo, alerta: lim.alerta, comDiabetes: com };
}

/* Classifica em uma das opções já existentes do sintoma. */
function classificaGlicose(valor, momento) {
  const lim = glicoseLimites(momento);
  if (valor < GLIC_BAIXA) return { indice: 1, zona: "grave", rotulo: "Abaixo do esperado", lim };
  if (valor <= lim.alvo) return { indice: 0, zona: "normal", rotulo: "Dentro do esperado", lim };
  if (lim.alerta != null && valor >= lim.alerta) {
    return { indice: 3, zona: "grave", rotulo: "Bem acima do esperado", lim };
  }
  return { indice: 2, zona: "leve", rotulo: "Acima do esperado", lim };
}

/* A classificação depende de idade, gestação e diabetes — e o histórico de
   saúde pode ser editado depois da medição. Recalcula antes de usar, para a
   resposta nunca ficar velha. */
function sincronizaGlicose() {
  const st = state.sintomas.glicose;
  if (!st || !st.checked || !st.glicose) return;
  st.subIndex = classificaGlicose(st.glicose.valor, st.glicose.momento).indice;
}

function glicoseEstado(item) {
  const st = estadoItem(item.id);
  if (!st.glicose) st.glicose = { valor: GLIC_PADRAO, momento: "jejum" };
  return st;
}

function glicFracao(valor) {
  return (valor - GLIC_MIN) / (GLIC_MAX - GLIC_MIN);
}

/* Topo do preenchimento da gota, em unidades do viewBox. */
function glicTopoCheio(valor) {
  return GLIC_GOTA_BASE - glicFracao(valor) * (GLIC_GOTA_BASE - GLIC_GOTA_TOPO);
}

function glicMarcasHtml() {
  return GLIC_ROTULOS.map((v) => {
    const p = glicFracao(v) * 100;
    return `<div class="glic-marca" style="bottom:${p}%"><span>${v === GLIC_MAX ? GLIC_MAX + "+" : v}</span></div>`;
  }).join("");
}

function glicEsperadoTexto(lim) {
  return `Esperado para ${lim.rotulo.toLowerCase()}${lim.comDiabetes ? " com diabetes" : ""}: ${GLIC_BAIXA} a ${lim.alvo} mg/dL`;
}

function painelGlicoseHtml(item) {
  const g = glicoseEstado(item).glicose;
  const cls = classificaGlicose(g.valor, g.momento);
  const topo = glicTopoCheio(g.valor);

  return `
    <p class="hint">Arraste a gota ou escreva o valor que apareceu no aparelho.</p>

    <div class="glic">
      <div class="glic-momento" role="group" aria-label="Momento da medição">
        ${Object.entries(GLICOSE_MOMENTOS)
          .map(
            ([chave, rotulo]) =>
              `<button type="button" data-momento="${chave}" class="${g.momento === chave ? "ativo" : ""}"
                       aria-pressed="${g.momento === chave}">${rotulo}</button>`
          )
          .join("")}
      </div>

      <div class="glic-corpo">
        <div class="glic-tela zona-${cls.zona}" id="glic-tela">
          <div class="glic-leitura">
            <input class="glic-num" id="glic-num" type="number" inputmode="numeric"
                   min="${GLIC_MIN}" max="${GLIC_MAX}" step="1" value="${g.valor}"
                   aria-label="Glicose, em miligramas por decilitro" />
            <span class="glic-un">mg/dL</span>
          </div>
          <div class="glic-estado" id="glic-estado">${cls.rotulo}</div>
        </div>

        <div class="glic-medidor">
          <div class="glic-marcas">${glicMarcasHtml()}</div>

          <div class="glic-gota zona-${cls.zona}" id="glic-gota">
            <svg viewBox="0 0 110 154" role="img" aria-hidden="true">
              <defs>
                <clipPath id="glic-recorte"><path d="${GLIC_GOTA}" /></clipPath>
              </defs>
              <path class="glic-gota-fundo" d="${GLIC_GOTA}" />
              <g clip-path="url(#glic-recorte)">
                <rect class="glic-gota-cheia" id="glic-cheia" x="0" width="110"
                      y="${topo.toFixed(2)}" height="${(GLIC_GOTA_BASE - topo).toFixed(2)}" />
              </g>
              <path class="glic-gota-borda" d="${GLIC_GOTA}" />
              <ellipse class="glic-gota-brilho" cx="38" cy="86" rx="11" ry="16" />
            </svg>

            <input type="range" class="glic-range" id="glic-range"
                   min="${GLIC_MIN}" max="${GLIC_MAX}" step="1" value="${g.valor}"
                   aria-label="Glicose, em miligramas por decilitro" />
          </div>
        </div>

        <div class="glic-tira" aria-hidden="true"><span></span></div>
      </div>

      <p class="glic-ref" id="glic-ref">${glicEsperadoTexto(cls.lim)}</p>
    </div>

    <button class="btn subtle" type="button" data-modo="opcoes">Não consegui medir</button>`;
}

function ligaPainelGlicose(item) {
  const st = glicoseEstado(item);
  const g = st.glicose;

  const num = app.querySelector("#glic-num");
  const range = app.querySelector("#glic-range");
  const gota = app.querySelector("#glic-gota");
  const cheia = app.querySelector("#glic-cheia");
  const tela = app.querySelector("#glic-tela");
  const estado = app.querySelector("#glic-estado");
  const ref = app.querySelector("#glic-ref");

  const limita = (v) => Math.min(GLIC_MAX, Math.max(GLIC_MIN, v));

  // `origem` diz quem disparou, para não sobrescrever o campo em digitação.
  const redesenha = (origem) => {
    const cls = classificaGlicose(g.valor, g.momento);

    if (origem !== "campo") num.value = g.valor;
    if (origem !== "gota") range.value = g.valor;

    const topo = glicTopoCheio(g.valor);
    cheia.setAttribute("y", topo.toFixed(2));
    cheia.setAttribute("height", (GLIC_GOTA_BASE - topo).toFixed(2));

    tela.className = "glic-tela zona-" + cls.zona;
    gota.className = "glic-gota zona-" + cls.zona;
    estado.textContent = cls.rotulo;
    ref.textContent = glicEsperadoTexto(cls.lim);

    st.glicose = { valor: g.valor, momento: g.momento };
    st.subIndex = cls.indice;
  };

  range.addEventListener("input", () => {
    g.valor = Number(range.value);
    redesenha("gota");
  });

  num.addEventListener("input", () => {
    const v = parseInt(num.value, 10);
    if (Number.isNaN(v)) return;
    g.valor = limita(v);
    redesenha("campo");
  });
  num.addEventListener("blur", () => redesenha());

  app.querySelectorAll("[data-momento]").forEach((b) => {
    b.onclick = () => {
      g.momento = b.dataset.momento;
      app.querySelectorAll("[data-momento]").forEach((o) => {
        const ativo = o === b;
        o.classList.toggle("ativo", ativo);
        o.setAttribute("aria-pressed", String(ativo));
      });
      redesenha();
    };
  });

  redesenha(); // grava já a leitura inicial, como os outros aparelhos

  app.querySelector('[data-modo="opcoes"]').onclick = () => {
    st.glicose = null;
    st.subIndex = item.sub.options.length - 1; // "Não consegui medir"
    fechaPainel(item);
  };
}

/* Rótulos de exibição para o estágio da pressão (dadospressao.js /
   sinergias.js usam as chaves internas, sem essa formatação). */
const ROTULO_ESTAGIO_PA = {
  normal: "Pressão normal",
  "pre-hipertensão": "Pré-hipertensão",
  hipertensão: "Hipertensão",
  "hipertensão 1": "Hipertensão estágio 1",
  "hipertensão 2": "Hipertensão estágio 2",
  "hipertensão 3": "Hipertensão estágio 3",
};

/* Texto curto da medição, mostrado no item e no resumo final. */
function resumoMedicao(item) {
  const st = state.sintomas[item.id];
  if (!st) return "";
  if (item.painel === "febre" && st.medida != null) {
    return `${st.medida.toFixed(1)} °C · ${classificaTemperatura(st.medida).rotulo}`;
  }
  if (item.painel === "glicose" && st.glicose) {
    const cls = classificaGlicose(st.glicose.valor, st.glicose.momento);
    const v = st.glicose.valor >= GLIC_MAX ? `${GLIC_MAX}+` : st.glicose.valor;
    return `${v} mg/dL · ${GLICOSE_MOMENTOS[st.glicose.momento].toLowerCase()} · ${cls.rotulo}`;
  }
  if (item.painel === "oximetro" && st.oxi) {
    return item.id === "spo2"
      ? `${oxiTextoValor(ESCALAS_OXI.spo2, st.oxi.spo2)} · ${classificaSpo2(st.oxi.spo2).rotulo}`
      : `${oxiTextoValor(ESCALAS_OXI.fc, st.oxi.fc)} · ${classificaFc(st.oxi.fc).rotulo}`;
  }
  if (item.painel === "pressao" && st.pressao) {
    let txt = `${st.pressao.max} / ${st.pressao.min} mmHg`;
    const estagio = typeof classificaPressao === "function" ? classificaPressao(state) : null;
    const hipo = typeof classificaHipotensao === "function" ? classificaHipotensao(state) : null;
    if (hipo === "hipotensão grave") txt += " · Hipotensão grave";
    else if (hipo === "hipotensão") txt += " · Hipotensão";
    else if (estagio && ROTULO_ESTAGIO_PA[estagio]) txt += ` · ${ROTULO_ESTAGIO_PA[estagio]}`;
    if (st.alterada) txt += " · possíveis fatores de alteração";
    return txt;
  }
  if (st.subIndex != null && item.sub) return item.sub.options[st.subIndex].label;
  return "Sem resposta";
}

/* --------------- 5. Sintomas — uma parte por sistema do corpo ------------ */

function totalMarcados() {
  return Object.values(state.sintomas).filter((s) => s.checked).length;
}

function iconeSistema(cat, tamanho) {
  const paths = cat.icon
    .split("@@")
    .map((d) => `<path d="${d}"/>`)
    .join("");
  return `<svg viewBox="0 0 24 24" width="${tamanho}" height="${tamanho}" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

/* Trilha de sistemas: mostra todas as partes, permite pular entre elas
   e indica quantos sintomas já foram marcados em cada uma. */
function trilhaHtml() {
  return `<div class="trilha" id="trilha">${SYMPTOM_CATEGORIES.map((cat, i) => {
    const n = contaMarcados(cat, "sint");
    return `
      <button class="trilha-item ${i === state.sintomaParte ? "atual" : ""} ${n ? "marcado" : ""}"
              type="button" data-parte="${i}" aria-current="${i === state.sintomaParte}">
        ${iconeSistema(cat, 16)}
        <span class="trilha-nome">${cat.curto}</span>
        ${n ? `<span class="trilha-count">${n}</span>` : ""}
      </button>`;
  }).join("")}</div>`;
}

/* Recalcula a trilha e o rodapé sem redesenhar a parte inteira. */
function atualizaTrilha() {
  const trilha = app.querySelector("#trilha");
  if (trilha) {
    const nova = el(trilhaHtml());
    trilha.replaceWith(nova);
    ligaTrilha();
  }
  const contador = app.querySelector("#contador-sintomas");
  if (contador) contador.textContent = textoContador();
}

function textoContador() {
  const n = totalMarcados();
  if (!n) return "Nenhum sintoma marcado até aqui";
  return n === 1 ? "1 sintoma marcado até aqui" : `${n} sintomas marcados até aqui`;
}

function ligaTrilha() {
  app.querySelectorAll("[data-parte]").forEach((b) => {
    b.onclick = () => {
      const i = Number(b.dataset.parte);
      if (i !== state.sintomaParte) irParaParte(i);
    };
  });
}

function renderSintomas() {
  const total = SYMPTOM_CATEGORIES.length;
  const i = state.sintomaParte;
  const cat = SYMPTOM_CATEGORIES[i];
  const ultima = i === total - 1;
  state.painel = null; // painéis são efêmeros; a resposta é que fica guardada

  app.appendChild(
    h(`
    ${progressHtml()}
    ${trilhaHtml()}
    <div class="slide-wrap" id="slide-wrap">
      <div class="slide-track">
        <div class="slide-pane" id="pane-main">
          <div class="card">
            ${backHtml()}
            <span class="eyebrow">Sintomas · parte ${i + 1} de ${total}</span>

            <div class="sistema-head">
              <span class="sistema-icone">${iconeSistema(cat, 24)}</span>
              <h2 class="sistema-nome">${cat.title}</h2>
            </div>
            <p class="hint">Marque o que a pessoa apresenta neste sistema. Se não houver nada, siga em frente.</p>

            <div class="item-list">
              ${cat.items.map((item) => itemHtml(item, "sint")).join("")}
            </div>

            <div class="error-text" id="erro-sintomas" hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.8v4.6M12 16.2h.01"/></svg>
              Selecione pelo menos um sintoma antes de ver o encaminhamento.
            </div>

            <div class="parte-rodape">
              <span id="contador-sintomas">${textoContador()}</span>
            </div>

            <div class="btn-row">
              ${
                i > 0
                  ? `<button class="btn subtle" type="button" data-action="anterior">Anterior</button>`
                  : ""
              }
              <button class="btn primary grow-2" type="button" data-action="${ultima ? "finalizar" : "proximo"}">
                ${ultima ? "Ver encaminhamento" : "Próximo sistema"}
              </button>
            </div>

            ${
              ultima
                ? ""
                : `<button class="btn atalho" type="button" data-action="finalizar">Ver encaminhamento</button>`
            }
          </div>
        </div>
        <div class="slide-pane" id="pane-painel"></div>
      </div>
    </div>
  `)
  );

  // Liga apenas os itens da parte visível.
  cat.items.forEach((item) => {
    const node = app.querySelector(`.check-item[data-item="${item.id}"]`);
    if (node) ligaItem(node, item, "sint", SYMPTOM_CATEGORIES);
  });
  ligaTrilha();

  const anterior = app.querySelector('[data-action="anterior"]');
  if (anterior) anterior.onclick = () => irParaParte(i - 1);

  const proximo = app.querySelector('[data-action="proximo"]');
  if (proximo) proximo.onclick = () => irParaParte(i + 1);

  app.querySelectorAll('[data-action="finalizar"]').forEach((b) => (b.onclick = pedeEncaminhamento));

  // Rede de segurança para navegadores sem `overflow: clip`: se o foco em um
  // campo do painel fizer o contêiner rolar, devolve-o à posição zero.
  const wrap = app.querySelector("#slide-wrap");
  wrap.addEventListener("scroll", () => {
    if (wrap.scrollLeft !== 0) wrap.scrollLeft = 0;
  });
  inicializaAlturaSlide(wrap, app.querySelector("#pane-main"));

  wireBack();
}

/* Pede o encaminhamento; avisa se ainda faltam sistemas por ver. */
function pedeEncaminhamento() {
  if (!totalMarcados()) {
    const erro = app.querySelector("#erro-sintomas");
    erro.hidden = false;
    erro.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }

  const faltam = SYMPTOM_CATEGORIES.length - state.partesVistas.size;
  if (faltam > 0) {
    const nomes = SYMPTOM_CATEGORIES.filter((_, i) => !state.partesVistas.has(i))
      .map((c) => c.curto)
      .join(", ");
    abreModal({
      titulo: "Ver o encaminhamento agora?",
      texto: `Você ainda não abriu ${
        faltam === 1 ? "1 sistema" : `${faltam} sistemas`
      }: ${nomes}. Sintomas não marcados podem mudar o encaminhamento.`,
      cancelar: "Revisar",
      confirmar: "Ver agora",
      aoConfirmar: avancaTriagem,
    });
    return;
  }

  avancaTriagem();
}

/* ------------------------------ Resultado -------------------------------- */

/* Marcou só febre e/ou pressão, e as duas medições deram normais: não há o
   que avaliar num serviço de saúde agora. Exige medição numérica — quem
   respondeu "não consigo medir" continua indo para a UBS. */
/* Opção que vale para o sintoma: a resposta marcada ou, sem resposta, a
   última da lista — sempre a mais conservadora. O termômetro grava
   `subIndex` a cada leitura, então a medição entra por aqui também. */
function opcaoMarcada(item) {
  if (!item.sub) return null;
  const st = state.sintomas[item.id];
  return item.sub.options[st.subIndex ?? item.sub.options.length - 1];
}

/* Marcações que, sozinhas, não pedem atendimento: as opções com `casa`
   (hoje, febre baixa e temperatura normal, que o termômetro mapeia para a
   mesma opção) e a pressão medida com classificação normal. */
function dispensaAtendimento(item) {
  const st = state.sintomas[item.id];

  if (item.painel === "pressao") {
    return (
      st.pressao != null &&
      typeof classificaPressao === "function" &&
      classificaPressao(state) === "normal" &&
      !(typeof classificaHipotensao === "function" && classificaHipotensao(state))
    );
  }

  const opt = opcaoMarcada(item);
  return !!(opt && opt.casa);
}

/* Condições do histórico que não impedem o "cuidado em casa". Qualquer outra
   (tuberculose, HIV, diabetes, doença renal, câncer...) leva pelo menos à UBS:
   antes, um paciente com tuberculose e febre de 38 °C era mandado para casa. */
const HISTORICO_PERMITE_CASA = ["hipertensao", "obesidade_grave", "doenca_tireoide", "transtorno_psiquiatrico"];

function historicoPermiteCasa() {
  return Object.entries(state.comorbidades).every(
    ([id, st]) => !st || !st.checked || HISTORICO_PERMITE_CASA.includes(id)
  );
}

function apenasCuidadoEmCasa() {
  const marcados = [];
  SYMPTOM_CATEGORIES.forEach((cat) =>
    cat.items.forEach((item) => {
      const st = state.sintomas[item.id];
      if (st && st.checked) marcados.push(item);
    })
  );
  if (!marcados.length) return false;

  return marcados.every(dispensaAtendimento);
}

function computeResultado() {
  sincronizaGlicose();
  sincronizaOximetro();

  let hospital = false;
  let upa = false;
  let policia = false;
  let cvv = false;
  let caps = false;
  let ciatox = false;
  const selecionados = [];

  SYMPTOM_CATEGORIES.forEach((cat) =>
    cat.items.forEach((item) => {
      const st = state.sintomas[item.id];
      if (!st || !st.checked) return;

      let code, detalhe = "";
      if (item.sub) {
        const opt = opcaoMarcada(item);
        code = opt.code;
        detalhe = opt.label;
        if (opt.policia) policia = true;
        if (opt.cvv) cvv = true;
        if (opt.caps) caps = true;
        if (opt.ciatox) ciatox = true;
        // Quando houve medição, ela é mais informativa que o rótulo da opção.
        if (item.painel) detalhe = resumoMedicao(item);
      } else {
        code = item.code;
        if (item.ciatox) ciatox = true;
      }

      if (code.includes(2)) hospital = true;
      else if (code.includes(1)) upa = true;

      selecionados.push({ label: item.label, detail: detalhe });
    })
  );

  const base = hospital ? "hospital" : upa ? "upa" : "ubs";

  // As sinergias (sinergias.js) só elevam o resultado da tabela base.
  // Se o arquivo não carregar, a triagem base continua valendo.
  const sin =
    typeof avaliaSinergias === "function"
      ? avaliaSinergias(state, base)
      : { destino: base, samu: false, disparadas: [] };

  // Nada além de medições normais: orienta cuidado em casa, um degrau
  // abaixo da UBS. Só vale quando nem a tabela nem as sinergias subiram.
  let destino = sin.destino;
  // Bebês com menos de 1 ano e qualquer combinação disparada nunca caem em "casa".
  if (
    destino === "ubs" && !sin.samu && !policia && !cvv &&
    !sin.disparadas.length && state.idade !== 0 &&
    historicoPermiteCasa() &&
    apenasCuidadoEmCasa()
  ) {
    destino = "casa";
  }

  return {
    destino,
    samu: sin.samu,
    sinergias: sin.disparadas,
    base,
    policia,
    cvv,
    caps,
    ciatox,
    selecionados,
  };
}

const DESTINO = {
  hospital: {
    nome: "Hospital",
    sub: "Os sintomas indicam necessidade de atendimento hospitalar.",
    texto: `Procure o pronto-socorro de um hospital o quanto antes. Se piorar no caminho, ligue para o SAMU (${TELEFONE_EMERGENCIA}).`,
    busca: "hospital pronto socorro",
    icon: `<path d="M4.5 20.5V8.8L12 4l7.5 4.8v11.7Z"/><path d="M12 10.2v5.4M9.3 12.9h5.4"/>`,
  },
  upa: {
    nome: "UPA",
    sub: "Os sintomas indicam necessidade de atendimento de urgência.",
    texto: "Procure a Unidade de Pronto Atendimento (UPA) mais próxima. Elas funcionam 24 horas.",
    busca: "UPA unidade de pronto atendimento",
    icon: `<circle cx="12" cy="12" r="8.6"/><path d="M12 7.1v5.1l3.2 2"/>`,
  },
  ubs: {
    nome: "UBS",
    sub: "Os sintomas podem ser avaliados na atenção básica.",
    texto: "Procure a Unidade Básica de Saúde (UBS) da sua região — de preferência aquela em que você é cadastrado.",
    busca: "UBS unidade básica de saúde posto de saúde",
    icon: `<path d="M4.4 10.6 12 4.5l7.6 6.1v9.4H4.4Z"/><path d="M12 12.4v4.2M9.9 14.5h4.2"/>`,
  },
  casa: {
    nome: "Cuidado em casa",
    sub: "Nada do que você marcou pede atendimento agora.",
    texto:
      "Por enquanto não há sinal que peça atendimento. Descanse, beba água e observe. Se aparecer qualquer sintoma novo, se a febre subir, se as medições mudarem ou se você não se sentir bem, refaça a triagem.",
    busca: "UBS unidade básica de saúde posto de saúde",
    icon: `<path d="M4.4 10.6 12 4.5l7.6 6.1v9.4H4.4Z"/><path d="M9.6 20v-5.2h4.8V20"/>`,
  },
};

const LABEL_POP = {
  crianca_clinica: "Criança",
  adolescente_clinico: "Adolescente",
  adulto_clinico: "Adulto",
  idoso_clinico: "Idoso",
};
const LABEL_SUB = {
  neonatal: "Recém-nascido (neonatal)",
  lactente: "Lactente",
  gravida: "Gestante",
  puerperio: "Puerpério",
  possivel_gravida: "Possível gravidez",
};
const LABEL_PUERP = { imediato: "Imediato", tardio: "Tardio", remoto: "Remoto" };

function renderResultado() {
  const { destino, samu, sinergias, base, policia, cvv, caps, ciatox, selecionados } = computeResultado();
  const info = DESTINO[destino];

  const comorbs = [];
  COMORBIDITY_CATEGORIES.forEach((cat) =>
    cat.items.forEach((item) => {
      const st = state.comorbidades[item.id];
      if (!st || !st.checked) return;
      let txt = item.label;
      if (item.extra && st.extraValue) {
        txt += item.extra.type === "checkbox" ? ` (${item.extra.label.toLowerCase()})` : ` (${st.extraValue})`;
      }
      comorbs.push(txt);
    })
  );

  const idadeTxt =
    state.idade === "nao_sei" ? "Não informada" : state.idade === 60 ? "60 anos ou mais" : `${state.idade} anos`;

  app.appendChild(
    h(`
    <div class="verdict ${samu ? "samu" : destino}">
      <div class="verdict-kicker">Encaminhamento sugerido</div>
      <svg class="verdict-icon" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${info.icon}</svg>
      <div class="verdict-name">${samu ? "SAMU + Hospital" : info.nome}</div>
      <div class="verdict-sub">${
        samu
          ? "As combinações encontradas indicam risco alto. Ligue para o SAMU e vá ao hospital."
          : info.sub
      }</div>
    </div>
  `)
  );

  if (samu) {
    app.appendChild(
      h(`
      <div class="alert-samu">
        <h2>Ligue para o SAMU agora</h2>
        <p>O cruzamento do histórico de saúde com os sintomas relatados aponta risco de agravamento rápido. Não espere por transporte próprio se houver piora.</p>
        <a class="call-btn solid-samu" href="tel:${TELEFONE_EMERGENCIA}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6.3 3.8h3.2l1.6 4-2 1.2a11.4 11.4 0 0 0 5.9 5.9l1.2-2 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6A16.4 16.4 0 0 1 4.7 5.5a1.6 1.6 0 0 1 1.6-1.7Z"/></svg>
          SAMU — ${TELEFONE_EMERGENCIA}
        </a>
      </div>
    `)
    );
  }

  if (cvv) {
    app.appendChild(
      h(`
      <div class="alert-cvv">
        <h2>Você não está sozinho</h2>
        <p>O Centro de Valorização da Vida atende de graça, 24 horas por dia, com sigilo. Falar com alguém agora ajuda — e o atendimento de saúde indicado acima continua valendo.</p>
        <a class="call-btn solid-cvv" href="tel:188">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6.3 3.8h3.2l1.6 4-2 1.2a11.4 11.4 0 0 0 5.9 5.9l1.2-2 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6A16.4 16.4 0 0 1 4.7 5.5a1.6 1.6 0 0 1 1.6-1.7Z"/></svg>
          CVV — 188
        </a>
        <a class="call-btn outline" href="https://cvv.org.br/chat/" target="_blank" rel="noopener">Conversar por chat no site do CVV</a>
        ${
          caps
            ? `<p style="margin-top:14px">Peça também, na UBS, encaminhamento para o CAPS da sua região — é o serviço que faz o acompanhamento continuado em saúde mental.</p>`
            : ""
        }
      </div>
    `)
    );
  }

  if (ciatox) {
    app.appendChild(
      h(`
      <div class="alert-samu">
        <h2>Intoxicação: ligue para o Disque-Intoxicação</h2>
        <p>Atendimento gratuito, 24 horas, de centros de toxicologia. Leve a embalagem do produto ou do remédio.</p>
        <a class="call-btn outline" href="tel:08007226001">Disque-Intoxicação — 0800 722 6001</a>
      </div>
    `)
    );
  }

  if (policia) {
    app.appendChild(
      h(`
      <div class="alert-police">
        <h2>Apoio para violência sexual</h2>
        <p>Você indicou uma relação sexual não consensual. Além do atendimento de saúde, considere acionar a polícia e buscar um hospital em até 72 horas — nesse prazo existem profilaxias disponíveis.</p>
        <a class="call-btn solid-police" href="tel:190">Polícia Militar — 190</a>
        ${
          // O 180 é a Central de Atendimento à Mulher: não se aplica a homens.
          state.genero === "mulher"
            ? `<a class="call-btn outline" href="tel:180">Central de Atendimento à Mulher — 180</a>`
            : ""
        }
        <a class="call-btn outline" href="tel:100">Disque Direitos Humanos — 100</a>
      </div>
    `)
    );
  }

  app.appendChild(
    h(`
    <div class="card">
      <p class="lede">${info.texto}</p>
      ${
        // Em "cuidado em casa" não há para onde mandar a pessoa agora; o mapa
        // vira só um caminho secundário, caso ela queira avaliar mesmo assim.
        destino === "casa"
          ? `<p class="hint" style="margin-bottom:0">Se preferir uma avaliação mesmo assim, a UBS da sua região é o lugar certo.</p>
             <a class="link-btn ghost-link" target="_blank" rel="noopener"
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.busca)}">
               Ver UBS próximas
             </a>`
          : `<a class="link-btn" target="_blank" rel="noopener"
                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.busca)}">
               <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 10.4c0 5.4-7.5 10.6-7.5 10.6s-7.5-5.2-7.5-10.6a7.5 7.5 0 0 1 15 0Z"/><circle cx="12" cy="10.3" r="2.6"/></svg>
               Buscar unidade mais próxima
             </a>`
      }
    </div>
  `)
  );

  if (sinergias.length) {
    const NIVEL_TXT = { upa: "UPA", hospital: "Hospital", samu_hospital: "SAMU + Hospital" };
    app.appendChild(
      h(`
      <div class="card">
        <h2>Combinações de risco identificadas</h2>
        <p class="hint">O cruzamento das suas respostas elevou o encaminhamento${
          base !== destino || samu ? ` (a tabela isolada apontaria ${DESTINO[base].nome})` : ""
        }. Mostre esta lista à equipe de saúde.</p>
        <div class="syn-list">
          ${sinergias
            .map(
              (s) => `
            <div class="syn-item ${s.nivel}">
              <div class="syn-head">
                <span class="syn-title">${s.titulo}</span>
                <span class="syn-badge ${s.nivel}">${NIVEL_TXT[s.nivel]}</span>
              </div>
              <div class="syn-why">${s.porque}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `)
    );
  }

  app.appendChild(
    h(`
    <div class="card">
      <h2>Resumo para o atendimento</h2>
      <p class="hint" style="margin-bottom:0">Mostre estas informações à equipe de saúde.</p>

      <ul class="sum-list">
        ${
          // A triagem pode terminar antes de perguntar perfil: só mostra o
          // que realmente foi respondido, em vez de inventar um valor.
          state.idadeRespondida
            ? `<li><span class="k">Idade</span><span class="v">${idadeTxt}</span></li>
               <li><span class="k">Faixa etária</span><span class="v">${LABEL_POP[state.populacao] || "—"}</span></li>`
            : ""
        }
        ${
          state.generoRespondido
            ? `<li><span class="k">Sexo biológico</span><span class="v">${state.genero === "mulher" ? "Feminino" : state.genero === "homem" ? "Masculino" : "Não informado"}</span></li>`
            : ""
        }
        ${LABEL_SUB[state.subpopulacao] ? `<li><span class="k">Condição</span><span class="v">${LABEL_SUB[state.subpopulacao]}</span></li>` : ""}
        ${state.subpopulacao === "gravida" ? `<li><span class="k">Trimestre</span><span class="v">${state.gravida_tempo}º</span></li>` : ""}
        ${state.subpopulacao === "puerperio" ? `<li><span class="k">Puerpério</span><span class="v">${LABEL_PUERP[state.puerperio]}</span></li>` : ""}
        ${state.generoRespondido && state.genero === "mulher" ? `<li><span class="k">Lactante</span><span class="v">${state.lactante === "sim" ? "Sim" : "Não"}</span></li>` : ""}
        ${state.altura != null ? `<li><span class="k">Altura</span><span class="v">${state.altura} cm</span></li>` : ""}
      </ul>

      ${
        comorbs.length
          ? `<div class="sum-heading">Condições de saúde</div>
             <div class="pill-list">${comorbs.map((c) => `<span class="pill">${c}</span>`).join("")}</div>`
          : ""
      }

      <div class="sum-heading">Sintomas relatados</div>
      <ul class="sum-list">
        ${selecionados
          .map(
            (s) =>
              `<li class="stacked"><span class="k">${s.label}</span>${
                s.detail ? `<span class="d">${s.detail}</span>` : ""
              }</li>`
          )
          .join("")}
      </ul>
    </div>
  `)
  );

  app.appendChild(
    h(`
    <div class="note-card">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.8v4.6M12 16.2h.01"/></svg>
      <span>Se piorar a qualquer momento, procure atendimento imediatamente ou ligue para o SAMU (${TELEFONE_EMERGENCIA}).</span>
    </div>
    <div class="card">
      <div class="btn-row">
        <button class="btn subtle" type="button" data-action="reiniciar">Recomeçar triagem</button>
      </div>
    </div>
  `)
  );

  app.querySelector('[data-action="reiniciar"]').onclick = resetState;
}

/* --------------------------------- Início -------------------------------- */

/* `app` só existe na página da triagem. O catálogo (catalogo.html) carrega
   este arquivo apenas pelas tabelas de dados, sem rodar a triagem. */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  if (app) resetState();
});
