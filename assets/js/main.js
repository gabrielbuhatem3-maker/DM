(function () {
  'use strict';

  var raiz = document.documentElement;
  var podeMover = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Carregamento ----------
     Primeira visita: baixa o site inteiro (as 4 páginas, estilo, script,
     fontes e fotos) e guarda no aparelho, mostrando o progresso real.
     Depois disso a navegação é instantânea e funciona até sem internet.
     Visitas seguintes: tudo já está no aparelho; a tela só aparece se
     algo demorar mais de 0,4 s. */
  var VERSAO = /*VERSAO*/'dm-347979b59c'/*FIM*/;
  var LISTA = /*LISTA*/[["assets/css/style.css",49887],["assets/js/main.js",49262],["assets/fonts/brygada-1918-latin.woff2",22716],["assets/fonts/brygada-1918-italic-latin.woff2",23856],["assets/fonts/brygada-1918-polones.woff2",3492],["assets/fonts/brygada-1918-italic-polones.woff2",3816],["assets/img/jesus-misericordioso.webp",30938],["index.html",27978],["imagem.html",14633],["promessas.html",16137],["lembrete.html",10437],["assets/img/santa-faustina.webp",15842],["assets/img/terco-devocionario.avif",69065],["assets/img/marca.svg",656]]/*FIM*/;
  var cg = document.querySelector('.carregador');

  if (cg && raiz.classList.contains('baixando-site')) {
    var raiosB = cg.querySelectorAll('.cg-raio');
    var pct = cg.querySelector('.cg-pct');
    var entrar = cg.querySelector('.cg-entrar');
    var desenhar = function (v) {
      Array.prototype.forEach.call(raiosB, function (p, k) {
        var atraso = Math.abs(k - 2.5) * 0.04;
        p.style.strokeDashoffset = String(Math.max(0, 1 - Math.min(1, v * 1.08 - atraso + 0.06)));
      });
      if (pct) pct.textContent = Math.round(v * 100) + '%';
    };
    var fechou = false;
    var fechar = function () {
      if (fechou) return;
      fechou = true;
      cg.classList.add('sai');
      raiz.classList.remove('carregando', 'baixando-site');
      setTimeout(function () { cg.remove(); }, 800);
    };
    var total = LISTA.reduce(function (s, x) { return s + x[1]; }, 0) || 1;
    var recebido = 0;
    var somar = function (n) { recebido += n; desenhar(Math.min(0.99, recebido / total)); };

    // Baixa um arquivo contando os bytes que chegam e guarda no aparelho
    var baixar = function (cache, item) {
      var url = item[0], tamanho = item[1], contado = 0;
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        if (!r.body || !r.body.getReader) {
          return r.clone().arrayBuffer().then(function () { somar(tamanho); contado = tamanho; return r; });
        }
        var leitor = r.body.getReader(), partes = [];
        var ler = function () {
          return leitor.read().then(function (p) {
            if (p.done) return;
            partes.push(p.value);
            var n = Math.min(p.value.length, tamanho - contado);
            if (n > 0) { contado += n; somar(n); }
            return ler();
          });
        };
        return ler().then(function () {
          return new Response(new Blob(partes, { type: r.headers.get('content-type') || '' }), { status: 200, headers: r.headers });
        });
      }).then(function (resp) {
        if (contado < tamanho) somar(tamanho - contado);
        if (cache) return cache.put(url, resp);
      }).catch(function () { if (contado < tamanho) somar(tamanho - contado); });
    };

    var abrirCache = ('caches' in window) ? caches.open(VERSAO).catch(function () { return null; }) : Promise.resolve(null);
    abrirCache.then(function (cache) {
      // Quatro downloads ao mesmo tempo, na ordem em que o site vai precisar
      var fila = LISTA.slice(), ativos = [];
      var proximo = function () {
        if (!fila.length) return Promise.resolve();
        return baixar(cache, fila.shift()).then(proximo);
      };
      for (var n = 0; n < 4; n++) ativos.push(proximo());
      return Promise.all(ativos);
    }).then(function () {
      var fontes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      return fontes;
    }).then(function () {
      try { localStorage.setItem('site-guardado', VERSAO); } catch (e) {}
      desenhar(1);
      setTimeout(fechar, 350);
    });

    // Quem não quiser esperar entra antes; o download continua por trás
    setTimeout(function () { if (entrar && !fechou) entrar.hidden = false; }, 2500);
    if (entrar) entrar.addEventListener('click', fechar);
    setTimeout(fechar, 25000);
  } else if (cg && raiz.classList.contains('carregando')) {
    var cgRaios = cg.querySelectorAll('.cg-raio');
    var progresso = function (v) {
      Array.prototype.forEach.call(cgRaios, function (p, k) {
        var atraso = Math.abs(k - 2.5) * 0.04;
        p.style.strokeDashoffset = String(Math.max(0, 1 - Math.min(1, v - atraso + 0.1)));
      });
    };
    var saiu = false, inicio = Date.now();
    var sair = function (ja) {
      if (saiu) return;
      saiu = true;
      var visivel = parseFloat(getComputedStyle(cg).opacity) > 0.05;
      if (visivel) progresso(1.2);
      var tirar = function () {
        cg.classList.add('sai');
        raiz.classList.remove('carregando');
        setTimeout(function () { cg.remove(); }, 800);
      };
      // Se a tela chegou a aparecer, os raios completam antes de sair (0,3 s)
      if (ja || !visivel) tirar(); else setTimeout(tirar, 300);
    };
    requestAnimationFrame(function () { progresso(0.15); });

    var tarefas = [];
    if (document.fonts && document.fonts.load) {
      tarefas.push(document.fonts.load('400 1em "Brygada 1918"'));
      tarefas.push(document.fonts.load('italic 400 1em "Brygada 1918"'));
    }
    // Imagens que aparecem na primeira tela
    Array.prototype.forEach.call(document.querySelectorAll('main img'), function (img) {
      var r = img.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0 && img.decode) tarefas.push(img.decode());
    });
    var feitas = 0;
    tarefas.forEach(function (tf) {
      tf.then(null, function () {}).then(function () {
        feitas += 1;
        progresso(0.15 + 0.75 * feitas / tarefas.length);
      });
    });
    Promise.all(tarefas.map(function (tf) { return tf.then(null, function () {}); })).then(function () { sair(false); });
    setTimeout(function () { sair(true); }, 6000);
    cg.addEventListener('click', function () { sair(true); });
    document.addEventListener('keydown', function () { sair(true); }, { once: true });
  } else if (cg) {
    cg.remove();
  }

  /* ---------- Site guardado no aparelho (service worker) ----------
     Registrado depois que a página termina de carregar, para não
     disputar a conexão com o que está na tela. */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ---------- Tópicos: no celular os textos abrem ao toque ---------- */
  var mqTopicos = window.matchMedia('(max-width: 900px)');
  var topicos = Array.prototype.slice.call(document.querySelectorAll('details.topico'));
  var modoTopicos = function (inicial) {
    var movel = mqTopicos.matches;
    var vistos = [];
    // Mudanças feitas pelo site (não pela pessoa) acontecem sem animação:
    // abrir e fechar animado no meio da rolagem empurrava a página.
    raiz.classList.add('sem-transicao');
    requestAnimationFrame(function () { requestAnimationFrame(function () { raiz.classList.remove('sem-transicao'); }); });
    topicos.forEach(function (d) {
      var s = d.querySelector('summary');
      s.tabIndex = movel ? 0 : -1;
      if (!movel) { d.open = true; return; }
      if (!inicial) return;   // ao girar a tela ou mudar o zoom, mantém o que a pessoa abriu
      // No celular, só o primeiro de cada lista começa aberto.
      var grupo = d.closest('.anos, .promessas, .elementos');
      var primeiro = vistos.indexOf(grupo) === -1;
      if (primeiro) vistos.push(grupo);
      d.open = primeiro;
    });
  };
  if (topicos.length) {
    modoTopicos(true);
    if (mqTopicos.addEventListener) mqTopicos.addEventListener('change', function () { modoTopicos(false); });
    topicos.forEach(function (d) {
      // No computador o texto fica sempre aberto: o título não fecha nada.
      d.querySelector('summary').addEventListener('click', function (e) {
        if (!mqTopicos.matches) e.preventDefault();
      });
    });
    // O ano, ao lado do título, também abre o capítulo.
    Array.prototype.forEach.call(document.querySelectorAll('.ano-n'), function (n) {
      n.addEventListener('click', function () {
        var d = n.parentNode.querySelector('details.topico');
        if (d && mqTopicos.matches) d.open = !d.open;
      });
    });
  }

  /* ---------- Celular: textos longos recolhidos com “+” ----------
     Só no celular; no computador tudo fica aberto, como sempre.
     - Etapas do passo a passo e “Antes de começar”: o título abre o texto.
     - “Sobre o site” e “A visão de Płock”: os primeiros parágrafos ficam
       à vista e o resto abre em “Continuar a leitura”. */
  var mqRecolher = window.matchMedia('(max-width: 900px)');
  var cabecas = [];   // {cab, corpo, aberto}
  var continuas = []; // {botao, itens}
  var sinal = function () { var s = document.createElement('span'); s.className = 'sinal'; s.setAttribute('aria-hidden', 'true'); return s; };
  var alternar = function (item, abrir) {
    item.aberto = abrir;
    var movel = mqRecolher.matches;
    var alvos = item.corpo ? [item.corpo] : item.itens;
    alvos.forEach(function (el) {
      el.classList.toggle('recolhido', movel && !abrir);
      if (abrir && movel && podeMover) { el.classList.remove('abrindo'); void el.offsetWidth; el.classList.add('abrindo'); }
    });
    var alvo = item.cab || item.botao;
    if (movel) alvo.setAttribute('aria-expanded', String(abrir)); else alvo.removeAttribute('aria-expanded');
    if (item.botao) item.botao.firstChild.textContent = abrir ? 'Recolher' : 'Continuar a leitura';
  };
  Array.prototype.forEach.call(document.querySelectorAll('.etapa'), function (et, k) {
    var cab = et.querySelector('.etapa-cab'), corpo = et.querySelector('.etapa-corpo');
    if (cab && corpo) cabecas.push({ cab: cab, corpo: corpo, inicial: k === 0 });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-recolhe]'), function (h) {
    if (h.nextElementSibling) cabecas.push({ cab: h, corpo: h.nextElementSibling, inicial: false });
  });
  cabecas.forEach(function (item) {
    item.cab.classList.add('recolhe-cab');
    item.cab.appendChild(sinal());
    var ir = function () { if (mqRecolher.matches) alternar(item, !item.aberto); };
    item.cab.addEventListener('click', ir);
    item.cab.addEventListener('keydown', function (e) {
      if (mqRecolher.matches && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ir(); }
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-continua]'), function (box) {
    var n = +box.getAttribute('data-continua') || 1;
    var filhos = Array.prototype.slice.call(box.children);
    if (filhos.length <= n) return;
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'continuar';
    botao.appendChild(document.createTextNode('Continuar a leitura'));
    botao.appendChild(sinal());
    box.insertBefore(botao, filhos[n]);
    var item = { botao: botao, itens: filhos.slice(n), inicial: false };
    botao.addEventListener('click', function () { alternar(item, !item.aberto); });
    continuas.push(item);
  });
  var aplicarRecolher = function () {
    var movel = mqRecolher.matches;
    cabecas.forEach(function (item) {
      item.cab.tabIndex = movel ? 0 : -1;
      if (movel) item.cab.setAttribute('role', 'button'); else item.cab.removeAttribute('role');
      alternar(item, movel ? item.inicial : true);
    });
    continuas.forEach(function (item) { alternar(item, !movel); });
  };
  aplicarRecolher();
  if (mqRecolher.addEventListener) mqRecolher.addEventListener('change', aplicarRecolher);

  /* ---------- Modo claro / escuro ---------- */
  var tg = document.getElementById('tema-tg');
  var tgLabel = tg && tg.querySelector('.sr');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var corClaro = themeMeta ? themeMeta.getAttribute('content') : '#F5F6F3';

  function aplicarTema(escuro) {
    raiz.classList.toggle('escuro', escuro);
    raiz.classList.toggle('claro', !escuro);
    if (!tg) return;
    tg.setAttribute('aria-pressed', String(escuro));
    // O botão diz para qual modo leva.
    var nome = escuro ? 'Modo claro' : 'Modo escuro';
    tg.title = nome;
    if (tgLabel) tgLabel.textContent = nome;
    if (themeMeta && corClaro !== '#080A0A') themeMeta.setAttribute('content', escuro ? '#0E1315' : corClaro);
  }
  aplicarTema(raiz.classList.contains('escuro'));
  if (tg) {
    tg.addEventListener('click', function () {
      var escuro = !raiz.classList.contains('escuro');
      aplicarTema(escuro);
      try { localStorage.setItem('tema', escuro ? 'escuro' : 'claro'); } catch (e) {}
    });
  }

  /* ---------- Menu do celular, em tela cheia ---------- */
  var menu = document.querySelector('.menu-m');
  if (menu) {
    var abreMenu = menu.querySelector('summary');
    var fechaMenu = function () { menu.removeAttribute('open'); abreMenu.focus(); };
    menu.addEventListener('toggle', function () {
      raiz.classList.toggle('menu-aberto', menu.open);
      if (menu.open) {
        var primeiro = menu.querySelector('.menu-links a');
        if (primeiro) primeiro.focus();
      }
    });
    menu.querySelector('.menu-fecha').addEventListener('click', fechaMenu);
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.menu-links a')) menu.removeAttribute('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) fechaMenu();
    });
  }

  /* ---------- Conteúdo que surge ao descer a página ---------- */
  if (podeMover && 'IntersectionObserver' in window) {
    var imagens = '.retrato, .foto-terco';
    var celular = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    var seletor = (celular ? [
      // Celular: cada bloco surge inteiro, de uma vez, antes de entrar na tela.
      // (Surgir peça por peça deixava linhas e “+” vazios enquanto o texto vinha atrás.)
      '.vida-lado > .h2', '.retrato', '.dados', '.ano',
      '.terco-intro > div', '.foto-terco', '.passos > .h2', '.etapa',
      '.rezar-cab', '.rezador', '.sobre',
      '.titulo', '.leitura', '.anotada-cab', '.elemento',
      '.promessa', '.fecho-in', '.opcao', '.seguir'
    ] : [
      // Início
      '.vida-lado > .h2', '.retrato', '.dados', '.ano-n', '.ano .h3', '.ano .texto > p',
      '.terco-intro > div > *', '.foto-terco', '.passos > .h2', '.etapa',
      '.rezar-cab > *', '.terco-svg', '.rz-col', '.sobre > .h2', '.sobre .texto > p', '.sobre .cit',
      // A Imagem
      '.titulo > *', '.leitura > .h2', '.leitura .texto > *', '.anotada-cab > *', '.painel', '.elemento',
      // Promessas
      '.promessa', '.fecho-in > *',
      // Todas
      '.seguir a'
    ]).join(',');
    var alvos = document.querySelectorAll(seletor);
    Array.prototype.forEach.call(alvos, function (el) {
      el.classList.add(el.matches(imagens) ? 'rv-img' : 'rv');
    });
    raiz.classList.add('js-revela');

    var revelar = new IntersectionObserver(function (entradas) {
      var visiveis = entradas.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      visiveis.forEach(function (e, k) {
        var el = e.target;
        // Vizinhos que entram juntos surgem em cascata curta.
        el.style.transitionDelay = (celular ? Math.min(k, 2) * 50 : Math.min(k, 6) * 90) + 'ms';
        el.classList.add('in');
        revelar.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ''; }, 2000);
      });
    }, {
      // No celular o conteúdo começa a surgir um pouco antes de entrar na tela,
      // para nunca aparecer espaço vazio durante a rolagem rápida.
      rootMargin: celular ? '0px 0px 20% 0px' : '0px 0px -8% 0px',
      threshold: 0
    });
    Array.prototype.forEach.call(alvos, function (el) { revelar.observe(el); });

    // Ao imprimir, tudo aparece.
    window.addEventListener('beforeprint', function () {
      Array.prototype.forEach.call(alvos, function (el) { el.classList.add('in'); });
    });
  }

  /* ---------- Hora da Misericórdia, no horário de quem lê ---------- */
  var hora = document.getElementById('hora');
  if (hora) {
    var atualizarHora = function () {
      var d = new Date();
      var h = d.getHours(), m = d.getMinutes();
      var html;
      raiz.classList.toggle('hora-15', h === 15);
      if (h === 15) {
        hora.classList.add('agora');
        html = '<strong>Agora é a Hora da Misericórdia.</strong><br>Ela vai até as 16h.<br><a class="lnk" href="#rezar">Rezar o Terço agora</a>';
      } else {
        hora.classList.remove('agora');
        if (h < 15) {
          var falta = (15 * 60) - (h * 60 + m);
          var fh = Math.floor(falta / 60), fm = falta % 60;
          var partes = [];
          if (fh) partes.push(fh + (fh === 1 ? ' hora' : ' horas'));
          if (fm) partes.push(fm + (fm === 1 ? ' minuto' : ' minutos'));
          html = '<strong>Hora da Misericórdia, hoje às 15h.</strong><br>Faltam ' + partes.join(' e ') + '.<br><a class="lnk" href="lembrete.html">Receber um aviso todo dia</a>';
        } else {
          html = '<strong>Hora da Misericórdia, amanhã às 15h.</strong><br>A hora em que Jesus morreu na cruz.<br><a class="lnk" href="lembrete.html">Receber um aviso todo dia</a>';
        }
      }
      hora.innerHTML = html;
      hora.hidden = false;
    };
    atualizarHora();
    setInterval(atualizarHora, 30000);
  }

  /* ---------- A Imagem: o detalhe em foco ---------- */
  var painel = document.getElementById('painel');
  if (painel) {
    var veu = painel.querySelector('.veu');
    var elementos = Array.prototype.slice.call(document.querySelectorAll('.elemento'));
    var pontos = Array.prototype.slice.call(painel.querySelectorAll('.ponto'));
    var atual = null;

    var focar = function (alvo) {
      if (alvo === atual) return;
      atual = alvo;
      if (!alvo) { painel.removeAttribute('data-foco'); }
      else {
        painel.setAttribute('data-foco', alvo);
        var el = document.getElementById('el-' + alvo);
        if (el && el.dataset.x) {
          veu.style.setProperty('--x', el.dataset.x);
          veu.style.setProperty('--y', el.dataset.y);
          veu.style.setProperty('--rx', el.dataset.rx);
          veu.style.setProperty('--ry', el.dataset.ry);
        }
      }
      elementos.forEach(function (e) { e.classList.toggle('ativo', e.dataset.alvo === alvo); });
      pontos.forEach(function (p) { p.classList.toggle('ativo', p.dataset.alvo === alvo); });
    };

    var irPara = function (alvo) {
      var el = document.getElementById('el-' + alvo);
      var d = el && el.querySelector('details');
      if (d) d.open = true;
      focar(alvo);
      if (el) el.scrollIntoView({ behavior: podeMover ? 'smooth' : 'auto', block: 'center' });
    };

    pontos.forEach(function (p) {
      p.addEventListener('click', function () { irPara(p.dataset.alvo); });
    });
    painel.querySelector('.painel-inscricao').addEventListener('click', function () { irPara('inscricao'); });

    elementos.forEach(function (el) {
      el.addEventListener('mouseenter', function () { focar(el.dataset.alvo); });
      el.addEventListener('focusin', function () { focar(el.dataset.alvo); });
      el.querySelector('summary').addEventListener('click', function () { focar(el.dataset.alvo); });
    });

    // Ao ler, o detalhe da vez acende na pintura.
    // No computador, o detalhe acende sozinho conforme a leitura. No celular,
    // só ao tocar: acender durante a rolagem redesenhava a pintura e travava.
    if ('IntersectionObserver' in window && window.matchMedia('(min-width: 901px) and (pointer: fine)').matches) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { if (e.isIntersecting) focar(e.target.dataset.alvo); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      elementos.forEach(function (el) { obs.observe(el); });
      // Fora da seção, a pintura volta inteira.
      var sec = painel.closest('section');
      new IntersectionObserver(function (e) { if (!e[0].isIntersecting) focar(null); }, { threshold: 0 }).observe(sec);
    }
  }

  /* ---------- Promessas: copiar para enviar a alguém ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.pr-copiar'), function (bt) {
    var item = bt.closest('.promessa');
    var cit = item.querySelector('.pr-cit');
    var ref = item.querySelector('.pr-ref span:last-child').textContent;
    var rotulo = bt.textContent;
    var espera;
    bt.addEventListener('click', function () {
      var texto = cit.textContent.trim() + ' (Diário, ' + ref + ')';
      var pronto = function () {
        bt.textContent = 'Promessa copiada';
        bt.classList.add('feito');
        clearTimeout(espera);
        espera = setTimeout(function () { bt.textContent = rotulo; bt.classList.remove('feito'); }, 2400);
      };
      var selecionar = function () {
        // Sem acesso à área de transferência: deixa o texto selecionado para copiar à mão.
        var r = document.createRange(); r.selectNodeContents(cit);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        bt.textContent = 'Texto selecionado para copiar';
      };
      try {
        navigator.clipboard.writeText(texto).then(pronto, selecionar);
      } catch (e) { selecionar(); }
    });
  });

  /* ---------- Lembrete: 15h no fuso de quem lê ---------- */
  var lbFuso = document.getElementById('lb-fuso');
  if (lbFuso) {
    var fusoLocal = 'America/Sao_Paulo';
    try { fusoLocal = Intl.DateTimeFormat().resolvedOptions().timeZone || fusoLocal; } catch (e) {}
    var fusos = [];
    try { fusos = Intl.supportedValuesOf('timeZone'); } catch (e) {}
    if (fusos.indexOf(fusoLocal) === -1) fusos.unshift(fusoLocal);

    // Horas e minutos de agora num fuso qualquer
    var horaEm = function (fuso, data) {
      var partes = new Intl.DateTimeFormat('en-GB', { timeZone: fuso, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(data || new Date());
      var h = 0, m = 0;
      partes.forEach(function (p) { if (p.type === 'hour') h = +p.value; if (p.type === 'minute') m = +p.value; });
      return [h, m];
    };
    var deslocamento = function (fuso) {
      try {
        var n = new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, timeZoneName: 'shortOffset' }).formatToParts(new Date())
          .filter(function (p) { return p.type === 'timeZoneName'; })[0].value;
        return n.replace('GMT', 'UTC').replace('-', '−');
      } catch (e) { return ''; }
    };
    var nomeFuso = function (fuso) {
      var partes = fuso.split('/');
      var regioes = { America: 'América', Europe: 'Europa', Asia: 'Ásia', Africa: 'África', Australia: 'Austrália', Pacific: 'Pacífico', Atlantic: 'Atlântico', Indian: 'Índico', Antarctica: 'Antártida', Arctic: 'Ártico' };
      return partes[partes.length - 1].replace(/_/g, ' ') + (partes.length > 1 ? ' (' + (regioes[partes[0]] || partes[0].replace(/_/g, ' ')) + ')' : '');
    };
    // Ordena por cidade e coloca o fuso detectado em primeiro
    fusos.sort(function (a, b) { return nomeFuso(a).localeCompare(nomeFuso(b), 'pt'); });
    var salvo = null;
    try { salvo = localStorage.getItem('fuso'); } catch (e) {}
    var fragm = document.createDocumentFragment();
    var optLocal = document.createElement('option');
    optLocal.value = fusoLocal;
    optLocal.textContent = nomeFuso(fusoLocal) + ', detectado';
    fragm.appendChild(optLocal);
    fusos.forEach(function (f) {
      if (f === fusoLocal) return;
      var o = document.createElement('option');
      o.value = f; o.textContent = nomeFuso(f);
      fragm.appendChild(o);
    });
    lbFuso.appendChild(fragm);
    lbFuso.value = salvo && fusos.indexOf(salvo) !== -1 ? salvo : fusoLocal;

    var lbAgora = document.getElementById('lb-agora');
    var lbFalta = document.getElementById('lb-falta');
    var lbNota = document.getElementById('lb-nota');
    var lbAntes = document.getElementById('lb-antes');
    var lbGoogle = document.getElementById('lb-google');
    var dois = function (n) { return (n < 10 ? '0' : '') + n; };
    var duracao = function (min) {
      var h = Math.floor(min / 60), m = min % 60, p = [];
      if (h) p.push(h + (h === 1 ? ' hora' : ' horas'));
      if (m) p.push(m + (m === 1 ? ' minuto' : ' minutos'));
      return p.join(' e ');
    };

    var atualizarRelogio = function () {
      var fuso = lbFuso.value;
      var hm = horaEm(fuso);
      lbAgora.setAttribute('aria-label', dois(hm[0]) + ':' + dois(hm[1]));
      document.querySelector('.relogio').classList.toggle('e-hora', hm[0] === 15);
      var agoraMin = hm[0] * 60 + hm[1];
      if (hm[0] === 15) lbFalta.textContent = 'Agora é a Hora da Misericórdia.';
      else {
        var falta = (15 * 60 - agoraMin + 24 * 60) % (24 * 60);
        lbFalta.textContent = 'A Hora da Misericórdia é ' + (agoraMin < 15 * 60 ? 'hoje' : 'amanhã') + ' às 15h. Faltam ' + duracao(falta) + '.';
      }
      var nota = deslocamento(fuso);
      if (fuso !== fusoLocal) {
        var hl = horaEm(fusoLocal);
        var dif = ((hm[0] * 60 + hm[1]) - (hl[0] * 60 + hl[1]) + 36 * 60) % (24 * 60) - 12 * 60;
        var noSeu = (15 * 60 - dif + 24 * 60) % (24 * 60);
        nota += (nota ? '. ' : '') + 'As 15h desse fuso são ' + dois(Math.floor(noSeu / 60)) + ':' + dois(noSeu % 60) + ' no relógio deste aparelho.';
      }
      lbNota.textContent = nota;

      // Link do Google Agenda, repetindo todo dia às 15h nesse fuso
      var d = new Date(), dia = d.getFullYear() + dois(d.getMonth() + 1) + dois(d.getDate());
      lbGoogle.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent('Hora da Misericórdia') +
        '&details=' + encodeURIComponent('“Nessa hora nada negarei à alma que Me pedir pela Minha Paixão.” (Diário, § 1320)\nRezar o Terço: ' + location.href.replace(/lembrete\.html.*$/, 'index.html#rezar')) +
        '&dates=' + dia + 'T150000/' + dia + 'T151500' +
        '&ctz=' + encodeURIComponent(fuso) +
        '&recur=' + encodeURIComponent('RRULE:FREQ=DAILY');
    };
    // Mostrador: marcas dos minutos, horas mais longas
    var marcas = document.getElementById('lb-marcas');
    var svgNS = 'http://www.w3.org/2000/svg';
    for (var mk = 0; mk < 60; mk++) {
      var a = mk * Math.PI / 30, longa = mk % 5 === 0;
      var l = document.createElementNS(svgNS, 'line');
      var r1 = longa ? 86 : 92, r2 = 96;
      l.setAttribute('x1', 110 + r1 * Math.sin(a)); l.setAttribute('y1', 110 - r1 * Math.cos(a));
      l.setAttribute('x2', 110 + r2 * Math.sin(a)); l.setAttribute('y2', 110 - r2 * Math.cos(a));
      l.setAttribute('class', 'm-tic' + (longa ? ' h' : ''));
      marcas.appendChild(l);
    }
    var ph = document.getElementById('lb-ph'), pm = document.getElementById('lb-pm'), ps = document.getElementById('lb-ps');
    var hmEl = lbAgora.querySelector('.hm'), ssEl = lbAgora.querySelector('.ss');
    // Escreve dígito a dígito; só o que mudou rola
    var escrever = function (alvo, texto) {
      if (alvo.childNodes.length !== texto.length || alvo.firstChild.nodeType === 3) {
        alvo.innerHTML = texto.split('').map(function (ch) { return '<span class="dg"><i>' + ch + '</i></span>'; }).join('');
        return;
      }
      texto.split('').forEach(function (ch, k) {
        var i = alvo.childNodes[k].firstChild;
        if (i.textContent !== ch) {
          i.textContent = ch;
          if (podeMover) { i.classList.remove('rola'); void i.offsetWidth; i.classList.add('rola'); }
        }
      });
    };
    var mostrador = document.getElementById('lb-mostrador');
    var ultimoSeg = -1;
    var girar = function () {
      var agora = new Date();
      var hm = horaEm(lbFuso.value, agora);
      var s = agora.getSeconds(), ms = podeMover ? agora.getMilliseconds() : 0;
      var seg = s + ms / 1000;
      ps.style.transform = 'rotate(' + (seg * 6) + 'deg)';
      pm.style.transform = 'rotate(' + ((hm[1] + seg / 60) * 6) + 'deg)';
      ph.style.transform = 'rotate(' + (((hm[0] % 12) + hm[1] / 60) * 30) + 'deg)';
      if (s !== ultimoSeg) {
        ultimoSeg = s;
        escrever(hmEl, dois(hm[0]) + ':' + dois(hm[1]));
        escrever(ssEl, ':' + dois(s));
        if (s === 0) atualizarRelogio();
      }
      if (podeMover && relogioVisivel) requestAnimationFrame(girar); else girando = false;
    };
    // O ponteiro só gira enquanto o relógio está na tela (poupa bateria)
    var relogioVisivel = true, girando = true;
    if ('IntersectionObserver' in window && podeMover) {
      new IntersectionObserver(function (e) {
        relogioVisivel = e[0].isIntersecting;
        if (relogioVisivel && !girando) { girando = true; requestAnimationFrame(girar); }
      }).observe(document.querySelector('.relogio'));
    }
    atualizarRelogio();
    // Os ponteiros partem do 12 e se acertam na hora certa
    if (podeMover) {
      mostrador.classList.add('acertando');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          girar();
          setTimeout(function () { mostrador.classList.remove('acertando'); }, 1700);
        });
      });
    } else {
      girar(); setInterval(girar, 1000);
    }
    lbFuso.addEventListener('change', function () {
      try { localStorage.setItem('fuso', lbFuso.value); } catch (e) {}
      atualizarRelogio();
      ultimoSeg = -1;
      if (podeMover) { mostrador.classList.add('acertando'); setTimeout(function () { mostrador.classList.remove('acertando'); }, 1700); } else girar();
      agendarAviso();
    });

    // Arquivo de calendário (.ics) que se repete todo dia às 15h
    document.getElementById('lb-ics').addEventListener('click', function () {
      var fuso = lbFuso.value, antes = +lbAntes.value;
      var d = new Date(), dia = d.getFullYear() + dois(d.getMonth() + 1) + dois(d.getDate());
      var carimbo = d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Divina Misericordia//Lembrete//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:hora-da-misericordia-' + fuso.replace(/[^A-Za-z]/g, '') + '-' + carimbo + '@divina-misericordia',
        'DTSTAMP:' + carimbo,
        'DTSTART;TZID=' + fuso + ':' + dia + 'T150000',
        'DTEND;TZID=' + fuso + ':' + dia + 'T151500',
        'RRULE:FREQ=DAILY',
        'SUMMARY:Hora da Misericórdia',
        'DESCRIPTION:“Nessa hora nada negarei à alma que Me pedir pela Minha Paixão.” (Diário\\, § 1320)',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Hora da Misericórdia', 'TRIGGER:-PT' + antes + 'M', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      var a = document.createElement('a');
      a.href = url; a.download = 'hora-da-misericordia.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    });

    // Aviso do navegador: funciona enquanto o site estiver aberto
    var lbNotif = document.getElementById('lb-notif');
    var lbEstado = document.getElementById('lb-notif-estado');
    var espera = null;
    var agendarAviso = function () {
      clearTimeout(espera);
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      var antes = +lbAntes.value;
      var hm = horaEm(lbFuso.value);
      var agora = new Date();
      var falta = ((15 * 60 - antes) - (hm[0] * 60 + hm[1]) + 24 * 60) % (24 * 60);
      if (falta === 0) falta = 24 * 60;
      var ms = falta * 60000 - agora.getSeconds() * 1000 - agora.getMilliseconds();
      espera = setTimeout(function () {
        try {
          new Notification('Hora da Misericórdia', {
            body: antes ? 'Faltam ' + antes + ' minutos para as 15h.' : 'São 15h. “Nessa hora nada negarei à alma que Me pedir pela Minha Paixão.”',
            icon: 'assets/img/marca.svg', tag: 'hora-da-misericordia'
          });
        } catch (e) {}
        agendarAviso();
      }, ms);
      var alvo = 15 * 60 - antes;
      lbEstado.textContent = 'Aviso ativado para as ' + dois(Math.floor(alvo / 60)) + ':' + dois(alvo % 60) + '. Deixe o site aberto em uma aba.';
      lbNotif.textContent = 'Aviso ativado';
      lbNotif.disabled = true;
    };
    lbAntes.addEventListener('change', agendarAviso);
    if (!('Notification' in window)) {
      lbNotif.disabled = true;
      lbEstado.textContent = 'Este navegador não mostra avisos. Use o lembrete no calendário.';
    } else if (Notification.permission === 'granted') {
      agendarAviso();
    } else if (Notification.permission === 'denied') {
      lbEstado.textContent = 'Os avisos deste site estão bloqueados. Libere nas configurações do navegador ou use o lembrete no calendário.';
    }
    lbNotif.addEventListener('click', function () {
      var pedido;
      try { pedido = Notification.requestPermission(); } catch (e) { pedido = null; }
      Promise.resolve(pedido).then(function (r) {
        r = r || Notification.permission;
        if (r === 'granted') agendarAviso();
        else lbEstado.textContent = 'O navegador não permitiu os avisos. Use o lembrete no calendário.';
      }, function () {
        lbEstado.textContent = 'O navegador não permitiu os avisos. Use o lembrete no calendário.';
      });
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

  /* O terço: crucifixo, cinco contas da haste (grande, três pequenas,
     grande), medalha e o círculo com as cinco dezenas. */
  var SVG = 'http://www.w3.org/2000/svg';
  var svg = document.getElementById('terco-svg');
  var CX = 160, CY = 162, R = 140;
  var contas = {};      // id -> elemento
  var ordem = [];       // ids na ordem em que se reza
  var pos = {};         // id -> [x, y]
  var fracAro = {};     // id -> fração do círculo até a conta

  function el(tag, attrs, pai) {
    var n = document.createElementNS(SVG, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    (pai || svg).appendChild(n);
    return n;
  }

  /* Desenhado como um terço de verdade: contas de vidro vermelho,
     corrente de metal, medalha e crucifixo prateados. */
  var defs = el('defs', {});
  defs.innerHTML =
    // Vidro apagado: granada escura, com luz atravessando embaixo
    '<radialGradient id="vidro-apagado" cx="56%" cy="62%" r="62%" fx="60%" fy="70%">' +
      '<stop offset="0" stop-color="#7a1c23"/><stop offset=".5" stop-color="#420c11"/><stop offset="1" stop-color="#170304"/></radialGradient>' +
    // Vidro aceso: rubi com brilho interno
    '<radialGradient id="vidro-aceso" cx="56%" cy="62%" r="62%" fx="62%" fy="70%">' +
      '<stop offset="0" stop-color="#ff8a7a"/><stop offset=".3" stop-color="#e2323a"/><stop offset=".72" stop-color="#930f19"/><stop offset="1" stop-color="#46050a"/></radialGradient>' +
    // Reflexo da luz no vidro
    '<radialGradient id="reflexo" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    // Prata envelhecida
    '<linearGradient id="prata" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#f1f3f2"/><stop offset=".38" stop-color="#b3babb"/><stop offset=".62" stop-color="#6f7779"/><stop offset=".85" stop-color="#c4cacb"/><stop offset="1" stop-color="#8a9294"/></linearGradient>' +
    '<linearGradient id="prata-escura" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#c9cfd0"/><stop offset=".5" stop-color="#7b8385"/><stop offset="1" stop-color="#4c5355"/></linearGradient>' +
    // Luz em volta da conta da vez
    '<radialGradient id="g-halo" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="#ff5a50" stop-opacity=".75"/><stop offset=".45" stop-color="#e2323a" stop-opacity=".28"/><stop offset="1" stop-color="#e2323a" stop-opacity="0"/></radialGradient>';

  var yMed = CY + R;
  var RP = 5, RG = 7.2;   // raio das contas pequenas e grandes

  // Corrente: elos curtos de metal, com um fio de brilho por cima
  function corrente(d) {
    el('path', { d: d, 'class': 'elo' });
    el('path', { d: d, 'class': 'elo-brilho' });
  }
  /* O laço cai como um terço pendurado: redondo em cima e
     fechando em ponta na medalha. Amostra a curva e mede o
     comprimento para espaçar as contas por igual. */
  var N = 720, curva = [], comp = [0];
  for (var q = 0; q <= N; q++) {
    var tt = Math.PI - 2 * Math.PI * q / N;          // começa embaixo, sobe pela direita
    curva.push([CX + 182 * Math.sin(tt) * (0.74 + 0.26 * Math.cos(tt)), CY - R * Math.cos(tt)]);
    if (q) comp.push(comp[q - 1] + Math.hypot(curva[q][0] - curva[q - 1][0], curva[q][1] - curva[q - 1][1]));
  }
  var compTotal = comp[N];
  function pontoNa(f) {
    var alvoL = f * compTotal, lo = 0, hi = N;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (comp[m] < alvoL) lo = m; else hi = m; }
    var k = (alvoL - comp[lo]) / ((comp[hi] - comp[lo]) || 1);
    return [curva[lo][0] + (curva[hi][0] - curva[lo][0]) * k, curva[lo][1] + (curva[hi][1] - curva[lo][1]) * k];
  }
  corrente('M' + curva.map(function (pt) { return pt[0].toFixed(1) + ' ' + pt[1].toFixed(1); }).join('L') + 'Z');
  corrente('M' + CX + ' ' + (yMed + 12) + 'V400');

  // A luz da conta da vez fica atrás das contas
  var halo = el('circle', { cx: 0, cy: 0, r: 18, fill: 'url(#g-halo)', 'class': 'halo oculto' });

  function conta(id, x, y, r) {
    var g = el('g', { 'class': 'conta', 'data-conta': id });
    el('circle', { cx: x, cy: y, r: r, fill: 'url(#vidro-apagado)' }, g);
    el('circle', { cx: x, cy: y, r: r, fill: 'url(#vidro-aceso)', 'class': 'luz' }, g);
    // Reflexo no alto, à esquerda, e uma borda de luz embaixo
    el('ellipse', { cx: x - r * .34, cy: y - r * .38, rx: r * .36, ry: r * .24, fill: 'url(#reflexo)', transform: 'rotate(-28 ' + (x - r * .34) + ' ' + (y - r * .38) + ')' }, g);
    el('path', { d: 'M' + (x - r * .62) + ' ' + (y + r * .42) + 'A' + (r * .78) + ' ' + (r * .78) + ' 0 0 0 ' + (x + r * .62) + ' ' + (y + r * .42), 'class': 'borda-luz' }, g);
    contas[id] = g; pos[id] = [x, y];
  }

  // Haste, de baixo para cima: crucifixo, L1, s1, s2, s3, L2
  var hasteY = { L1: 390.6, s1: 373.4, s2: 358.4, s3: 343.4, L2: 326.2 };
  ['L1', 's1', 's2', 's3', 'L2'].forEach(function (id) {
    conta(id, CX, hasteY[id], id.charAt(0) === 'L' ? RG : RP);
  });

  // Crucifixo de pontas arredondadas, com o Cristo em relevo
  var cruz = el('g', { 'class': 'cruz', 'data-conta': 'cruz' });
  el('circle', { cx: CX, cy: 401, r: 2, fill: 'none', stroke: '#9aa2a4', 'stroke-width': 1 }, cruz);
  el('path', { d: 'M157 404h6v48h-6zM144 414h32v6h-32z', fill: 'url(#prata)', stroke: '#4d5456', 'stroke-width': .6 }, cruz);
  [[CX, 404], [144, 417], [176, 417], [CX, 452]].forEach(function (k) {
    el('circle', { cx: k[0], cy: k[1], r: 3.4, fill: 'url(#prata)', stroke: '#4d5456', 'stroke-width': .6 }, cruz);
  });
  el('circle', { cx: CX, cy: 411.5, r: 1.9, fill: 'url(#prata-escura)' }, cruz);
  el('path', { d: 'M148.5 416.3Q160 419.6 171.5 416.3', fill: 'none', stroke: 'url(#prata-escura)', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, cruz);
  el('path', { d: 'M158.3 414h3.4l-.7 18-.3 11h-1.4l-.3-11z', fill: 'url(#prata-escura)', stroke: '#3f4547', 'stroke-width': .35 }, cruz);
  contas.cruz = cruz; pos.cruz = [CX, 422];

  // Círculo: a partir da medalha, dezenas em sentido anti-horário
  var itens = [];
  for (var d = 1; d <= 5; d++) {
    if (d > 1) itens.push({ id: 'G' + d, w: 1.6, r: RG });
    for (var c = 1; c <= 10; c++) itens.push({ id: 'd' + d + '-' + c, w: 1, r: RP });
  }
  var MED = 3.2;
  var total = MED + itens.reduce(function (s, i) { return s + i.w; }, 0);
  var acc = MED / 2;
  itens.forEach(function (it) {
    var meio = acc + it.w / 2;
    acc += it.w;
    var xy = pontoNa(meio / total);
    conta(it.id, xy[0], xy[1], it.r);
    fracAro[it.id] = meio / total;
  });

  // Medalha de prata com a Imagem em miniatura: os dois raios
  var medalha = el('g', { 'class': 'medalha', 'data-conta': 'medalha' });
  el('ellipse', { cx: CX, cy: yMed, rx: 10, ry: 12.5, fill: 'url(#prata)', stroke: '#4d5456', 'stroke-width': .7 }, medalha);
  el('ellipse', { cx: CX, cy: yMed, rx: 7.4, ry: 9.8, fill: '#20282a', stroke: '#c9cfd0', 'stroke-width': .5 }, medalha);
  el('path', { d: 'M160 296L155.5 308M160 296L157.8 308.5M160 296L159.4 308.6', stroke: '#e0464c', 'stroke-width': .8, fill: 'none' }, medalha);
  el('path', { d: 'M160 296L160.6 308.6M160 296L162.2 308.5M160 296L164.5 308', stroke: '#d6e7ec', 'stroke-width': .8, fill: 'none' }, medalha);
  el('circle', { cx: CX, cy: yMed - 7, r: 1.6, fill: '#e9ecea' }, medalha);
  contas.medalha = medalha; pos.medalha = [CX, yMed];

  ordem.push('cruz', 'L1', 's1', 's2', 's3', 'L2');
  for (d = 1; d <= 5; d++) {
    if (d > 1) ordem.push('G' + d);
    for (c = 1; c <= 10; c++) ordem.push('d' + d + '-' + c);
  }
  ordem.push('medalha');
  var indice = {};
  ordem.forEach(function (id, k) { indice[id] = k; });

  // Cada passo: fase, conta (texto), oração e as contas acesas.
  var passos = [
    { f: 'Início', c: 'Sinal da cruz, no crucifixo', t: T.sinal, b: ['cruz'] },
    { f: 'Início', c: 'Oração de abertura', t: T.abertura, b: ['cruz'] },
    { f: 'Início', c: 'Ó Sangue e Água, 1 de 3', t: T.sangue, b: ['cruz'] },
    { f: 'Início', c: 'Ó Sangue e Água, 2 de 3', t: T.sangue, b: ['cruz'] },
    { f: 'Início', c: 'Ó Sangue e Água, 3 de 3', t: T.sangue, b: ['cruz'] },
    { f: 'Três contas pequenas', c: 'Pai-Nosso, 1ª conta', t: T.paiNosso, b: ['s1'] },
    { f: 'Três contas pequenas', c: 'Ave-Maria, 2ª conta', t: T.aveMaria, b: ['s2'] },
    { f: 'Três contas pequenas', c: 'Creio, 3ª conta', t: T.creio, b: ['s3'] }
  ];
  for (d = 1; d <= 5; d++) {
    passos.push({ f: 'Dezena ' + d + ' de 5', c: 'Conta grande', t: T.eterno, b: [d === 1 ? 'L2' : 'G' + d] });
    for (c = 1; c <= 10; c++) {
      passos.push({ f: 'Dezena ' + d + ' de 5', c: 'Conta pequena, ' + c + ' de 10', t: T.paixao, b: ['d' + d + '-' + c] });
    }
  }
  passos.push(
    { f: 'Encerramento', c: 'Deus Santo, 1 de 3', t: T.santo, b: [] },
    { f: 'Encerramento', c: 'Deus Santo, 2 de 3', t: T.santo, b: [] },
    { f: 'Encerramento', c: 'Deus Santo, 3 de 3', t: T.santo, b: [] },
    { f: 'Encerramento', c: 'Oração final', t: T.final, b: [] },
    { f: 'Terço concluído', c: '', t: 'Jesus, eu confio em Vós.', b: [], ultimo: true }
  );

  // Clicar numa conta leva ao primeiro passo dela.
  var passoDaConta = {};
  passos.forEach(function (p, k) {
    p.b.forEach(function (id) { if (!(id in passoDaConta)) passoDaConta[id] = k; });
  });

  var fase = document.getElementById('rz-fase');
  var contaTxt = document.getElementById('rz-conta');
  var oracao = document.getElementById('rz-oracao');
  var prox = document.getElementById('rz-prox');
  var volta = document.getElementById('rz-volta');
  var i = 0;

  function mostrar(animar) {
    var p = passos[i];
    fase.textContent = p.f;
    contaTxt.textContent = p.c;
    contaTxt.hidden = !p.c;
    oracao.textContent = p.t;
    oracao.classList.toggle('longa', p.t.length > 150);
    if (animar) {
      oracao.classList.remove('entra');
      void oracao.offsetWidth;
      oracao.classList.add('entra');
    }

    var primeira = p.b.length ? Math.min.apply(null, p.b.map(function (id) { return indice[id]; })) : ordem.length;

    // Terço concluído: as contas se acendem uma a uma, do crucifixo à medalha
    ordem.forEach(function (id, k) {
      contas[id].style.transitionDelay = p.ultimo && animar ? (k * 16) + 'ms' : '';
    });

    ordem.forEach(function (id) {
      var n = contas[id];
      var agora = p.b.indexOf(id) !== -1;
      n.classList.toggle('agora', agora);
      n.classList.toggle('feita', !agora && indice[id] < primeira);
    });

    if (p.b.length === 1) {
      var xy = pos[p.b[0]];
      halo.setAttribute('r', p.b[0] === 'cruz' ? 30 : (p.b[0] === 'medalha' ? 24 : (p.b[0].charAt(0) === 'd' || p.b[0].charAt(0) === 's' ? 15 : 19)));
      halo.style.transform = 'translate(' + xy[0].toFixed(1) + 'px,' + xy[1].toFixed(1) + 'px)';
      halo.classList.remove('oculto');
    } else {
      halo.classList.add('oculto');
    }

    svg.setAttribute('aria-label', 'Terço. ' + p.f + (p.c ? ', ' + p.c : '') + '.');
    volta.disabled = i === 0;
    prox.textContent = p.ultimo ? 'Rezar de novo' : 'Próxima conta';
  }

  // Mantém a tela do celular acesa enquanto se reza
  var trava = null;
  function manterTela(ligar) {
    if (!('wakeLock' in navigator)) return;
    if (ligar && !trava) {
      navigator.wakeLock.request('screen').then(function (t) {
        trava = t;
        t.addEventListener('release', function () { if (trava === t) trava = null; });
      }, function () {});
    } else if (!ligar && trava) {
      var t = trava; trava = null; t.release().catch(function () {});
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && i > 0 && !passos[i].ultimo) manterTela(true);
  });

  function avancar() {
    i = passos[i].ultimo ? 0 : i + 1;
    manterTela(!passos[i].ultimo);
    mostrar(true);
  }
  function voltar() { if (i > 0) { i -= 1; mostrar(true); } }

  prox.addEventListener('click', avancar);
  volta.addEventListener('click', voltar);
  rezador.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); avancar(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); voltar(); }
  });
  svg.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('[data-conta]');
    var id = g && g.getAttribute('data-conta');
    if (id && id in passoDaConta) { i = passoDaConta[id]; mostrar(true); }
  });

  mostrar(false);
})();
