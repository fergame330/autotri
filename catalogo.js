"use strict";

/* =========================================================================
   CATÁLOGO DE ENCAMINHAMENTOS — página de referência (catalogo.html)
   -------------------------------------------------------------------------
   Lista todos os sintomas com o destino de cada resposta e todas as
   combinações (sinergias) catalogadas com o nível que cada uma impõe.

   Tudo é montado em tempo de execução a partir das MESMAS estruturas que a
   triagem usa — SYMPTOM_CATEGORIES e COMORBIDITY_CATEGORIES (app.js),
   SINERGIAS e GRAVE (sinergias.js), `dados` (dadospressao.js). Não existe
   aqui nenhuma cópia manual de regra: mudou lá, muda aqui.

   As condições de cada sinergia são lidas do próprio código da regra
   (`quando.toString()`), analisadas em árvore e redesenhadas em português.
   Quando uma regra usa uma construção que o analisador não conhece, o
   código-fonte dela aparece como está, em vez de uma descrição inventada.
   ========================================================================= */

const raiz = document.getElementById("catalogo");

/* ------------------------------ Utilidades ------------------------------- */

const MAPA_ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => MAPA_ESC[c]);

const DESTINO_INFO = {
  casa: { nome: "Cuidado em casa", classe: "casa" },
  ubs: { nome: "UBS", classe: "ubs" },
  upa: { nome: "UPA", classe: "upa" },
  hospital: { nome: "Hospital", classe: "hospital" },
  samu_hospital: { nome: "SAMU + Hospital", classe: "samu" },
};

/* Mesma conta do cálculo base em app.js: 2 manda para o hospital, 1 para a
   UPA, só 0 fica na UBS. */
function destinoDeCodigo(code) {
  if (code.includes(2)) return "hospital";
  if (code.includes(1)) return "upa";
  return "ubs";
}

function selo(destino) {
  const d = DESTINO_INFO[destino];
  return `<span class="dest dest-${d.classe}">${esc(d.nome)}</span>`;
}

function selinho(texto, classe) {
  return `<span class="tag tag-${classe}">${esc(texto)}</span>`;
}

/* ---------------------------- Índices de rótulo -------------------------- */

const SINTOMA_LABEL = {};
const SINTOMA_CAT = {};
SYMPTOM_CATEGORIES.forEach((cat) =>
  cat.items.forEach((it) => {
    SINTOMA_LABEL[it.id] = it.label;
    SINTOMA_CAT[it.id] = cat.title;
  })
);

const COMORB_LABEL = {};
COMORBIDITY_CATEGORIES.forEach((cat) => cat.items.forEach((it) => (COMORB_LABEL[it.id] = it.label)));

/* Grupos nomeados usados pelas regras. Um grupo novo que não esteja aqui faz
   o átomo cair no modo "código-fonte", nunca em uma descrição errada. */
const GRUPOS = {
  NEUROLOGICOS,
  OBSTRUCAO_RESPIRATORIA,
  IMUNOSSUPRESSAO,
  SANGRAMENTO_RISCO,
  CORTICOIDE,
};

const ROTULO_PERFIL = {
  populacao: {
    crianca_clinica: "Criança (menos de 10 anos)",
    adolescente_clinico: "Adolescente (10 a 19 anos)",
    adulto_clinico: "Adulto (20 a 59 anos)",
    idoso_clinico: "Pessoa idosa (60 anos ou mais)",
  },
  subpopulacao: {
    neonatal: "Recém-nascido (menos de 4 semanas)",
    lactente: "Lactente (4 semanas a 1 ano)",
    gravida: "Gestante",
    possivel_gravida: "Suspeita de gravidez",
    puerperio: "Puerpério",
  },
  puerperio: {
    imediato: "Puerpério imediato (menos de 10 dias)",
    tardio: "Puerpério tardio (10 a 41 dias)",
    remoto: "Puerpério remoto (42 dias ou mais)",
  },
};

const ROTULO_BANDA_PA = {
  neonatal: "Até 1 ano",
  crianca: "De 1 a 17 anos",
  adulto: "18 anos ou mais (ou idade não informada)",
};

/* ===================== Leitura das regras de sinergia ====================
   As regras são arrow functions de corpo único sobre um contexto `c`. Para
   mostrar a condição sem reescrevê-la à mão, o texto da função é dividido em
   átomos (`c.cond("x")`, `c.algumSym(GRUPO)`, …) e operadores, e remontado
   em árvore — `&&` liga mais forte que `||`, como em JavaScript.
   ======================================================================== */

function corpoDaRegra(fn) {
  const s = String(fn);
  const i = s.indexOf("=>");
  if (i < 0) return null;
  const corpo = s.slice(i + 2).trim();
  if (corpo.startsWith("{")) return null; // corpo em bloco: não analisamos
  return corpo;
}

function tokeniza(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "(") { tokens.push({ t: "(" }); i++; continue; }
    if (ch === ")") { tokens.push({ t: ")" }); i++; continue; }
    if (src.startsWith("&&", i)) { tokens.push({ t: "&&" }); i += 2; continue; }
    if (src.startsWith("||", i)) { tokens.push({ t: "||" }); i += 2; continue; }
    if (ch === "!" && src[i + 1] !== "=") { tokens.push({ t: "!" }); i++; continue; }

    // Átomo: tudo até um && / || / ) que esteja fora de parênteses,
    // colchetes e aspas.
    let j = i;
    let prof = 0;
    let aspas = null;
    while (j < src.length) {
      const c = src[j];
      if (aspas) {
        if (c === aspas && src[j - 1] !== "\\") aspas = null;
        j++;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { aspas = c; j++; continue; }
      if (c === "(" || c === "[") { prof++; j++; continue; }
      if (c === ")" || c === "]") {
        if (prof === 0) break; // fecha um grupo aberto fora do átomo
        prof--;
        j++;
        continue;
      }
      if (prof === 0 && (src.startsWith("&&", j) || src.startsWith("||", j))) break;
      j++;
    }
    const bruto = src.slice(i, j).trim();
    if (!bruto) throw new Error("átomo vazio na posição " + i);
    tokens.push({ t: "atomo", src: bruto });
    i = j;
  }
  return tokens;
}

function analisa(tokens) {
  let p = 0;

  function ou() {
    const partes = [e()];
    while (tokens[p] && tokens[p].t === "||") {
      p++;
      partes.push(e());
    }
    return partes.length === 1 ? partes[0] : { tipo: "ou", partes };
  }

  function e() {
    const partes = [unario()];
    while (tokens[p] && tokens[p].t === "&&") {
      p++;
      partes.push(unario());
    }
    return partes.length === 1 ? partes[0] : { tipo: "e", partes };
  }

  function unario() {
    const tk = tokens[p];
    if (!tk) throw new Error("expressão terminou antes do esperado");
    if (tk.t === "!") { p++; return { tipo: "nao", de: unario() }; }
    if (tk.t === "(") {
      p++;
      const dentro = ou();
      if (!tokens[p] || tokens[p].t !== ")") throw new Error("faltou fechar parêntese");
      p++;
      return dentro;
    }
    if (tk.t === "atomo") { p++; return { tipo: "atomo", src: tk.src }; }
    throw new Error("token inesperado: " + tk.t);
  }

  const arvore = ou();
  if (p !== tokens.length) throw new Error("sobrou conteúdo depois da expressão");
  return arvore;
}

function arvoreDaRegra(regra) {
  const corpo = corpoDaRegra(regra.quando);
  if (corpo == null) return null;
  try {
    return analisa(tokeniza(corpo));
  } catch (err) {
    return null;
  }
}

/* --------------------- Átomo -> descrição em português ------------------- */

function listaDeIds(arg) {
  const t = arg.trim();
  if (t.startsWith("[")) return (t.match(/"([^"]+)"/g) || []).map((s) => s.slice(1, -1));
  const g = GRUPOS[t];
  return Array.isArray(g) ? g.slice() : null;
}

function listaDeTextos(arg) {
  const t = arg.trim();
  if (!t.startsWith("[")) return null;
  return (t.match(/"([^"]+)"/g) || []).map((s) => s.slice(1, -1));
}

/* Sub-respostas que a regra considera a versão grave do sintoma. */
function opcoesGraves(id) {
  const item = itemSintoma(id);
  const indices = GRAVE[id];
  if (!item || !item.sub || !indices) return null;
  return indices.map((i) => item.sub.options[i] && item.sub.options[i].label).filter(Boolean);
}

const rotuloSintoma = (id) => SINTOMA_LABEL[id] || id;
const rotuloComorb = (id) => COMORB_LABEL[id] || id;
const rotuloEstagio = (e) => (typeof ROTULO_ESTAGIO_PA !== "undefined" && ROTULO_ESTAGIO_PA[e]) || e;

function descreveAtomo(src) {
  let m;

  if ((m = src.match(/^c\.cond\("([^"]+)"\)$/)))
    return { kind: "historico", rotulo: "Histórico", texto: rotuloComorb(m[1]) };

  if ((m = src.match(/^c\.sym\("([^"]+)"\)$/)))
    return { kind: "sintoma", rotulo: "Sintoma", texto: rotuloSintoma(m[1]) };

  if ((m = src.match(/^c\.sym\("([^"]+)",\s*(\[[\s\S]+\])\)$/))) {
    const item = itemSintoma(m[1]);
    const indices = (m[2].match(/\d+/g) || []).map(Number);
    const rotulos = indices.map((i) => item && item.sub && item.sub.options[i] && item.sub.options[i].label);
    if (rotulos.every(Boolean)) {
      return {
        kind: "sintoma",
        rotulo: "Sintoma",
        texto: rotuloSintoma(m[1]),
        detalhe: "na resposta: " + rotulos.join(" · "),
      };
    }
  }

  if ((m = src.match(/^c\.symGrave\("([^"]+)"\)$/))) {
    const op = opcoesGraves(m[1]);
    return {
      kind: "sintoma",
      rotulo: "Sintoma",
      texto: rotuloSintoma(m[1]),
      detalhe: op && op.length ? "na resposta: " + op.join(" · ") : null,
    };
  }

  if ((m = src.match(/^c\.algumSym\(([\s\S]+)\)$/))) {
    const ids = listaDeIds(m[1]);
    if (ids) return { kind: "sintoma", rotulo: "Qualquer um destes sintomas", texto: ids.map(rotuloSintoma).join(" · ") };
  }

  if ((m = src.match(/^c\.algumCond\(([\s\S]+)\)$/))) {
    const ids = listaDeIds(m[1]);
    if (ids) return { kind: "historico", rotulo: "Qualquer um destes no histórico", texto: ids.map(rotuloComorb).join(" · ") };
  }

  if ((m = src.match(/^c\.(populacao|subpopulacao|puerperio) === "([^"]+)"$/))) {
    const tabela = ROTULO_PERFIL[m[1]] || {};
    return { kind: "perfil", rotulo: "Perfil", texto: tabela[m[2]] || `${m[1]} = ${m[2]}` };
  }

  if ((m = src.match(/^c\.pressaoBanda\(\) === "([^"]+)"$/)))
    return { kind: "pressao", rotulo: "Faixa etária da pressão", texto: ROTULO_BANDA_PA[m[1]] || m[1] };

  if ((m = src.match(/^c\.pressaoEstagio\(\) === "([^"]+)"$/)))
    return { kind: "pressao", rotulo: "Pressão medida", texto: rotuloEstagio(m[1]) };

  if ((m = src.match(/^\[([\s\S]+)\]\.includes\(c\.pressaoEstagio\(\)\)$/))) {
    const estagios = listaDeTextos("[" + m[1] + "]");
    if (estagios) return { kind: "pressao", rotulo: "Pressão medida", texto: estagios.map(rotuloEstagio).join(" ou ") };
  }

  if (/^c\.historicoRespondido\(\)$/.test(src))
    return { kind: "fluxo", rotulo: "Etapa", texto: "o histórico de saúde já foi perguntado" };

  return null;
}

/* ---------------------- Desenho da condição em HTML ---------------------- */

function chipHtml(d, negado) {
  const rotulo = negado ? "Sem " + d.rotulo.toLowerCase() : d.rotulo;
  return `<span class="req-chip req-chip-${d.kind}${negado ? " req-chip-nao" : ""}">
      <b>${esc(rotulo)}</b>${esc(d.texto)}${d.detalhe ? `<i>${esc(d.detalhe)}</i>` : ""}
    </span>`;
}

function chipBruto(src) {
  return `<span class="req-chip req-chip-bruto"><b>Condição</b><code>${esc(src)}</code></span>`;
}

/* `aninhado` distingue a lista de requisitos do cartão (o "e" da raiz, sem
   moldura) de um "e" que caiu dentro de um "ou" — esse precisa de caixa
   própria, senão as suas partes parecem alternativas do "ou". */
function noHtml(no, aninhado) {
  if (no.tipo === "atomo") {
    const d = descreveAtomo(no.src);
    return d ? chipHtml(d, false) : chipBruto(no.src);
  }

  if (no.tipo === "nao") {
    if (no.de.tipo === "atomo") {
      const d = descreveAtomo(no.de.src);
      return d ? chipHtml(d, true) : chipBruto("!" + no.de.src);
    }
    return `<div class="req-grupo req-negado"><span class="req-conect">nada disto</span>${noHtml(no.de, true)}</div>`;
  }

  if (no.tipo === "e") {
    const lista = `<ul class="req req-e">${no.partes.map((p) => `<li>${noHtml(p, true)}</li>`).join("")}</ul>`;
    return aninhado
      ? `<div class="req-grupo req-tudo"><span class="req-conect">tudo isto</span>${lista}</div>`
      : lista;
  }

  // "ou"
  return `<div class="req-grupo"><span class="req-conect">qualquer um destes</span>
      <ul class="req req-ou">${no.partes.map((p) => `<li>${noHtml(p, true)}</li>`).join("")}</ul></div>`;
}

function condicaoHtml(regra) {
  const arvore = arvoreDaRegra(regra);
  if (!arvore) {
    return `<div class="req-falha">${chipBruto(corpoDaRegra(regra.quando) || String(regra.quando))}</div>`;
  }
  // Um átomo solto ainda assim vira lista, para alinhar com as demais regras.
  return arvore.tipo === "e" ? noHtml(arvore, false) : `<ul class="req req-e"><li>${noHtml(arvore, true)}</li></ul>`;
}

/* Texto plano de uma regra, para a busca. */
function textoBuscaRegra(regra) {
  const tmp = document.createElement("div");
  tmp.innerHTML = condicaoHtml(regra);
  return `${regra.titulo} ${regra.porque} ${regra.id} ${tmp.textContent}`.toLowerCase();
}

/* ============================== Seções ================================== */

function secaoResumo() {
  const sintomas = SYMPTOM_CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  const respostas = SYMPTOM_CATEGORIES.reduce(
    (n, c) => n + c.items.reduce((m, it) => m + (it.sub ? it.sub.options.length : 1), 0),
    0
  );
  const comorb = COMORBIDITY_CATEGORIES.reduce((n, c) => n + c.items.length, 0);

  const porNivel = {};
  SINERGIAS.forEach((r) => (porNivel[r.nivel] = (porNivel[r.nivel] || 0) + 1));

  const numeros = [
    [sintomas, "sintomas"],
    [respostas, "respostas possíveis"],
    [SINERGIAS.length, "combinações"],
    [comorb, "itens de histórico"],
  ];

  return `
  <section class="bloco">
    <h1>Catálogo de encaminhamentos</h1>
    <p class="lede">Todos os sintomas, todas as respostas e todas as combinações catalogadas, com o destino de cada uma. Página de referência, gerada a partir do próprio código da triagem.</p>

    <div class="numeros">
      ${numeros.map(([n, r]) => `<div class="numero"><strong>${n}</strong><span>${esc(r)}</span></div>`).join("")}
    </div>

    <div class="legenda">
      ${["casa", "ubs", "upa", "hospital", "samu_hospital"].map(selo).join("")}
      ${selinho("+ Polícia 190", "police")}
      ${selinho("+ CVV 188", "cvv")}
      ${selinho("+ CAPS", "cvv")}
    </div>

    <ul class="notas">
      <li><b>Emergência.</b> A primeira pergunta da triagem é se há risco imediato de morte. Se a resposta for sim, o encaminhamento é SAMU 192 e nada mais é avaliado.</li>
      <li><b>Cálculo base.</b> Cada resposta tem um código: <code>0</code> → UBS, <code>1</code> → UPA, <code>1,2</code> → Hospital. Vale o maior entre todos os sintomas marcados.</li>
      <li><b>Sem resposta na sub-pergunta.</b> Vale a última opção da lista (quase sempre “Não sei”), que é a mais conservadora.</li>
      <li><b>Combinações.</b> Só <i>elevam</i> o resultado do cálculo base, nunca rebaixam. A ordem é ${["ubs", "upa", "hospital", "samu_hospital"].map((d) => DESTINO_INFO[d].nome).join(" &lt; ")}.</li>
      <li><b>Cuidado em casa.</b> Um degrau abaixo da UBS: aparece quando <i>tudo</i> o que foi marcado dispensa atendimento — as respostas marcadas como “sozinha: Cuidado em casa” nas tabelas abaixo, e a pressão medida com classificação normal.</li>
      <li><b>Ordem das perguntas.</b> Os sintomas vêm primeiro; idade, gênero e histórico só são perguntados enquanto ainda puderem mudar o destino. Duas consequências: assim que o resultado chega ao hospital a triagem encerra, então combinações que dependem do histórico deixam de ser avaliadas; e as combinações de pressão só valem depois que o histórico foi perguntado — é o que a condição “o histórico de saúde já foi perguntado” marca.</li>
    </ul>
  </section>`;
}

function tabelaSintomas(cat) {
  const corpos = cat.items
    .map((item) => {
      const linhas = [];
      const marcas = [];
      if (item.painel === "febre") marcas.push(selinho("termômetro", "medicao"));
      if (item.painel === "pressao") marcas.push(selinho("manômetro", "medicao"));
      if (item.painel === "oximetro") marcas.push(selinho("oxímetro", "medicao"));
      if (item.painel === "glicose") marcas.push(selinho("glicosímetro", "medicao"));

      const cabeca = (n) =>
        `<th rowspan="${n}" scope="rowgroup"><span class="sintoma-nome">${esc(item.label)}</span>
           <span class="sintoma-id">${esc(item.id)}</span>${marcas.join("")}</th>`;

      if (!item.sub) {
        linhas.push(
          `<tr>${cabeca(1)}<td class="resp">—</td><td class="cod"><code>${item.code.join(",")}</code></td>
             <td>${selo(destinoDeCodigo(item.code))}</td></tr>`
        );
      } else {
        item.sub.options.forEach((opt, i) => {
          const extras = [];
          if (opt.policia) extras.push(selinho("+ Polícia 190", "police"));
          if (opt.cvv) extras.push(selinho("+ CVV 188", "cvv"));
          if (opt.caps) extras.push(selinho("+ CAPS", "cvv"));
          if (opt.casa) extras.push(`<span class="obs">sozinha: ${selo("casa")}</span>`);
          linhas.push(
            `<tr>${i === 0 ? cabeca(item.sub.options.length) : ""}
               <td class="resp">${esc(opt.label)}</td>
               <td class="cod"><code>${opt.code.join(",")}</code></td>
               <td>${selo(destinoDeCodigo(opt.code))}${extras.join("")}</td></tr>`
          );
        });
      }

      const busca = [
        item.label,
        item.id,
        cat.title,
        ...(item.sub ? item.sub.options.map((o) => o.label) : []),
      ]
        .join(" ")
        .toLowerCase();

      return `<tbody data-busca="${esc(busca)}">${linhas.join("")}</tbody>`;
    })
    .join("");

  return `
  <div class="cat" data-cat>
    <h3>${esc(cat.title)}</h3>
    <div class="rolagem">
      <table class="tbl tbl-sintomas">
        <colgroup><col class="c-sint" /><col class="c-resp" /><col class="c-cod" /><col class="c-dest" /></colgroup>
        <thead><tr><th>Sintoma</th><th>Resposta</th><th>Código</th><th>Encaminhamento</th></tr></thead>
        ${corpos}
      </table>
    </div>
  </div>`;
}

function secaoSintomas() {
  return `
  <section class="bloco" id="sintomas">
    <h2>Sintomas</h2>
    <p class="sub">Na ordem em que aparecem na triagem, uma parte por sistema do corpo. Quando um sintoma tem sub-pergunta, cada resposta tem o seu próprio destino.</p>
    ${SYMPTOM_CATEGORIES.map(tabelaSintomas).join("")}
  </section>`;
}

/* ------------------------------- Medições -------------------------------- */

function faixasTemperatura() {
  const faixas = [];
  for (let d = TEMP_MIN; d <= TEMP_MAX; d++) {
    const t = d / 10;
    const c = classificaTemperatura(t);
    const ultima = faixas[faixas.length - 1];
    if (ultima && ultima.rotulo === c.rotulo && ultima.indice === c.indice) ultima.fim = t;
    else faixas.push({ ini: t, fim: t, rotulo: c.rotulo, indice: c.indice, zona: c.zona });
  }
  return faixas;
}

/* Agrupa valores inteiros consecutivos que caem na mesma classificação —
   as faixas saem da função que a triagem usa, não de uma cópia. */
function faixasNumericas(min, max, classifica) {
  const faixas = [];
  for (let v = min; v <= max; v++) {
    const c = classifica(v);
    const ultima = faixas[faixas.length - 1];
    if (ultima && ultima.rotulo === c.rotulo && ultima.indice === c.indice) ultima.fim = v;
    else faixas.push({ ini: v, fim: v, rotulo: c.rotulo, indice: c.indice, zona: c.zona });
  }
  return faixas;
}

function tabelaFaixas(itemId, min, max, classifica, unidade, cabecalho) {
  const item = itemSintoma(itemId);
  const linhas = faixasNumericas(min, max, classifica)
    .map((f) => {
      const opt = item.sub.options[f.indice];
      const faixa =
        f.ini === min
          ? `${f.fim}${unidade} ou menos`
          : f.fim === max
          ? `${f.ini}${unidade} ou mais`
          : `${f.ini} a ${f.fim}${unidade}`;
      const extra = opt.casa ? `<span class="obs">sozinha: ${selo("casa")}</span>` : "";
      return `<tr><td class="cod">${esc(faixa)}</td><td>${esc(f.rotulo)}</td>
        <td class="cod"><code>${opt.code.join(",")}</code></td>
        <td>${selo(destinoDeCodigo(opt.code))}${extra}</td></tr>`;
    })
    .join("");

  return `
    <div class="rolagem">
      <table class="tbl">
        <thead><tr><th>${esc(cabecalho)}</th><th>Classificação</th><th>Código</th><th>Encaminhamento</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;
}

function secaoOximetro() {
  return `
  <div class="cat">
    <h3>Oxímetro — saturação e frequência cardíaca</h3>
    <p class="sub">Um aparelho só para os dois sintomas: medir por qualquer um deles grava a mesma leitura nos dois, e os dois ficam marcados. Quem escolhe “não consegui medir” fica na última resposta dos dois, que não encaminha por si só.</p>
    <h4>Saturação de oxigênio (SpO2)</h4>
    ${tabelaFaixas("spo2", SPO2_MIN, SPO2_MAX, classificaSpo2, "%", "Saturação")}
    <h4>Frequência cardíaca (FC), por idade</h4>
    ${Object.entries(FAIXAS_FC)
      .map(
        ([banda, f]) => `<h5>${esc(f.rotulo)}</h5>
    ${tabelaFaixas("frequencia_cardiaca", FC_MIN, FC_MAX, (v) => classificaFc(v, banda), " bpm", "Frequência")}`
      )
      .join("")}
  </div>`;
}

function secaoGlicose() {
  const item = itemSintoma("glicose");

  const limiteHtml = (lim) => {
    const acima =
      lim.alerta != null
        ? `acima de ${lim.alvo}; bem acima a partir de ${lim.alerta}`
        : `acima de ${lim.alvo}`;
    return `<b>${GLIC_BAIXA} a ${lim.alvo} mg/dL</b><span class="obs">${esc(acima)}</span>`;
  };

  const momentos = Object.entries(GLICOSE_MOMENTOS);
  const corpos = Object.values(GLICOSE_TABELA)
    .map(
      (f) => `<tbody>${momentos
        .map(
          ([chave, rotulo], i) => `
          <tr>
            ${i === 0 ? `<th rowspan="${momentos.length}" scope="rowgroup">${esc(f.rotulo)}</th>` : ""}
            <td class="resp">${esc(rotulo)}</td>
            <td>${limiteHtml(f[chave].sem)}</td>
            <td>${limiteHtml(f[chave].com)}</td>
          </tr>`
        )
        .join("")}</tbody>`
    )
    .join("");

  /* Indexado pela posição da resposta no sintoma; ORDEM_GLICOSE só decide
     em que sequência as linhas aparecem, do nível mais baixo ao mais alto. */
  const QUANDO = [
    "dentro do intervalo esperado na tabela acima",
    `abaixo de ${GLIC_BAIXA} mg/dL, em qualquer faixa`,
    "acima do esperado, sem chegar ao segundo corte",
    "no segundo corte da tabela ou além dele",
    "a pessoa marcou “não consegui medir”",
  ];
  const ORDEM_GLICOSE = [1, 0, 2, 3, 4];

  const niveis = ORDEM_GLICOSE.map((i) => {
    const opt = item.sub.options[i];
    const extra = opt.casa ? `<span class="obs">sozinha: ${selo("casa")}</span>` : "";
    return `<tr><td>${esc(opt.label)}</td><td class="resp">${esc(QUANDO[i])}</td>
      <td class="cod"><code>${opt.code.join(",")}</code></td>
      <td>${selo(destinoDeCodigo(opt.code))}${extra}</td></tr>`;
  }).join("");

  return `
  <div class="cat">
    <h3>Glicosímetro — glicemia</h3>
    <p class="sub">Antes de abrir o aparelho a triagem pergunta idade, gênero e se a pessoa tem diabetes — os três mudam a tabela de referência, e a resposta de diabetes já fica marcada no histórico de saúde. O painel também pergunta se a medição foi em jejum ou 2 h depois de comer. Nenhum nível de glicose encaminha sozinho: todos valem <code>0</code>, e o que pesa é a combinação listada adiante.</p>

    <h4>Faixas esperadas (mg/dL)</h4>
    <div class="rolagem">
      <table class="tbl">
        <thead><tr><th>Faixa</th><th>Momento</th><th>Sem diabetes</th><th>Com diabetes</th></tr></thead>
        ${corpos}
      </table>
    </div>

    <h4>Classificação da leitura</h4>
    <div class="rolagem">
      <table class="tbl">
        <thead><tr><th>Resposta</th><th>Quando</th><th>Código</th><th>Encaminhamento</th></tr></thead>
        <tbody>${niveis}</tbody>
      </table>
    </div>
  </div>`;
}

function secaoFebre() {
  const item = itemSintoma("febre_hipotermia");
  const num = (t) => t.toFixed(1).replace(".", ",");

  const linhas = faixasTemperatura()
    .map((f) => {
      const code = item.sub.options[f.indice].code;
      const faixa =
        f.ini === TEMP_MIN / 10
          ? `${num(f.fim)} °C ou menos`
          : f.fim === TEMP_MAX / 10
          ? `${num(f.ini)} °C ou mais`
          : `${num(f.ini)} – ${num(f.fim)} °C`;
      const extra = item.sub.options[f.indice].casa
        ? `<span class="obs">sozinha: ${selo("casa")}</span>`
        : "";
      return `<tr><td class="cod">${faixa}</td><td>${esc(f.rotulo)}</td>
        <td class="cod"><code>${code.join(",")}</code></td>
        <td>${selo(destinoDeCodigo(code))}${extra}</td></tr>`;
    })
    .join("");

  return `
  <div class="cat">
    <h3>Termômetro — febre e hipotermia</h3>
    <p class="sub">A leitura do termômetro escolhe sozinha uma das respostas do sintoma. Quem marca “não consigo medir” responde pelas opções da tabela de sintomas.</p>
    <div class="rolagem">
      <table class="tbl">
        <thead><tr><th>Temperatura</th><th>Classificação</th><th>Código</th><th>Encaminhamento</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>
  </div>`;
}

function tabelaPatamares(titulo, patamares) {
  const linhas = patamares
    .map(
      (p) =>
        `<tr><td>${esc(rotuloEstagio(p.rotulo))}</td>
           <td class="cod">sistólica ≥ ${p.sys} <b>ou</b> diastólica ≥ ${p.dia}</td></tr>`
    )
    .join("");
  return `
    <h4>${esc(titulo)}</h4>
    <div class="rolagem">
      <table class="tbl tbl-mini">
        <thead><tr><th>Classificação</th><th>Atingida quando…</th></tr></thead>
        <tbody>
          <tr><td>${esc(rotuloEstagio("normal"))}</td><td class="cod">nenhum dos limites abaixo é alcançado</td></tr>
          ${linhas}
        </tbody>
      </table>
    </div>`;
}

function patamaresDe(pares) {
  return pares.map(([rotulo, pa]) => {
    const [sys, dia] = pa.split("/").map(Number);
    return { rotulo, sys, dia };
  });
}

function tabelaPercentil(sexoChave, titulo) {
  const grupo = dados[sexoChave];
  const blocos = Object.keys(grupo)
    .sort((a, b) => Number(a) - Number(b))
    .map((idade) => {
      const pi = grupo[idade];
      const alturas = Object.keys(pi.P90).sort((a, b) => Number(a) - Number(b));
      const linhas = alturas
        .map(
          (alt) =>
            `<tr><td class="cod">${esc(alt)} cm</td><td class="cod">${esc(pi.P90[alt])}</td>
               <td class="cod">${esc(pi.P95[alt])}</td><td class="cod">${esc(pi["P95+12"][alt])}</td></tr>`
        )
        .join("");
      return `
        <details class="idade">
          <summary>${esc(idade)} ${idade === "1" ? "ano" : "anos"}</summary>
          <div class="rolagem">
            <table class="tbl tbl-mini">
              <thead><tr><th>Altura</th><th>P90 — pré-hipertensão</th><th>P95 — estágio 1</th><th>P95+12 — estágio 2</th></tr></thead>
              <tbody>${linhas}</tbody>
            </table>
          </div>
        </details>`;
    })
    .join("");

  return `<div class="percentil"><h5>${esc(titulo)}</h5>${blocos}</div>`;
}

function secaoPressao() {
  const neo = dados.neonatal;
  const adolescente = dados["maior de 13 e menor de 18"];
  const adulto = dados["maior de idade"];

  return `
  <div class="cat">
    <h3>Manômetro — pressão arterial</h3>
    <p class="sub">A pressão não tem código próprio: qualquer resposta do sintoma vale <code>0</code>. O que muda o encaminhamento são as combinações de pressão listadas adiante, e só quando a pessoa <b>não</b> tem hipertensão no histórico. Uma leitura normal, se for a única marcação da triagem, leva a cuidado em casa. Uma leitura atinge um patamar quando a sistólica <b>ou</b> a diastólica alcança o valor de referência — o pior dos dois eixos manda.</p>

    ${tabelaPatamares("Até 1 ano", patamaresDe([["pre-hipertensão", neo.base], ["hipertensão", neo.hiper]]))}

    <h4>De 1 a 12 anos — por percentil</h4>
    <p class="sub">Nessa faixa a referência depende de sexo, idade e altura: a triagem procura, na tabela da idade, a altura mais próxima da medida e compara a leitura com P90 (pré-hipertensão), P95 (estágio 1) e P95+12 (estágio 2). É por isso que a medição de pressão pede idade, gênero e altura antes de abrir o manômetro.</p>
    ${tabelaPercentil("meninos", "Meninos")}
    ${tabelaPercentil("meninas", "Meninas")}

    ${tabelaPatamares(
      "De 13 a 17 anos",
      patamaresDe([
        ["pre-hipertensão", adolescente.base],
        ["hipertensão 1", adolescente.pre],
        ["hipertensão 2", adolescente.hiper],
      ])
    )}

    ${tabelaPatamares(
      "18 anos ou mais (e idade “não sei”)",
      patamaresDe([
        ["pre-hipertensão", adulto.base],
        ["hipertensão 1", adulto.pre],
        ["hipertensão 2", adulto.hiper],
        ["hipertensão 3", adulto.mega],
      ])
    )}
  </div>`;
}

function secaoMedicoes() {
  return `
  <section class="bloco" id="medicoes" data-referencia>
    <h2>Medições</h2>
    <p class="sub">Alguns sintomas abrem uma medição no lugar das opções escritas. A leitura escolhe sozinha a resposta do sintoma.</p>
    ${secaoFebre()}
    ${secaoOximetro()}
    ${secaoGlicose()}
    ${secaoPressao()}
  </section>`;
}

/* ------------------------------ Combinações ------------------------------ */

const ORDEM_NIVEL = ["samu_hospital", "hospital", "upa", "ubs"];

function cartaoSinergia(regra) {
  return `
  <article class="sinergia" data-busca="${esc(textoBuscaRegra(regra))}">
    <header>
      ${selo(regra.nivel)}
      <h4>${esc(regra.titulo)}</h4>
    </header>
    ${condicaoHtml(regra)}
    <p class="porque">${esc(regra.porque)}</p>
    <span class="sintoma-id">${esc(regra.id)}</span>
  </article>`;
}

function secaoSinergias() {
  const grupos = ORDEM_NIVEL.map((nivel) => {
    const regras = SINERGIAS.filter((r) => r.nivel === nivel);
    if (!regras.length) return "";
    return `
      <div class="cat" data-cat>
        <h3>${esc(DESTINO_INFO[nivel].nome)} <span class="conta">${regras.length}</span></h3>
        <div class="sinergias">${regras.map(cartaoSinergia).join("")}</div>
      </div>`;
  }).join("");

  return `
  <section class="bloco" id="combinacoes">
    <h2>Combinações catalogadas</h2>
    <p class="sub">Agrupadas pelo nível que cada uma impõe. Uma combinação só eleva o resultado do cálculo base — se os sintomas sozinhos já mandam para um lugar mais alto, vale o mais alto. Todas as condições de uma combinação precisam ser verdadeiras ao mesmo tempo.</p>
    ${grupos}
  </section>`;
}

/* ------------------------------- Histórico -------------------------------- */

function secaoHistorico() {
  const cats = COMORBIDITY_CATEGORIES.map(
    (cat) => `
    <div class="hist-cat" data-cat>
      <h4>${esc(cat.title)}</h4>
      <ul>${cat.items
        .map(
          (it) =>
            `<li data-busca="${esc((it.label + " " + it.id + " " + cat.title).toLowerCase())}">${esc(
              it.label
            )}<span class="sintoma-id">${esc(it.id)}</span></li>`
        )
        .join("")}</ul>
    </div>`
  ).join("");

  return `
  <section class="bloco" id="historico">
    <h2>Histórico de saúde</h2>
    <p class="sub">Nenhum item do histórico encaminha sozinho. Ele só pesa através das combinações acima.</p>
    <div class="hist">${cats}</div>
  </section>`;
}

/* --------------------------------- Busca ---------------------------------- */

function ligaBusca() {
  const campo = document.getElementById("busca");
  const contador = document.getElementById("busca-conta");
  const alvos = Array.from(raiz.querySelectorAll("[data-busca]"));

  const aplica = () => {
    const termo = campo.value.trim().toLowerCase();
    let visiveis = 0;

    alvos.forEach((n) => {
      const bate = !termo || n.dataset.busca.includes(termo);
      n.hidden = !bate;
      if (bate) visiveis++;
    });

    // Esconde a categoria e a seção que ficaram sem nenhum item visível.
    raiz.querySelectorAll("[data-cat]").forEach((c) => {
      c.hidden = !c.querySelector("[data-busca]:not([hidden])");
    });
    raiz.querySelectorAll(".bloco").forEach((sec) => {
      if (sec.hasAttribute("data-referencia")) {
        sec.hidden = !!termo; // tabelas de referência não entram na busca
        return;
      }
      if (!sec.querySelector("[data-busca]")) return;
      sec.hidden = !sec.querySelector("[data-busca]:not([hidden])");
    });

    contador.textContent = termo ? `${visiveis} ${visiveis === 1 ? "resultado" : "resultados"}` : "";
  };

  campo.addEventListener("input", aplica);
  campo.addEventListener("search", aplica);
}

/* --------------------------------- Início --------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  raiz.innerHTML =
    secaoResumo() + secaoSintomas() + secaoMedicoes() + secaoSinergias() + secaoHistorico();

  ligaBusca();
});
