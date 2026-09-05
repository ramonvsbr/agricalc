/* ==========================================================================
   AGRICALC — main.js
   Script único, compartilhado por todas as páginas do site.
   Cada bloco verifica se os elementos da respectiva página existem antes
   de rodar, então é seguro incluir este arquivo em qualquer página.
   ========================================================================== */

/* --------------------------------------------------------------------------
   LÓGICA DA HOMEPAGE (Busca e Filtros de apps) — index.html
   -------------------------------------------------------------------------- */
function filtrarApps() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const input = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll('.app-card');

  cards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const desc = card.querySelector('p').textContent.toLowerCase();

    if (title.includes(input) || desc.includes(input)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function filtrarChip(termo) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = termo;
    filtrarApps();
  }
}

/* --------------------------------------------------------------------------
   LÓGICA DA CALCULADORA DE ADUBAÇÃO E CALAGEM — apps/adubacao.html
   -------------------------------------------------------------------------- */

// --- Trata entradas numéricas permitindo vírgula e ponto ---
function parseNum(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = el.value.toString().replace(',', '.').trim();
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

// --- Tabela de Adubos (composição garantida, % do nutriente) ---
const FERT = {
  ureia:         {nome:'Ureia',                           N:45, P:0,  K:0,  Ca:0,  Mg:0,   S:0},
  sulfato_amonio:{nome:'Sulfato de Amônio',               N:20, P:0,  K:0,  Ca:0,  Mg:0,   S:24},
  map:           {nome:'MAP (Fosfato Monoamônico)',        N:11, P:48, K:0,  Ca:0,  Mg:0,   S:0},
  dap:           {nome:'DAP (Fosfato Diamônico)',          N:16, P:45, K:0,  Ca:0,  Mg:0,   S:0},
  nitrato_ca:    {nome:'Nitrato de Cálcio',                N:14, P:0,  K:0,  Ca:19, Mg:0,   S:0},
  nitrato_k:     {nome:'Nitrato de Potássio',              N:13, P:0,  K:44, Ca:0,  Mg:0,   S:0},
  nitrato_mg:    {nome:'Nitrato de Magnésio',              N:11, P:0,  K:0,  Ca:0,  Mg:9.5, S:0},
  sfs:           {nome:'Superfosfato Simples',             N:0,  P:20, K:0,  Ca:20, Mg:0,   S:12},
  sft:           {nome:'Superfosfato Triplo',              N:0,  P:45, K:0,  Ca:13, Mg:0,   S:0},
  kcl:           {nome:'Cloreto de Potássio',              N:0,  P:0,  K:60, Ca:0,  Mg:0,   S:0},
  kcl_branco:    {nome:'KCl Potássio Branco',              N:0,  P:0,  K:52, Ca:0,  Mg:0,   S:0},
  sulfato_k:     {nome:'Sulfato de Potássio',               N:0,  P:0,  K:48, Ca:0,  Mg:0,   S:17},
  sulfato_mg:    {nome:'Sulfato de Magnésio',               N:0,  P:0,  K:0,  Ca:0,  Mg:9.5, S:13},
  oxido_mg:      {nome:'Óxido de Magnésio',                 N:0,  P:0,  K:0,  Ca:0,  Mg:55,  S:0},
  nitrato_mg2:   {nome:'Nitrato de Magnésio',               N:11, P:0,  K:0,  Ca:0,  Mg:9.5, S:0},
  borax:         {nome:'Bórax',                             B:11.5, S:0},
  sulfato_zn:    {nome:'Sulfato de Zinco',                  Zn:20, S:16},
  sulfato_mn:    {nome:'Sulfato de Manganês',               Mn:25, S:21},
  sulfato_cu:    {nome:'Sulfato de Cobre',                  Cu:24, S:12},
  fe_edta:       {nome:'Fe-EDTA (pó)',                     Fe:13},
  fe_eddhma:     {nome:'Fe-EDDHMA',                        Fe:6},
  molibdato_na:  {nome:'Molibdato de Sódio',                Mo:39},
  gesso:         {nome:'Gesso Agrícola',                   N:0,  P:0,  K:0,  Ca:15, Mg:0,   S:15}
};

// --- Exigências nutricionais médias por cultura ---
const CULTURAS = {
  soja:         {nome:'Soja',                      N:0,   P:{baixo:100,medio:70,alto:40}, K:{baixo:90,medio:60,alto:40},  S:20, V:70},
  milho:        {nome:'Milho',                     N:120, P:{baixo:100,medio:80,alto:50}, K:{baixo:80,medio:60,alto:40},  S:20, V:60},
  feijao:       {nome:'Feijão',                    N:80,  P:{baixo:100,medio:80,alto:50}, K:{baixo:70,medio:50,alto:30},  S:20, V:70},
  cafe:         {nome:'Café (formação)',           N:150, P:{baixo:120,medio:90,alto:60}, K:{baixo:120,medio:90,alto:60}, S:30, V:60},
  cana:         {nome:'Cana-de-açúcar (plantio)',  N:60,  P:{baixo:100,medio:80,alto:50}, K:{baixo:140,medio:110,alto:80},S:20, V:60},
  pastagem:     {nome:'Pastagem (formação)',        N:50,  P:{baixo:60,medio:40,alto:20},  K:{baixo:40,medio:30,alto:20},  S:15, V:50},
  hortalicas:   {nome:'Hortaliças (folhosas)',     N:150, P:{baixo:180,medio:140,alto:100},K:{baixo:150,medio:110,alto:80},S:30, V:80},
  personalizado:{nome:'Personalizado',             N:0,   P:{baixo:0,medio:0,alto:0},     K:{baixo:0,medio:0,alto:0},     S:0,  V:70}
};

// --- Faixas de classificação de teores no solo ---
const FAIXAS = {
  P:  [[5,'muito_baixo'],[12,'baixo'],[30,'medio'],[60,'alto'],[Infinity,'muito_alto']],
  K:  [[0.07,'muito_baixo'],[0.15,'baixo'],[0.30,'medio'],[0.60,'alto'],[Infinity,'muito_alto']],
  Ca: [[1.5,'baixo'],[3.0,'medio'],[Infinity,'alto']],
  Mg: [[0.4,'baixo'],[0.8,'medio'],[Infinity,'alto']],
  S:  [[5,'muito_baixo'],[10,'baixo'],[15,'medio'],[Infinity,'alto']],
  CE: [[0.75,'nao_salino'],[2.0,'levemente_salino'],[4.0,'moderado'],[8.0,'salino'],[Infinity,'fortemente_salino']]
};

const ROTULOS = {
  muito_baixo:'Muito baixo', baixo:'Baixo', medio:'Médio', alto:'Alto', muito_alto:'Muito alto',
  nao_salino:'Não salino', levemente_salino:'Levemente salino', moderado:'Moderado', salino:'Salino', fortemente_salino:'Salino Alto'
};
const CORCLASSE = {
  muito_baixo:'baixo', baixo:'baixo', medio:'medio', alto:'alto', muito_alto:'alto',
  nao_salino:'alto', levemente_salino:'medio', moderado:'alerta', salino:'alerta', fortemente_salino:'alerta'
};

function classificar(valor, faixa) {
  for (const [limite, nivel] of faixa) { if (valor <= limite) return nivel; }
  return faixa[faixa.length - 1][1];
}

function demandaCultura(baseTabela, nivel5) {
  if (nivel5 === 'muito_baixo') return Math.round(baseTabela.baixo * 1.15);
  if (nivel5 === 'muito_alto') return Math.round(baseTabela.alto * 0.5);
  return baseTabela[nivel5] || baseTabela.medio;
}

// --- Navegação entre etapas (stepper) ---
const NOMES_ETAPAS = ['Solo', 'Cultura', 'Adubos', 'Resultado'];

function irPara(step) {
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel == step));
  document.querySelectorAll('.step-btn').forEach((btn, idx) => btn.classList.toggle('active', (idx + 1) == step));

  const mobText = document.getElementById('mobileStepText');
  if (mobText) mobText.textContent = `Etapa ${step} de 4: ${NOMES_ETAPAS[step - 1]}`;

  window.scrollTo({top: 0, behavior: 'smooth'});
}

// --- Atualização da classificação de níveis (Etapa 1) ---
function atualizarNiveis() {
  const nivEl = document.getElementById('niveis');
  if (!nivEl) return; // só existe na página de adubação

  const p = parseNum('p');
  const k = parseNum('k');
  const ca = parseNum('ca');
  const mg = parseNum('mg');
  const s = parseNum('s');
  const ce = parseNum('ce');
  const na = parseNum('na');
  const ctc = parseNum('ctc');

  const nP = classificar(p, FAIXAS.P);
  const nK = classificar(k, FAIXAS.K);
  const nCa = classificar(ca, FAIXAS.Ca);
  const nMg = classificar(mg, FAIXAS.Mg);
  const nS = classificar(s, FAIXAS.S);
  const nCE = classificar(ce, FAIXAS.CE);
  const pst = ctc > 0 ? (na / ctc * 100) : 0;

  const badge = (rotulo, nivel) => `${rotulo}: <span class="badge ${CORCLASSE[nivel]}">${ROTULOS[nivel]}</span>`;

  nivEl.innerHTML =
    badge('P', nP) + badge('K', nK) + badge('Ca', nCa) + badge('Mg', nMg) + badge('S', nS) + badge('CE', nCE) +
    `<span class="badge ${pst >= 15 ? 'alerta' : 'medio'}">PST ${pst.toFixed(1)}% ${pst >= 15 ? '— Solo Sódico' : ''}</span>`;
}

// --- Carregar exigência padrão da cultura selecionada (Etapa 2) ---
function carregarCultura() {
  const culturaEl = document.getElementById('cultura');
  if (!culturaEl) return; // só existe na página de adubação

  const id = culturaEl.value;
  const c = CULTURAS[id];
  const p = parseNum('p');
  const k = parseNum('k');
  const nivelP = classificar(p, FAIXAS.P);
  const nivelK = classificar(k, FAIXAS.K);

  if (id === 'personalizado') {
    document.getElementById('n_ha').value = 0;
    document.getElementById('p_ha').value = 0;
    document.getElementById('k_ha').value = 0;
    document.getElementById('s_ha').value = 0;
    document.getElementById('vAlvo').value = 70;
    return;
  }
  document.getElementById('n_ha').value = c.N;
  document.getElementById('p_ha').value = demandaCultura(c.P, nivelP);
  document.getElementById('k_ha').value = demandaCultura(c.K, nivelK);
  document.getElementById('s_ha').value = c.S;
  document.getElementById('vAlvo').value = c.V;
}

// --- Formatação de composição de fontes (Etapa 3) ---
function fmtComp(f) {
  if (!f) return '—';
  const partes = [];
  if (f.N) partes.push(`N ${f.N}%`);
  if (f.P) partes.push(`P₂O₅ ${f.P}%`);
  if (f.K) partes.push(`K₂O ${f.K}%`);
  if (f.Ca) partes.push(`Ca ${f.Ca}%`);
  if (f.Mg) partes.push(`Mg ${f.Mg}%`);
  if (f.S) partes.push(`S ${f.S}%`);
  return partes.join(' · ') || '—';
}

function atualizarComposicoes() {
  const compP = document.getElementById('compP');
  if (!compP) return; // só existe na página de adubação

  compP.textContent = fmtComp(FERT[document.getElementById('fonteP').value]);
  document.getElementById('compK').textContent = fmtComp(FERT[document.getElementById('fonteK').value]);
  document.getElementById('compN').textContent = fmtComp(FERT[document.getElementById('fonteN').value]);
  document.getElementById('compMg').textContent = fmtComp(FERT[document.getElementById('fonteMg').value]);
}

// --- Cálculo principal: calagem + N-P-K + S/Mg + resumo de compras ---
function calcular() {
  const resultadoEl = document.getElementById('resultado');
  if (!resultadoEl) return; // só existe na página de adubação

  const area = Math.max(0, parseNum('area'));
  const N_ha = parseNum('n_ha');
  const P_ha = parseNum('p_ha');
  const K_ha = parseNum('k_ha');
  const S_ha = parseNum('s_ha');
  const CTC = parseNum('ctc');
  const Vatual = parseNum('vatual');
  const Valvo = parseNum('vAlvo');
  const PRNT = parseNum('prnt') || 100;

  let NC = CTC * (Valvo - Vatual) / 100 / (PRNT / 100);
  if (NC < 0) NC = 0;

  const pf = FERT[document.getElementById('fonteP').value];
  const kf = FERT[document.getElementById('fonteK').value];
  const nf = FERT[document.getElementById('fonteN').value];

  // Cálculo de P
  const pAmount_ha = pf.P > 0 ? P_ha / (pf.P / 100) : 0;
  const nDaP = pAmount_ha * (pf.N || 0) / 100;
  const sDaP = pAmount_ha * (pf.S || 0) / 100;

  // Cálculo de K
  const kAmount_ha = kf.K > 0 ? K_ha / (kf.K / 100) : 0;
  const sDaK = kAmount_ha * (kf.S || 0) / 100;
  const nDaK = kAmount_ha * (kf.N || 0) / 100;

  // Saldo de N
  const nContribuido = nDaP + nDaK;
  const nRestante = N_ha - nContribuido;
  const nExcedente = nRestante < 0;
  const nAmount_ha = nExcedente ? 0 : (nf.N > 0 ? nRestante / (nf.N / 100) : 0);
  const sDaN = nAmount_ha * (nf.S || 0) / 100;

  // Magnésio complementar
  const Mg_ha = parseNum('mg_ha');
  const mgf = FERT[document.getElementById('fonteMg').value];
  const mgAmount_ha = Mg_ha > 0 && mgf.Mg > 0 ? Mg_ha / (mgf.Mg / 100) : 0;
  const sDaMg = mgAmount_ha * (mgf.S || 0) / 100;

  // Micronutrientes
  const b_ha = parseNum('b_ha');
  const zn_ha = parseNum('zn_ha');
  const mn_ha = parseNum('mn_ha');
  const cu_ha = parseNum('cu_ha');
  const mo_ha = parseNum('mo_ha');
  const fe_ha = parseNum('fe_ha');
  const fef = FERT[document.getElementById('fonteFe').value];

  const znAmount = zn_ha > 0 ? zn_ha / (FERT.sulfato_zn.Zn / 100) : 0;
  const mnAmount = mn_ha > 0 ? mn_ha / (FERT.sulfato_mn.Mn / 100) : 0;
  const cuAmount = cu_ha > 0 ? cu_ha / (FERT.sulfato_cu.Cu / 100) : 0;

  const sDaZn = znAmount * (FERT.sulfato_zn.S || 0) / 100;
  const sDaMn = mnAmount * (FERT.sulfato_mn.S || 0) / 100;
  const sDaCu = cuAmount * (FERT.sulfato_cu.S || 0) / 100;

  // Saldo de Enxofre
  const sSuprido = sDaP + sDaK + sDaN + sDaMg + sDaZn + sDaMn + sDaCu;
  const sRestante = S_ha - sSuprido;
  const gessoAmountReal_ha = sRestante > 0 ? sRestante / (FERT.gesso.S / 100) : 0;

  const area_mult = v => v * area;
  const sacos = v => v / 50;

  let html = '';

  // Card Calagem
  html += `<div class="card"><h2>1. Calagem</h2>`;
  if (NC > 0) {
    html += `<div class="table-responsive"><table>
      <tr><th>Insumo</th><th class="num">kg/ha</th><th class="num">t/ha</th><th class="num">Total na Área</th></tr>
      <tr><td>Calcário (PRNT ${PRNT}%)</td><td class="num">${(NC * 1000).toFixed(0)}</td><td class="num">${NC.toFixed(2)}</td><td class="num">${area_mult(NC).toFixed(2)} t</td></tr>
    </table></div>
    <div class="callout">Eleva V de ${Vatual}% para ${Valvo}%. Aplique com antecedência.</div>`;
  } else {
    html += `<div class="callout ok">Saturação por bases adequada (${Vatual}%). Calagem não necessária.</div>`;
  }
  html += `</div>`;

  // Card Macronutrientes
  html += `<div class="card"><h2>2. Adubação (N, P, K)</h2>
    <div class="table-responsive"><table>
      <tr><th>Fonte</th><th class="num">kg/ha</th><th class="num">Total (kg)</th><th class="num">Sacos 50kg</th></tr>
      <tr><td>${pf.nome} (P)</td><td class="num">${pAmount_ha.toFixed(1)}</td><td class="num">${area_mult(pAmount_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(pAmount_ha)).toFixed(1)}</td></tr>
      <tr><td>${kf.nome} (K)</td><td class="num">${kAmount_ha.toFixed(1)}</td><td class="num">${area_mult(kAmount_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(kAmount_ha)).toFixed(1)}</td></tr>
      <tr><td>${nf.nome} (N)</td><td class="num">${nAmount_ha.toFixed(1)}</td><td class="num">${area_mult(nAmount_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(nAmount_ha)).toFixed(1)}</td></tr>
    </table></div>`;
  if (nContribuido > 0.05) {
    html += `<div class="callout ok">As fontes de P e K supriram ${nContribuido.toFixed(1)} kg/ha de N. Esse valor foi descontado na dose de N.</div>`;
  }
  if (nExcedente) {
    html += `<div class="callout warn">As fontes de P e K já superam a exigência de N em ${Math.abs(nRestante).toFixed(1)} kg/ha.</div>`;
  }
  html += `</div>`;

  // Card S / Mg
  html += `<div class="card"><h2>3. Enxofre e Magnésio</h2>
    <div class="table-responsive"><table>
      <tr><th>Nutriente</th><th class="num">Exigido</th><th class="num">Suprido</th><th class="num">Saldo</th></tr>
      <tr><td>S (Enxofre)</td><td class="num">${S_ha.toFixed(1)}</td><td class="num">${sSuprido.toFixed(1)}</td><td class="num">${(S_ha - sSuprido).toFixed(1)}</td></tr>
    </table></div>`;
  if (gessoAmountReal_ha > 0.05) {
    html += `<div class="callout">Complementar com <b>Gesso Agrícola</b>: ${gessoAmountReal_ha.toFixed(1)} kg/ha (${area_mult(gessoAmountReal_ha).toFixed(1)} kg no total).</div>`;
  } else {
    html += `<div class="callout ok">Demanda de enxofre plenamente atendida pelas fontes principais.</div>`;
  }
  html += `</div>`;

  // Card Resumo Total
  html += `<div class="card"><h2>Resumo de Compras para ${area} ha</h2>
    <div class="table-responsive"><table>
      <tr><th>Insumo</th><th class="num">Total (kg)</th><th class="num">Sacos (50 kg)</th></tr>
      ${NC > 0 ? `<tr><td>Calcário</td><td class="num">${(area_mult(NC) * 1000).toFixed(0)}</td><td class="num">— (a granel)</td></tr>` : ''}
      <tr><td>${pf.nome}</td><td class="num">${area_mult(pAmount_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(pAmount_ha)).toFixed(1)}</td></tr>
      <tr><td>${kf.nome}</td><td class="num">${area_mult(kAmount_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(kAmount_ha)).toFixed(1)}</td></tr>
      ${nAmount_ha > 0.05 ? `<tr><td>${nf.nome}</td><td class="num">${area_mult(nAmount_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(nAmount_ha)).toFixed(1)}</td></tr>` : ''}
      ${gessoAmountReal_ha > 0.05 ? `<tr><td>Gesso Agrícola</td><td class="num">${area_mult(gessoAmountReal_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(gessoAmountReal_ha)).toFixed(1)}</td></tr>` : ''}
      ${mgAmount_ha > 0.05 ? `<tr><td>${mgf.nome}</td><td class="num">${area_mult(mgAmount_ha).toFixed(1)}</td><td class="num">${sacos(area_mult(mgAmount_ha)).toFixed(1)}</td></tr>` : ''}
    </table></div></div>`;

  resultadoEl.innerHTML = html;
}

/* --------------------------------------------------------------------------
   FORMULÁRIO DE CONTATO — contato.html
   Sem backend: monta um link "mailto:" com os dados preenchidos e deixa
   o aplicativo de e-mail do usuário cuidar do envio.
   -------------------------------------------------------------------------- */
const EMAIL_DESTINO = 'contato@agricalc.com.br';

function configurarFormularioContato() {
  const form = document.getElementById('formContato');
  if (!form) return; // só existe em contato.html

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('ctNome').value.trim();
    const email = document.getElementById('ctEmail').value.trim();
    const assunto = document.getElementById('ctAssunto').value;
    const mensagem = document.getElementById('ctMensagem').value.trim();

    const corpo = `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`;
    const link = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent('[AgriCalc] ' + assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = link;
  });
}

/* --------------------------------------------------------------------------
   FORMULÁRIO DE COLABORAÇÃO — colaborar.html
   Mesma lógica do formulário de contato, com campos específicos para
   sugestão de novas calculadoras.
   -------------------------------------------------------------------------- */
function configurarFormularioColaboracao() {
  const form = document.getElementById('formColabora');
  if (!form) return; // só existe em colaborar.html

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('colNome').value.trim();
    const email = document.getElementById('colEmail').value.trim();
    const ferramenta = document.getElementById('colFerramenta').value.trim();
    const descricao = document.getElementById('colDescricao').value.trim();
    const fonte = document.getElementById('colFonte').value.trim();

    const corpo = `Nome: ${nome}\nE-mail: ${email}\nFerramenta sugerida: ${ferramenta}\n\nDescrição:\n${descricao}\n\nFonte técnica: ${fonte || 'Não informado'}`;
    const link = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent('[AgriCalc] Sugestão de ferramenta: ' + ferramenta)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = link;
  });
}

/* --------------------------------------------------------------------------
   INICIALIZAÇÃO
   Roda depois que o DOM está pronto, e cada função já se protege caso os
   elementos daquela página não existam — então é seguro rodar sempre.
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Página de adubação: liga os selects de fonte à atualização de composição
  ['fonteP', 'fonteK', 'fonteN', 'fonteMg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', atualizarComposicoes);
  });

  atualizarNiveis();
  carregarCultura();
  atualizarComposicoes();

  configurarFormularioContato();
  configurarFormularioColaboracao();
});