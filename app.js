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

/* ------------------------------- Estado --------------------------------- */
/* Vive só em memória. Nada é escrito em localStorage/sessionStorage/cookies. */

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
    comorbidades: {}, // id -> { checked: bool, extraValue }
    sintomas: {}, // id -> { checked: bool, subIndex: number|null }
    policia: false,
  };
}

function resetState() {
  state = freshState();
  history_ = [];
  render();
}

/* ------------------------------- Helpers --------------------------------- */

const app = document.getElementById("app");

function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

function go(step) {
  history_.push(state.step);
  state.step = step;
  render();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function back() {
  if (history_.length === 0) return;
  state.step = history_.pop();
  render();
  window.scrollTo(0, 0);
}

function privacyBanner() {
  return `<div class="privacy-banner">🔒 <span>Nenhum dado é salvo. Nada fica gravado neste ou em outro dispositivo — ao fechar ou recarregar a página, todas as respostas somem.</span></div>`;
}

function progressBar(pct) {
  return h(`<div class="progress-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>`);
}

function backButton() {
  return history_.length
    ? `<button class="btn ghost small" data-action="back">&larr; Voltar</button>`
    : "";
}

/* ------------------------------- Render dispatch -------------------------------- */

function render() {
  app.innerHTML = "";
  app.appendChild(h(privacyBanner()));

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

  const fn = renderers[state.step] || renderIntro;
  fn();
}

/* ------------------------------- Passo: Intro / Emergência -------------------------------- */

function renderIntro() {
  app.appendChild(
    h(`
    <div class="card">
      <h1>Auto Triagem</h1>
      <p class="lede">Responda algumas perguntas para saber para onde procurar ajuda: SAMU, Polícia, UBS, UPA ou Hospital. Isso não substitui uma avaliação médica presencial.</p>
      <p class="question">É uma emergência — ou seja, você ou alguém sofre risco imediato (ou nos próximos minutos) de morte?</p>
      <div class="options">
        <button class="btn danger" data-action="emergencia-sim">Sim</button>
        <button class="btn" data-action="emergencia-nao">Não</button>
      </div>
    </div>
  `)
  );
  app.querySelector('[data-action="emergencia-sim"]').onclick = () => go("samu");
  app.querySelector('[data-action="emergencia-nao"]').onclick = () => go("quem");
}

function renderSamu() {
  app.appendChild(
    h(`
    <div class="card">
      <div class="step-label">Emergência</div>
      <h1>Ligue agora para o SAMU</h1>
      <p class="lede">Em uma emergência com risco de morte, ligue imediatamente. Mantenha a calma e siga as orientações do atendente.</p>
      <a class="call-btn samu" href="tel:192">📞 Ligar para o SAMU — 192</a>
      <a class="call-btn outline samu" style="margin-top:10px;color:var(--samu)" href="tel:193">📞 Bombeiros (resgate) — 193</a>
    </div>
    <div class="card">
      <p style="margin:0 0 12px">Se a situação mudar e não for mais uma emergência com risco de morte, você pode continuar a triagem normalmente.</p>
      <div class="btn-row">
        <button class="btn" data-action="continuar">Continuar triagem</button>
        <button class="btn ghost" data-action="reiniciar">Recomeçar</button>
      </div>
    </div>
  `)
  );
  app.querySelector('[data-action="continuar"]').onclick = () => go("quem");
  app.querySelector('[data-action="reiniciar"]').onclick = resetState;
}

/* ------------------------------- Passo: Quem -------------------------------- */

function renderQuem() {
  app.appendChild(progressBar(10));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">É uma queixa para você ou para outra pessoa?</p>
      <div class="options">
        <button class="btn" data-v="para_mim">Para mim</button>
        <button class="btn" data-v="outra_pessoa">Para outra pessoa</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((btn) => {
    btn.onclick = () => {
      state.quem = btn.dataset.v;
      go("idade");
    };
  });
  wireBack();
}

/* ------------------------------- Passo: Idade -------------------------------- */

function classificaIdade(idade) {
  if (idade === "nao_sei") return "adulto_clinico";
  if (idade < 10) return "crianca_clinica";
  if (idade < 20) return "adolescente_clinico";
  if (idade < 60) return "adulto_clinico";
  return "idoso_clinico";
}

function renderIdade() {
  app.appendChild(progressBar(18));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">Qual a idade de quem apresenta os sintomas?</p>
      <div class="field">
        <input type="number" min="0" max="120" inputmode="numeric" id="idade-input" placeholder="Idade em anos" />
      </div>
      <div class="error-text" id="idade-error" style="display:none">Informe uma idade válida ou selecione "não sei".</div>
      <div class="btn-row">
        <button class="btn primary" data-action="confirmar">Confirmar</button>
        <button class="btn ghost" data-action="nao-sei">Não sei</button>
      </div>
    </div>
  `)
  );

  const goNextFromIdade = (idadeVal) => {
    state.idade = idadeVal;
    state.populacao = classificaIdade(idadeVal);
    if (idadeVal !== "nao_sei" && idadeVal <= 2) {
      go("semanas_bebe");
    } else {
      go("sexo");
    }
  };

  app.querySelector('[data-action="confirmar"]').onclick = () => {
    const raw = app.querySelector("#idade-input").value;
    const n = Number(raw);
    if (raw === "" || Number.isNaN(n) || n < 0 || n > 130) {
      app.querySelector("#idade-error").style.display = "block";
      return;
    }
    goNextFromIdade(n);
  };
  app.querySelector('[data-action="nao-sei"]').onclick = () => goNextFromIdade("nao_sei");
  wireBack();
}

/* ------------------------------- Passo: Semanas do bebê -------------------------------- */

function renderSemanasBebe() {
  app.appendChild(progressBar(22));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">Quantas semanas tem o bebê?</p>
      <div class="field">
        <input type="number" min="0" max="200" inputmode="numeric" id="semanas-input" placeholder="Semanas de vida" />
      </div>
      <div class="error-text" id="semanas-error" style="display:none">Informe um valor válido ou selecione "não sei".</div>
      <div class="btn-row">
        <button class="btn primary" data-action="confirmar">Confirmar</button>
        <button class="btn ghost" data-action="nao-sei">Não sei</button>
      </div>
    </div>
  `)
  );

  const setAndGo = (semanas) => {
    state.semanas_bebe = semanas;
    if (semanas === "nao_sei") {
      state.subpopulacao = "lactente";
    } else if (semanas < 4) {
      state.subpopulacao = "neonatal";
    } else {
      state.subpopulacao = "lactente";
    }
    go("sexo");
  };

  app.querySelector('[data-action="confirmar"]').onclick = () => {
    const raw = app.querySelector("#semanas-input").value;
    const n = Number(raw);
    if (raw === "" || Number.isNaN(n) || n < 0) {
      app.querySelector("#semanas-error").style.display = "block";
      return;
    }
    setAndGo(n);
  };
  app.querySelector('[data-action="nao-sei"]').onclick = () => setAndGo("nao_sei");
  wireBack();
}

/* ------------------------------- Passo: Sexo biológico -------------------------------- */

function renderSexo() {
  app.appendChild(progressBar(30));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">Qual o sexo biológico de quem apresenta os sintomas?</p>
      <div class="options">
        <button class="btn" data-v="homem">Homem biológico</button>
        <button class="btn" data-v="mulher">Mulher biológica</button>
        <button class="btn ghost" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((btn) => {
    btn.onclick = () => {
      const v = btn.dataset.v;
      if (v === "nao_sei") {
        state.genero = "homem";
        state.subpopulacao = state.subpopulacao === "x" ? "x" : state.subpopulacao;
        go("comorbidades");
      } else if (v === "homem") {
        state.genero = "homem";
        go("comorbidades");
      } else {
        state.genero = "mulher";
        go("gravidez");
      }
    };
  });
  wireBack();
}

/* ------------------------------- Passo: Gravidez / puerpério -------------------------------- */

function renderGravidez() {
  app.appendChild(progressBar(38));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">Essa mulher está grávida ou fez o parto recentemente e ainda não menstruou?</p>
      <div class="options">
        <button class="btn" data-v="gravida">Está grávida</button>
        <button class="btn" data-v="puerperio">Fez o parto recentemente e ainda não menstruou</button>
        <button class="btn" data-v="suspeita">Tem suspeita de gravidez</button>
        <button class="btn" data-v="nao">Não está grávida nem fez parto recente</button>
        <button class="btn ghost" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((btn) => {
    btn.onclick = () => {
      const v = btn.dataset.v;
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

function renderTrimestre() {
  app.appendChild(progressBar(42));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">Essa gestante está grávida há quantos trimestres?</p>
      <div class="chip-row">
        <button class="btn" data-v="1">1º</button>
        <button class="btn" data-v="2">2º</button>
        <button class="btn" data-v="3">3º</button>
      </div>
      <div style="margin-top:10px">
        <button class="btn ghost" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((btn) => {
    btn.onclick = () => {
      const v = btn.dataset.v;
      state.gravida_tempo = v === "nao_sei" ? 2 : Number(v);
      go("lactante");
    };
  });
  wireBack();
}

function classificaPuerperio(dias) {
  if (dias === "nao_sei") return "tardio";
  if (dias < 10) return "imediato";
  if (dias < 42) return "tardio";
  return "remoto";
}

function renderPuerperioTempo() {
  app.appendChild(progressBar(42));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">Há quanto tempo foi o parto? (em dias)</p>
      <div class="field">
        <input type="number" min="0" max="365" inputmode="numeric" id="puerperio-input" placeholder="Dias desde o parto" />
      </div>
      <div class="error-text" id="puerperio-error" style="display:none">Informe um valor válido ou selecione "não sei".</div>
      <div class="btn-row">
        <button class="btn primary" data-action="confirmar">Confirmar</button>
        <button class="btn ghost" data-action="nao-sei">Não sei</button>
      </div>
    </div>
  `)
  );
  const setAndGo = (dias) => {
    state.puerperio = classificaPuerperio(dias);
    go("lactante");
  };
  app.querySelector('[data-action="confirmar"]').onclick = () => {
    const raw = app.querySelector("#puerperio-input").value;
    const n = Number(raw);
    if (raw === "" || Number.isNaN(n) || n < 0) {
      app.querySelector("#puerperio-error").style.display = "block";
      return;
    }
    setAndGo(n);
  };
  app.querySelector('[data-action="nao-sei"]').onclick = () => setAndGo("nao_sei");
  wireBack();
}

function renderSuspeitaGravidez() {
  app.appendChild(progressBar(42));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">A menstruação está atrasada há mais de 7 dias?</p>
      <div class="options">
        <button class="btn" data-v="sim">Sim</button>
        <button class="btn" data-v="nao">Não</button>
        <button class="btn ghost" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((btn) => {
    btn.onclick = () => {
      const v = btn.dataset.v;
      if (v === "nao") {
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

function renderLactante() {
  app.appendChild(progressBar(46));
  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <p class="question">Essa mulher é lactante / amamenta?</p>
      <div class="options">
        <button class="btn" data-v="sim">Sim</button>
        <button class="btn" data-v="nao">Não</button>
        <button class="btn ghost" data-v="nao_sei">Não sei</button>
      </div>
    </div>
  `)
  );
  app.querySelectorAll("[data-v]").forEach((btn) => {
    btn.onclick = () => {
      const v = btn.dataset.v;
      state.lactante = v === "sim" ? "sim" : "nao";
      go("comorbidades");
    };
  });
  wireBack();
}

/* ------------------------------- Passo: Comorbidades -------------------------------- */

function renderComorbidades() {
  app.appendChild(progressBar(58));

  let itemsHtml = "";
  COMORBIDITY_CATEGORIES.forEach((cat) => {
    itemsHtml += `<div class="category-title">${cat.title}</div><div class="checklist">`;
    cat.items.forEach((item) => {
      const st = state.comorbidades[item.id];
      const checked = st && st.checked;
      itemsHtml += `
        <div class="check-item ${checked ? "checked" : ""}" data-item="${item.id}">
          <label class="check-item-header">
            <input type="checkbox" data-check="${item.id}" ${checked ? "checked" : ""} />
            <span>${item.label}</span>
          </label>
          ${
            item.extra && checked
              ? `<div class="extra-field">
                  ${
                    item.extra.type === "checkbox"
                      ? `<label class="sub-opt"><input type="checkbox" data-extra="${item.id}" ${
                          st && st.extraValue ? "checked" : ""
                        } /> ${item.extra.label}</label>`
                      : `<label class="field-label">${item.extra.label}</label>
                         <input type="date" data-extra="${item.id}" value="${st && st.extraValue ? st.extraValue : ""}" />`
                  }
                </div>`
              : ""
          }
        </div>`;
    });
    itemsHtml += `</div>`;
  });

  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <div class="step-label">Histórico de saúde</div>
      <p class="question">Marque abaixo as condições que você sabe que a pessoa tem</p>
      <p class="lede" style="margin-top:-8px">Isso é opcional, mas ajuda a equipe de saúde a te atender melhor. Pode pular se não souber.</p>
      ${itemsHtml}
      <div class="btn-row">
        <button class="btn primary" data-action="continuar">Continuar</button>
      </div>
    </div>
  `)
  );

  app.querySelectorAll("[data-check]").forEach((cb) => {
    cb.onchange = () => {
      const id = cb.dataset.check;
      if (!state.comorbidades[id]) state.comorbidades[id] = { checked: false, extraValue: null };
      state.comorbidades[id].checked = cb.checked;
      render();
    };
  });
  app.querySelectorAll("[data-extra]").forEach((el) => {
    el.onchange = () => {
      const id = el.dataset.extra;
      const val = el.type === "checkbox" ? el.checked : el.value;
      if (!state.comorbidades[id]) state.comorbidades[id] = { checked: true, extraValue: null };
      state.comorbidades[id].extraValue = val;
    };
  });

  app.querySelector('[data-action="continuar"]').onclick = () => go("sintomas");
  wireBack();
}

/* ------------------------------- Passo: Sintomas -------------------------------- */

function renderSintomas() {
  app.appendChild(progressBar(80));

  let itemsHtml = "";
  SYMPTOM_CATEGORIES.forEach((cat) => {
    itemsHtml += `<div class="category-title">${cat.title}</div><div class="checklist">`;
    cat.items.forEach((item) => {
      const st = state.sintomas[item.id];
      const checked = st && st.checked;
      itemsHtml += `
        <div class="check-item ${checked ? "checked" : ""}" data-item="${item.id}">
          <label class="check-item-header">
            <input type="checkbox" data-check="${item.id}" ${checked ? "checked" : ""} />
            <span>${item.label}</span>
          </label>
          ${
            item.sub && checked
              ? `<div class="sub-question">
                  <div class="sub-q-text">Selecione a opção que melhor descreve:</div>
                  <div class="sub-options">
                    ${item.sub.options
                      .map(
                        (opt, i) => `
                      <label class="sub-opt">
                        <input type="radio" name="sub-${item.id}" data-sub="${item.id}" value="${i}" ${
                          st && st.subIndex === i ? "checked" : ""
                        } />
                        ${opt.label}
                      </label>`
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
        </div>`;
    });
    itemsHtml += `</div>`;
  });

  app.appendChild(
    h(`
    <div class="card">
      ${backButton()}
      <div class="step-label">Sintomas</div>
      <p class="question">Marque abaixo os sintomas que a pessoa apresenta</p>
      <p class="lede" style="margin-top:-8px">Selecione todos que se aplicam. Alguns sintomas têm uma pergunta extra para entender melhor a gravidade.</p>
      ${itemsHtml}
      <div class="error-text" id="sintomas-error" style="display:none">Selecione pelo menos um sintoma para continuar.</div>
      <div class="btn-row">
        <button class="btn primary" data-action="finalizar">Ver encaminhamento</button>
      </div>
    </div>
  `)
  );

  app.querySelectorAll("[data-check]").forEach((cb) => {
    cb.onchange = () => {
      const id = cb.dataset.check;
      if (!state.sintomas[id]) state.sintomas[id] = { checked: false, subIndex: null };
      state.sintomas[id].checked = cb.checked;
      if (!cb.checked) state.sintomas[id].subIndex = null;
      render();
    };
  });
  app.querySelectorAll("[data-sub]").forEach((radio) => {
    radio.onchange = () => {
      const id = radio.dataset.sub;
      state.sintomas[id].subIndex = Number(radio.value);
    };
  });

  app.querySelector('[data-action="finalizar"]').onclick = () => {
    const anyChecked = Object.values(state.sintomas).some((s) => s.checked);
    if (!anyChecked) {
      app.querySelector("#sintomas-error").style.display = "block";
      return;
    }
    go("resultado");
  };
  wireBack();
}

/* ------------------------------- Cálculo do resultado -------------------------------- */

function computeResultado() {
  let hasHospital = false;
  let hasUpa = false;
  let hasUbs = false;
  let policia = false;
  const selecionados = [];

  SYMPTOM_CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      const st = state.sintomas[item.id];
      if (!st || !st.checked) return;

      let code, extraLabel = "", policiaFlag = false;
      if (item.sub) {
        const opt = item.sub.options[st.subIndex ?? item.sub.options.length - 1];
        code = opt.code;
        extraLabel = opt.label;
        policiaFlag = !!opt.policia;
      } else {
        code = item.code;
      }

      if (policiaFlag) policia = true;
      if (code.includes(2)) hasHospital = true;
      else if (code.includes(1)) hasUpa = true;
      else hasUbs = true;

      selecionados.push({ label: item.label, detail: extraLabel });
    });
  });

  let destino;
  if (hasHospital) destino = "hospital";
  else if (hasUpa) destino = "upa";
  else destino = "ubs";

  return { destino, policia, selecionados };
}

const DESTINO_INFO = {
  hospital: {
    titulo: "Hospital",
    sub: "Seus sintomas indicam necessidade de atendimento hospitalar imediato.",
    classe: "hospital",
    texto: "Procure o pronto-socorro de um hospital o quanto antes. Se a situação piorar a caminho, ligue para o SAMU (192).",
  },
  upa: {
    titulo: "UPA",
    sub: "Seus sintomas indicam necessidade de atendimento de urgência.",
    classe: "upa",
    texto: "Procure a Unidade de Pronto Atendimento (UPA) mais próxima.",
  },
  ubs: {
    titulo: "UBS",
    sub: "Seus sintomas podem ser avaliados na atenção básica.",
    classe: "ubs",
    texto: "Procure a Unidade Básica de Saúde (UBS) da sua região, de preferência a que você é vinculado(a).",
  },
};

function populacaoLabel(p) {
  return (
    {
      crianca_clinica: "Criança",
      adolescente_clinico: "Adolescente",
      adulto_clinico: "Adulto",
      idoso_clinico: "Idoso",
    }[p] || "—"
  );
}
function subpopulacaoLabel(s) {
  return (
    {
      neonatal: "Neonatal",
      lactente: "Lactente",
      gravida: "Gestante",
      puerperio: "Puerpério",
      possivel_gravida: "Possível gravidez",
      x: "—",
    }[s] || "—"
  );
}

function renderResultado() {
  const { destino, policia, selecionados } = computeResultado();
  const info = DESTINO_INFO[destino];

  const comorbidadesSelecionadas = [];
  COMORBIDITY_CATEGORIES.forEach((cat) =>
    cat.items.forEach((item) => {
      const st = state.comorbidades[item.id];
      if (st && st.checked) comorbidadesSelecionadas.push(item.label);
    })
  );

  app.appendChild(
    h(`
    <div class="result-hero ${info.classe}">
      <div class="sub-label">Encaminhamento sugerido</div>
      <div class="big-label">${info.titulo}</div>
      <div class="sub-label">${info.sub}</div>
    </div>
  `)
  );

  if (policia) {
    app.appendChild(
      h(`
      <div class="police-alert">
        <h2>Apoio à violência sexual</h2>
        <p>Você indicou uma relação sexual não consensual. Além do atendimento de saúde, considere buscar apoio policial e, se possível, atendimento hospitalar em até 72 horas para profilaxias disponíveis.</p>
        <a class="call-btn police" href="tel:190">📞 Polícia Militar — 190</a>
        <a class="call-btn outline" style="margin-top:10px;color:var(--police)" href="tel:180">📞 Central de Atendimento à Mulher — 180</a>
        <a class="call-btn outline" style="margin-top:10px;color:var(--police)" href="tel:100">📞 Disque Direitos Humanos — 100</a>
      </div>
    `)
    );
  }

  const mapsQuery = encodeURIComponent(
    destino === "hospital" ? "hospital próximo" : destino === "upa" ? "UPA próxima" : "UBS próxima"
  );

  app.appendChild(
    h(`
    <div class="card">
      <p>${info.texto}</p>
      <a class="btn primary" style="text-decoration:none;display:block;text-align:center" target="_blank" rel="noopener"
         href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}">
        🗺️ Buscar unidade mais próxima
      </a>
    </div>
  `)
  );

  app.appendChild(
    h(`
    <div class="card">
      <h2>Resumo para levar ao atendimento</h2>
      <ul class="summary-list">
        <li><span class="k">Queixa</span><span class="v">${state.quem === "para_mim" ? "Para mim" : "Para outra pessoa"}</span></li>
        <li><span class="k">Idade</span><span class="v">${state.idade === "nao_sei" ? "Não informada" : state.idade + " anos"}</span></li>
        <li><span class="k">Faixa</span><span class="v">${populacaoLabel(state.populacao)}</span></li>
        ${state.subpopulacao !== "x" ? `<li><span class="k">Perfil adicional</span><span class="v">${subpopulacaoLabel(state.subpopulacao)}</span></li>` : ""}
        ${state.subpopulacao === "gravida" ? `<li><span class="k">Trimestre</span><span class="v">${state.gravida_tempo}º</span></li>` : ""}
        ${state.subpopulacao === "puerperio" ? `<li><span class="k">Puerpério</span><span class="v">${state.puerperio}</span></li>` : ""}
        ${state.genero === "mulher" ? `<li><span class="k">Lactante</span><span class="v">${state.lactante === "sim" ? "Sim" : "Não"}</span></li>` : ""}
      </ul>

      ${
        comorbidadesSelecionadas.length
          ? `<h3>Condições de saúde informadas</h3><ul class="summary-list">${comorbidadesSelecionadas
              .map((c) => `<li><span class="k">${c}</span></li>`)
              .join("")}</ul>`
          : ""
      }

      <h3>Sintomas informados</h3>
      <ul class="summary-list">
        ${selecionados
          .map(
            (s) =>
              `<li><span class="k">${s.label}</span>${s.detail ? `<span class="v">${s.detail}</span>` : ""}</li>`
          )
          .join("")}
      </ul>
    </div>
  `)
  );

  app.appendChild(
    h(`
    <div class="card">
      <p class="lede" style="margin:0 0 12px">Se os sintomas piorarem a qualquer momento, procure atendimento imediatamente ou ligue para o SAMU (192).</p>
      <div class="btn-row">
        <button class="btn ghost" data-action="reiniciar">Recomeçar triagem</button>
      </div>
    </div>
    <p class="disclaimer">Esta ferramenta é apenas um apoio para orientação inicial e não substitui avaliação médica. Nenhuma informação preenchida aqui é armazenada, enviada ou compartilhada — tudo é apagado ao sair desta página.</p>
  `)
  );

  app.querySelector('[data-action="reiniciar"]').onclick = resetState;
}

/* ------------------------------- Wiring util -------------------------------- */

function wireBack() {
  const btn = app.querySelector('[data-action="back"]');
  if (btn) btn.onclick = back;
}

/* ------------------------------- Init -------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  resetState();
});
