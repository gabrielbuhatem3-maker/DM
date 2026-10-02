(function () {
  'use strict';

  /* ---------- Modo claro / escuro ---------- */
  var raiz = document.documentElement;
  var tg = document.getElementById('tema-tg');
  var tgLabel = tg && tg.querySelector('.tg-l');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function aplicarTema(escuro) {
    raiz.className = escuro ? 'escuro' : 'claro';
    if (tg) tg.setAttribute('aria-pressed', String(escuro));
    // O alternador mostra o nome do modo para o qual leva.
    if (tgLabel) tgLabel.textContent = escuro ? 'Modo claro' : 'Modo escuro';
    if (themeMeta) themeMeta.setAttribute('content', escuro ? '#0D151A' : '#FAFAF8');
  }

  aplicarTema(raiz.className === 'escuro');

  if (tg) {
    tg.addEventListener('click', function () {
      var escuro = raiz.className !== 'escuro';
      aplicarTema(escuro);
      try { localStorage.setItem('tema', escuro ? 'escuro' : 'claro'); } catch (e) {}
    });
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

  // Conta grande em x=24; dez contas pequenas a partir de x=96, a cada 60.
  function desenharContas(p) {
    while (contasG.firstChild) contasG.removeChild(contasG.firstChild);
    var atual = p.f === 'dezena' ? p.c : (p.f === 'inicio' ? -1 : 11);
    for (var k = 0; k <= 10; k++) {
      var cx = k === 0 ? 24 : 96 + (k - 1) * 60;
      var r = k === 0 ? 11 : 7;
      var cls = k < atual ? 'b-past' : (k === atual ? 'b-now' : 'b-next');
      contasG.appendChild(circulo(cx, r, cls));
      if (k === atual) contasG.appendChild(circulo(cx, k === 0 ? 17 : 13, 'b-anel'));
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

  mostrar();
})();
