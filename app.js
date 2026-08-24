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
            { label: "Febre baixa", code: [0] },
            { label: "Febre moderada", code: [1] },
            { label: "Febre muito alta", code: [1, 2] },
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
            { label: "Está baixa", code: [0] },
            { label: "Não sei", code: [0] },
          ],
        },
      },
      { id: "cansaco_muscular", label: "Cansaço muscular", code: [0] },
      { id: "perda_peso", label: "Perda de peso não intencional", code: [0] },
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
      { id: "alergia", label: "Alergia", code: [0] },
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
      { id: "alteracao_visual", label: "Alteração visual", code: [1] },
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
      { id: "vomito_sangue", label: "Vômito com sangue / fezes muito escuras / fezes com sangue", code: [1, 2] },
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
            { label: "Não foi consensual", code: [1], policia: true },
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
            { label: "Não sei", code: [1] },
          ],
        },
      },
      { id: "mancha", label: "Mancha", code: [0] },
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
            { label: "Inseto e/ou aracnídeo não venenoso e/ou cachorro e/ou gato e/ou rato", code: [0] },
            { label: "Cobra e/ou escorpião", code: [1] },
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

let state = null;
let history_ = [];

function freshState() {
  return {
    step: "intro",
    quem: null, // "para_mim" | "outra_pessoa"
    idade: null, // number | "nao_sei"
    populacao: null,
    subpopulacao: "x",
    semanas_bebe: null,
    genero: null, // "homem" | "mulher"
    gravida_tempo: "x", // 1 | 2 | 3 | "x"
    puerperio: "x", // "imediato" | "tardio" | "remoto" | "x"
    lactante: "nao",
    altura: null, // number (cm), só perguntada para crianças de 1 a 12 anos
    comorbidades: {}, // id -> { checked, extraValue }
    sintomas: {}, // id -> { checked, subIndex }
    // Acordeão do histórico de saúde: só a primeira seção começa aberta.
    aberto: { comorb: new Set([0]) },
    // Sintomas são percorridos em partes, uma por sistema do corpo.
    sintomaParte: 0,
    // Partes já abertas, para avisar quem pede o encaminhamento antes do fim.
    partesVistas: new Set([0]),
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

/* Depois do bloco de sexo/gravidez/lactação: crianças de 1 a 12 anos
   respondem a altura (necessária para classificar a pressão arterial por
   percentil); as demais idades seguem direto para o histórico de saúde. */
function proximoAposGenero() {
  const idade = state.idade;
  if (typeof idade === "number" && idade >= 1 && idade <= 12) go("altura");
  else go("comorbidades");
}

const STEP_META = {
  quem: { n: 1, pct: 12 },
  idade: { n: 2, pct: 26 },
  semanas_bebe: { n: 2, pct: 33 },
  sexo: { n: 3, pct: 43 },
  gravidez: { n: 3, pct: 48 },
  trimestre: { n: 3, pct: 53 },
  puerperio_tempo: { n: 3, pct: 53 },
  suspeita_gravidez: { n: 3, pct: 53 },
  lactante: { n: 3, pct: 58 },
  altura: { n: 3, pct: 61 },
  comorbidades: { n: 4, pct: 74 },
  sintomas: { n: 5, pct: 92 },
};
const TOTAL_ETAPAS = 5;

function progressHtml() {
  const meta = STEP_META[state.step];
  if (!meta) return "";

  // Na etapa de sintomas a barra avança conforme as partes percorridas.
  let pct = meta.pct;
  if (state.step === "sintomas") {
    const total = SYMPTOM_CATEGORIES.length;
    pct = 76 + ((state.sintomaParte + 1) / total) * 22;
  }

  return `
    <div class="progress">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-step">Etapa ${meta.n} de ${TOTAL_ETAPAS}</div>
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
    quem: renderQuem,
    idade: renderIdade,
    semanas_bebe: renderSemanasBebe,
    sexo: renderSexo,
    gravidez: renderGravidez,
    trimestre: renderTrimestre,
    puerperio_tempo: renderPuerperioTempo,
    suspeita_gravidez: renderSuspeitaGravidez,
    lactante: renderLactante,
    altura: renderAltura,
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
  app.querySelector('[data-v="nao"]').onclick = () => go("quem");
}

function renderSamu() {
  app.appendChild(
    h(`
    <div class="verdict samu">
      <div class="verdict-kicker">Emergência</div>
      <svg class="verdict-icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Z"/><path d="M12 7.6v5"/><path d="M12 16.1h.01"/>
      </svg>
      <div class="verdict-name">Ligue 192</div>
      <div class="verdict-sub">Não espere. Ligue agora e siga as orientações do atendente.</div>
    </div>

    <div class="card">
      <a class="call-btn solid-samu" href="tel:192">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6.3 3.8h3.2l1.6 4-2 1.2a11.4 11.4 0 0 0 5.9 5.9l1.2-2 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6A16.4 16.4 0 0 1 4.7 5.5a1.6 1.6 0 0 1 1.6-1.7Z"/></svg>
        SAMU — 192
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
  app.querySelector('[data-action="continuar"]').onclick = () => go("quem");
  app.querySelector('[data-action="reiniciar"]').onclick = resetState;
}

/* ------------------------------ 2. Quem ---------------------------------- */

function renderQuem() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <p class="question">É uma queixa para você ou para outra pessoa?</p>
      <div class="options">
        <button class="btn" type="button" data-v="para_mim">Para mim</button>
        <button class="btn" type="button" data-v="outra_pessoa">Para outra pessoa</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((b) => {
    b.onclick = () => {
      state.quem = b.dataset.v;
      go("idade");
    };
  });
  wireBack();
}

/* ------------------------------ 3.1 Idade -------------------------------- */

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
    go(idade !== "nao_sei" && idade <= 2 ? "semanas_bebe" : "sexo");
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
    go("sexo");
  };

  app.querySelector('[data-action="confirmar"]').onclick = () => avancar(Number(input.value));
  app.querySelector('[data-action="nao-sei"]').onclick = () => avancar("nao_sei");
  wireBack();
}

/* --------------------------- 3.2 Sexo biológico -------------------------- */

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
      if (b.dataset.v === "mulher") {
        state.genero = "mulher";
        go("gravidez");
      } else {
        state.genero = "homem";
        proximoAposGenero();
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
      proximoAposGenero();
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
const ALT_VIEW_W = 280; // largura fixa da janela visível da régua
const ALT_PAD = ALT_VIEW_W / 2;

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
    const x = ALT_PAD + (v - ALT_MIN) * ALT_PX_CM;
    out += `<div class="altura-marca ${maior ? "maior" : media ? "media" : ""}" style="left:${x}px">${
      maior ? `<span>${v}</span>` : ""
    }</div>`;
  }
  return out;
}

/* Ilustração simples: silhueta com calça (menino) ou vestido (menina),
   nas cores da própria identidade visual do app. */
function personagemSvg(genero) {
  const ehMenina = genero === "mulher";
  const roupaBaixo = ehMenina
    ? `<path d="M33 118 L26 197 Q50 206 74 197 L67 118 Z" fill="var(--brand)" />`
    : `<path d="M33 118 L29 197 L47 197 L50 152 L53 197 L71 197 L67 118 Z" fill="var(--brand-strong)" />`;
  const cabelo = ehMenina
    ? `<path d="M18 42 Q19 10 50 8 Q81 10 82 42 Q82 60 73 63 Q79 42 50 36 Q21 42 27 63 Q18 60 18 42 Z" fill="#8a5a3d" />`
    : `<path d="M21 32 Q23 11 50 11 Q77 11 79 32 Q79 24 50 24 Q21 24 21 32 Z" fill="#8a5a3d" />`;

  return `
    <svg viewBox="0 0 100 210" preserveAspectRatio="xMidYMax meet" role="img"
         aria-label="${ehMenina ? "Menina" : "Menino"}">
      <rect x="29" y="192" width="18" height="14" rx="5" fill="#3d4652" />
      <rect x="53" y="192" width="18" height="14" rx="5" fill="#3d4652" />
      ${roupaBaixo}
      <rect x="29" y="70" width="42" height="54" rx="15" fill="var(--brand)" />
      <rect x="14" y="76" width="15" height="46" rx="7.5" fill="#f2b98d" />
      <rect x="71" y="76" width="15" height="46" rx="7.5" fill="#f2b98d" />
      <circle cx="50" cy="43" r="27" fill="#f2b98d" />
      ${cabelo}
      <circle cx="41" cy="44" r="2.8" fill="#3d4652" />
      <circle cx="59" cy="44" r="2.8" fill="#3d4652" />
      <path d="M40 54 Q50 60 60 54" stroke="#3d4652" stroke-width="2.6" fill="none" stroke-linecap="round" />
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

  app.querySelector('[data-action="continuar"]').onclick = () => go("comorbidades");
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
      store[item.id].modo = "medir";
      store[item.id].subEtapa = "medida";
      store[item.id].alterada = null;
    }
    trocaItem(item, kind, categories);

    // Marcar febre ou pressão já abre o painel de medição.
    if (cb.checked && item.painel) abrePainel(item);
  };

  const abrir = node.querySelector("[data-abrir]");
  if (abrir) abrir.onclick = () => abrePainel(item);

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
  app.querySelector('[data-action="continuar"]').onclick = () => go("sintomas");
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
};

function estadoItem(id) {
  if (!state.sintomas[id]) {
    state.sintomas[id] = {
      checked: true,
      subIndex: null,
      medida: null,
      pressao: null,
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
  trocaItem(item, "sint", SYMPTOM_CATEGORIES);
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
    btn.onclick = () => avancaParaConfundidores(item);
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

  if (!st.pressao) st.pressao = { min: PA_MIN, max: PA_MAX };
  const pa = st.pressao;

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
  inMin.addEventListener("blur", () => redesenha());
  inMax.addEventListener("blur", () => redesenha());

  redesenha();

  app.querySelector('[data-modo="opcoes"]').onclick = () => trocaModoPainel(item, "opcoes");
  configuraRodapePressao(item);
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
  if (item.painel === "pressao" && st.pressao) {
    let txt = `${st.pressao.max} / ${st.pressao.min} mmHg`;
    const estagio = typeof classificaPressao === "function" ? classificaPressao(state) : null;
    if (estagio && ROTULO_ESTAGIO_PA[estagio]) txt += ` · ${ROTULO_ESTAGIO_PA[estagio]}`;
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
      aoConfirmar: () => go("resultado"),
    });
    return;
  }

  go("resultado");
}

/* ------------------------------ Resultado -------------------------------- */

function computeResultado() {
  let hospital = false;
  let upa = false;
  let policia = false;
  const selecionados = [];

  SYMPTOM_CATEGORIES.forEach((cat) =>
    cat.items.forEach((item) => {
      const st = state.sintomas[item.id];
      if (!st || !st.checked) return;

      let code, detalhe = "";
      if (item.sub) {
        // Sem resposta na sub-pergunta, assume a última opção ("não sei"),
        // que é sempre a mais conservadora da lista.
        const opt = item.sub.options[st.subIndex ?? item.sub.options.length - 1];
        code = opt.code;
        detalhe = opt.label;
        if (opt.policia) policia = true;
        // Quando houve medição, ela é mais informativa que o rótulo da opção.
        if (item.painel) detalhe = resumoMedicao(item);
      } else {
        code = item.code;
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

  return {
    destino: sin.destino,
    samu: sin.samu,
    sinergias: sin.disparadas,
    base,
    policia,
    selecionados,
  };
}

const DESTINO = {
  hospital: {
    nome: "Hospital",
    sub: "Os sintomas indicam necessidade de atendimento hospitalar.",
    texto: "Procure o pronto-socorro de um hospital o quanto antes. Se piorar no caminho, ligue para o SAMU (192).",
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
  const { destino, samu, sinergias, base, policia, selecionados } = computeResultado();
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
        <a class="call-btn solid-samu" href="tel:192">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6.3 3.8h3.2l1.6 4-2 1.2a11.4 11.4 0 0 0 5.9 5.9l1.2-2 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6A16.4 16.4 0 0 1 4.7 5.5a1.6 1.6 0 0 1 1.6-1.7Z"/></svg>
          SAMU — 192
        </a>
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
        <a class="call-btn outline" href="tel:180">Central de Atendimento à Mulher — 180</a>
        <a class="call-btn outline" href="tel:100">Disque Direitos Humanos — 100</a>
      </div>
    `)
    );
  }

  app.appendChild(
    h(`
    <div class="card">
      <p class="lede">${info.texto}</p>
      <a class="link-btn" target="_blank" rel="noopener"
         href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.busca)}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 10.4c0 5.4-7.5 10.6-7.5 10.6s-7.5-5.2-7.5-10.6a7.5 7.5 0 0 1 15 0Z"/><circle cx="12" cy="10.3" r="2.6"/></svg>
        Buscar unidade mais próxima
      </a>
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
        <li><span class="k">Queixa</span><span class="v">${state.quem === "para_mim" ? "Para mim" : "Para outra pessoa"}</span></li>
        <li><span class="k">Idade</span><span class="v">${idadeTxt}</span></li>
        <li><span class="k">Faixa etária</span><span class="v">${LABEL_POP[state.populacao] || "—"}</span></li>
        <li><span class="k">Sexo biológico</span><span class="v">${state.genero === "mulher" ? "Feminino" : "Masculino"}</span></li>
        ${LABEL_SUB[state.subpopulacao] ? `<li><span class="k">Condição</span><span class="v">${LABEL_SUB[state.subpopulacao]}</span></li>` : ""}
        ${state.subpopulacao === "gravida" ? `<li><span class="k">Trimestre</span><span class="v">${state.gravida_tempo}º</span></li>` : ""}
        ${state.subpopulacao === "puerperio" ? `<li><span class="k">Puerpério</span><span class="v">${LABEL_PUERP[state.puerperio]}</span></li>` : ""}
        ${state.genero === "mulher" ? `<li><span class="k">Lactante</span><span class="v">${state.lactante === "sim" ? "Sim" : "Não"}</span></li>` : ""}
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
      <span>Se piorar a qualquer momento, procure atendimento imediatamente ou ligue para o SAMU (192).</span>
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

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  resetState();
});
