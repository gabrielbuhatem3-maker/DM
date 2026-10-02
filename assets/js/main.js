(function () {
  'use strict';

  /* ---------- Modo claro / escuro ---------- */
  var raiz = document.documentElement;
  var tg = document.getElementById('tema-tg');
  var tgLabel = tg && tg.querySelector('.tg-l');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function aplicarTema(escuro) {
    raiz.classList.toggle('escuro', escuro);
    raiz.classList.toggle('claro', !escuro);
    if (tg) tg.setAttribute('aria-pressed', String(escuro));
    // O alternador mostra o nome do modo para o qual leva.
    if (tgLabel) tgLabel.textContent = escuro ? 'Modo claro' : 'Modo escuro';
    if (themeMeta) themeMeta.setAttribute('content', escuro ? '#0D151A' : '#FAFAF8');
  }

  aplicarTema(raiz.classList.contains('escuro'));

  if (tg) {
    tg.addEventListener('click', function () {
      var escuro = !raiz.classList.contains('escuro');
      aplicarTema(escuro);
      try { localStorage.setItem('tema', escuro ? 'escuro' : 'claro'); } catch (e) {}
    });
  }

  /* ---------- Abertura: uma vez por visita, pode ser pulada ---------- */
  // "pronto" libera a entrada da abertura da página inicial.
  var pronto = function () { raiz.classList.add('pronto'); };
  var abertura = document.querySelector('.abertura');
  if (!abertura || raiz.classList.contains('sem-abertura')) {
    if (abertura) abertura.remove();
    requestAnimationFrame(pronto);
  } else {
    try { sessionStorage.setItem('abertura', '1'); } catch (e) {}
    var esperaPronto = setTimeout(pronto, 1350);
    var pular = function () { abertura.classList.add('sai'); clearTimeout(esperaPronto); pronto(); };
    abertura.addEventListener('click', pular);
    document.addEventListener('keydown', pular, { once: true });
    abertura.addEventListener('animationend', function (e) {
      if (e.target === abertura) abertura.remove();
    });
  }

  /* ---------- Elementos que surgem ao descer a página ---------- */
  var podeMover = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (podeMover && 'IntersectionObserver' in window) {
    var seletor = [
      '.tit-texto > *', '.tit .dados > div', '.lateral-fixa > *', '.prose > *',
      '.terco-texto > *', '.foto-terco', '.passos-col > .h2', '.etapa',
      '.rezar-col > *', '.sobre-col > .h2', '.citacao', '.topicos > details',
      '.conclusao > *', '.pn'
    ].join(',');
    var alvos = Array.prototype.filter.call(document.querySelectorAll(seletor), function (el) {
      return !el.closest('.heroi') && !el.classList.contains('topicos');
    });
    alvos.forEach(function (el) {
      // Imagens se revelam como um véu; o resto sobe de leve.
      el.classList.add(el.tagName === 'FIGURE' && el.classList.contains('retrato') ? 'revela-veu' : 'revela');
    });
    raiz.classList.add('js-revela');
    var observador = new IntersectionObserver(function (entradas) {
      var visiveis = entradas.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      visiveis.forEach(function (e, i) {
        // Vizinhos que entram juntos surgem em cascata curta.
        e.target.style.setProperty('--atraso', Math.min(i, 5) * 0.09 + 's');
        e.target.classList.add('visivel');
        observador.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach(function (el) { observador.observe(el); });
  }

  /* ---------- Menu do celular ---------- */
  var menu = document.querySelector('.menu-m');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.menu-panel a')) menu.removeAttribute('open');
    });
    document.addEventListener('click', function (e) {
      if (menu.hasAttribute('open') && !menu.contains(e.target)) menu.removeAttribute('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.hasAttribute('open')) {
        menu.removeAttribute('open');
        menu.querySelector('summary').focus();
      }
    });
  }

  /* ---------- Leitura em tópicos: abrir ou fechar todos ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.abrir-todos'), function (bt) {
    var lista = bt.parentNode.nextElementSibling;
    if (!lista) return;
    var itens = lista.querySelectorAll('details');
    var tAbrir = bt.textContent;
    var tFechar = bt.getAttribute('data-fechar') || 'Fechar todos';
    function atualizar() {
      var todos = Array.prototype.every.call(itens, function (d) { return d.open; });
      bt.textContent = todos ? tFechar : tAbrir;
      bt.setAttribute('aria-expanded', String(todos));
    }
    bt.addEventListener('click', function () {
      var abrir = bt.getAttribute('aria-expanded') !== 'true';
      Array.prototype.forEach.call(itens, function (d) { d.open = abrir; });
      atualizar();
    });
    Array.prototype.forEach.call(itens, function (d) { d.addEventListener('toggle', atualizar); });
  });

  /* ---------- Rezar o Terço, conta por conta ---------- */
  var rezador = document.getElementById('rezador');
  if (!rezador) return;

  var T = {
    sinal: 'Em nome do Pai, do Filho e do Espírito Santo. Amém.',
    abertura: 'Tu expiraste, Jesus, mas a Fonte de Vida jorrou para as almas e o oceano de Misericórdia abriu-se para o mundo inteiro. Ó Fonte de Vida, insondável Misericórdia Divina, envolve o mundo inteiro e derrama-Te sobre nós.',
    sangue: 'Ó Sangue e Água, que jorraste do Coração de Jesus como Fonte de Misericórdia para nós, eu confio em Vós.',
    paiNosso: 'Pai-Nosso que estais no Céu, santificado seja o Vosso nome, venha a nós o Vosso reino, seja feita a Vossa vontade assim na Terra como no Céu. O pão nosso de cada dia nos dai hoje, perdoai-nos as nossas ofensas assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.',
    aveMaria: 'Ave-Maria, cheia de graça, o Senhor é convosco. Bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.',
    creio: 'Creio em Deus Pai Todo-Poderoso, Criador do Céu e da Terra. E em Jesus Cristo, Seu único Filho, Nosso Senhor, que foi concebido pelo poder do Espírito Santo, nasceu da Virgem Maria, padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado, desceu à mansão dos mortos, ressuscitou ao terceiro dia, subiu aos Céus, está sentado à direita de Deus Pai Todo-Poderoso, de onde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo, na Santa Igreja Católica, na comunhão dos Santos, na remissão dos pecados, na ressurreição da carne e na vida eterna. Amém.',
    eterno: 'Eterno Pai, eu Vos ofereço o Corpo e Sangue, Alma e Divindade de Vosso diletíssimo Filho, Nosso Senhor Jesus Cristo, em expiação dos nossos pecados e do mundo inteiro.',
    paixao: 'Pela Sua dolorosa Paixão, tende misericórdia de nós e do mundo inteiro.',
    santo: 'Deus Santo, Deus Forte, Deus Imortal, tende piedade de nós e do mundo inteiro.',
    final: 'Deus Eterno, em quem a Misericórdia é infinita e o tesouro da compaixão é inesgotável, olhai propício para nós e aumentai em nós a Vossa Misericórdia, para que nos momentos difíceis não nos desesperemos nem desanimemos, mas nos submetamos com grande confiança à Vossa santa vontade, que é o Amor e a própria Misericórdia. Amém.'
  };

  // Cada passo: rótulo, texto, fase ('inicio' | 'dezena' | 'fim') e,
  // nas dezenas, a conta atual (0 = conta grande, 1 a 10 = contas pequenas).
  var passos = [
    { l: 'Início · Sinal da cruz', t: T.sinal, f: 'inicio' },
    { l: 'Início · Oração de abertura', t: T.abertura, f: 'inicio' },
    { l: 'Início · Ó Sangue e Água, 1 de 3', t: T.sangue, f: 'inicio' },
    { l: 'Início · Ó Sangue e Água, 2 de 3', t: T.sangue, f: 'inicio' },
    { l: 'Início · Ó Sangue e Água, 3 de 3', t: T.sangue, f: 'inicio' },
    { l: 'Primeiras contas · Pai-Nosso', t: T.paiNosso, f: 'inicio' },
    { l: 'Primeiras contas · Ave-Maria', t: T.aveMaria, f: 'inicio' },
    { l: 'Primeiras contas · Creio', t: T.creio, f: 'inicio' }
  ];
  for (var d = 1; d <= 5; d++) {
    passos.push({ l: 'Dezena ' + d + ' de 5 · Conta grande', t: T.eterno, f: 'dezena', c: 0 });
    for (var c = 1; c <= 10; c++) {
      passos.push({ l: 'Dezena ' + d + ' de 5 · Conta pequena, ' + c + ' de 10', t: T.paixao, f: 'dezena', c: c });
    }
  }
  passos.push(
    { l: 'Encerramento · Deus Santo, 1 de 3', t: T.santo, f: 'fim' },
    { l: 'Encerramento · Deus Santo, 2 de 3', t: T.santo, f: 'fim' },
    { l: 'Encerramento · Deus Santo, 3 de 3', t: T.santo, f: 'fim' },
    { l: 'Encerramento · Oração final', t: T.final, f: 'fim' },
    { l: 'Terço concluído', t: 'Jesus, eu confio em Vós.', f: 'fim', ultimo: true }
  );

  var label = document.getElementById('rz-label');
  var oracao = document.getElementById('rz-oracao');
  var prox = document.getElementById('rz-prox');
  var volta = document.getElementById('rz-volta');
  var contasG = document.getElementById('contas-g');
  var contasSvg = rezador.querySelector('.contas');
  var SVG = 'http://www.w3.org/2000/svg';
  var i = 0;

  function circulo(cx, r, cls) {
    var el = document.createElementNS(SVG, 'circle');
    el.setAttribute('cx', cx);
    el.setAttribute('cy', 22);
    el.setAttribute('r', r);
    el.setAttribute('class', cls);
    return el;
  }

  // As contas são desenhadas na largura real do quadro, para não encolherem
  // no celular: conta grande à esquerda e dez pequenas igualmente espaçadas.
  var fio = document.getElementById('contas-fio');
  function desenharContas(p) {
    var w = Math.max(Math.round(contasSvg.getBoundingClientRect().width), 240);
    var pad = 18;
    var passo = (w - pad * 2) / 10;
    contasSvg.setAttribute('viewBox', '0 0 ' + w + ' 44');
    fio.setAttribute('x2', w - pad);
    while (contasG.firstChild) contasG.removeChild(contasG.firstChild);
    var atual = p.f === 'dezena' ? p.c : (p.f === 'inicio' ? -1 : 11);
    for (var k = 0; k <= 10; k++) {
      var cx = pad + k * passo;
      var r = k === 0 ? 11 : 7;
      var cls = k < atual ? 'b-past' : (k === atual ? 'b-now' : 'b-next');
      contasG.appendChild(circulo(cx, r, cls));
      if (k === atual) contasG.appendChild(circulo(cx, k === 0 ? 16 : 12, 'b-anel'));
    }
    var desc;
    if (p.f === 'dezena') desc = p.c === 0 ? 'Conta grande da dezena' : 'Conta pequena ' + p.c + ' de 10';
    else desc = p.f === 'inicio' ? 'Antes das dezenas' : 'Depois das dezenas';
    contasSvg.setAttribute('aria-label', desc);
  }

  function mostrar() {
    var p = passos[i];
    label.textContent = p.l;
    oracao.textContent = p.t;
    // Reinicia a entrada suave do texto a cada conta.
    oracao.classList.remove('entra');
    void oracao.offsetWidth;
    oracao.classList.add('entra');
    oracao.classList.toggle('longa', p.t.length > 200);
    desenharContas(p);
    volta.disabled = i === 0;
    prox.textContent = p.ultimo ? 'Rezar de novo' : 'Próxima conta';
  }

  function avancar() {
    i = passos[i].ultimo ? 0 : i + 1;
    mostrar();
  }

  function voltar() {
    if (i > 0) { i -= 1; mostrar(); }
  }

  prox.addEventListener('click', avancar);
  volta.addEventListener('click', voltar);
  rezador.addEventListener('keydown', function (e) {
    if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); avancar(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); voltar(); }
  });

  var redesenho;
  window.addEventListener('resize', function () {
    clearTimeout(redesenho);
    redesenho = setTimeout(function () { desenharContas(passos[i]); }, 120);
  });

  mostrar();
})();
