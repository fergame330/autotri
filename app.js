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
    title: "Cardiovascular / Respiratório",
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
  {
    title: "Geral / Sistêmico",
    items: [
      {
        id: "febre_hipotermia",
        label: "Febre e/ou hipotermia",
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
    comorbidades: {}, // id -> { checked, extraValue }
    sintomas: {}, // id -> { checked, subIndex }
    // Acordeão: só a primeira seção começa aberta em cada tela.
    aberto: { comorb: new Set([0]), sint: new Set([0]) },
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

function go(step) {
  history_.push(state.step);
  state.step = step;
  render();
  window.scrollTo(0, 0);
}

function back() {
  if (!history_.length) return;
  state.step = history_.pop();
  render();
  window.scrollTo(0, 0);
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
  comorbidades: { n: 4, pct: 74 },
  sintomas: { n: 5, pct: 92 },
};
const TOTAL_ETAPAS = 5;

function progressHtml() {
  const meta = STEP_META[state.step];
  if (!meta) return "";
  return `
    <div class="progress">
      <div class="progress-track"><div class="progress-fill" style="width:${meta.pct}%"></div></div>
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
        go("comorbidades");
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
      go("comorbidades");
    };
  });
  wireBack();
}

/* ------------------- Acordeão de itens marcáveis (4 e 5) ----------------- */

function itemHtml(item, kind) {
  const store = kind === "sint" ? state.sintomas : state.comorbidades;
  const st = store[item.id];
  const checked = !!(st && st.checked);
  let extra = "";

  if (checked && kind === "sint" && item.sub) {
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
  atualizaSecao(categories, kind, secEl);
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
    }
    trocaItem(item, kind, categories);
  };

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

/* ------------------------------- 5. Sintomas ----------------------------- */

function renderSintomas() {
  app.appendChild(
    h(`
    ${progressHtml()}
    <div class="card">
      ${backHtml()}
      <span class="eyebrow">Sintomas</span>
      <p class="question">Marque os sintomas que a pessoa apresenta</p>
      <p class="hint">Selecione todos que se aplicam. Alguns abrem uma pergunta extra sobre a gravidade.</p>
      ${accordionHtml(SYMPTOM_CATEGORIES, "sint")}
      <div class="error-text" id="erro-sintomas" hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.8v4.6M12 16.2h.01"/></svg>
        Selecione pelo menos um sintoma para continuar.
      </div>
      <div class="btn-row">
        <button class="btn primary" type="button" data-action="finalizar">Ver encaminhamento</button>
      </div>
    </div>
  `)
  );
  ligaAcordeao(SYMPTOM_CATEGORIES, "sint");

  app.querySelector('[data-action="finalizar"]').onclick = () => {
    const algum = Object.values(state.sintomas).some((s) => s.checked);
    if (!algum) {
      const erro = app.querySelector("#erro-sintomas");
      erro.hidden = false;
      erro.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    go("resultado");
  };
  wireBack();
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
      } else {
        code = item.code;
      }

      if (code.includes(2)) hospital = true;
      else if (code.includes(1)) upa = true;

      selecionados.push({ label: item.label, detail: detalhe });
    })
  );

  return { destino: hospital ? "hospital" : upa ? "upa" : "ubs", policia, selecionados };
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
  const { destino, policia, selecionados } = computeResultado();
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
    <div class="verdict ${destino}">
      <div class="verdict-kicker">Encaminhamento sugerido</div>
      <svg class="verdict-icon" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${info.icon}</svg>
      <div class="verdict-name">${info.nome}</div>
      <div class="verdict-sub">${info.sub}</div>
    </div>
  `)
  );

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
