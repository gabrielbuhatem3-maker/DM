/* Divina Misericórdia · o site guardado no aparelho

   Páginas: vêm da internet quando ela responde (assim o texto está
   sempre em dia); sem internet, ou se ela demorar, abrem do aparelho.
   Estilo, script, fontes e fotos: abrem direto do aparelho. O estilo e
   o script têm a versão no endereço (?v=…), então uma versão nova
   nunca se mistura com a antiga.

   VERSAO e LISTA são atualizadas por tools/versao.py. */
'use strict';

var VERSAO = /*VERSAO*/'dm-a3884023c3'/*FIM*/;
var LISTA = /*LISTA*/[["assets/css/style.css?v=dm-a3884023c3",57923],["assets/js/main.js?v=dm-a3884023c3",58524],["assets/fonts/brygada-1918-latin.woff2",22716],["assets/fonts/brygada-1918-italic-latin.woff2",23856],["assets/fonts/brygada-1918-polones.woff2",3492],["assets/fonts/brygada-1918-italic-polones.woff2",3816],["assets/img/jesus-misericordioso.webp",30938],["index.html",29221],["imagem.html",15673],["promessas.html",17150],["lembrete.html",11463],["assets/img/santa-faustina.webp",15842],["assets/img/terco-devocionario.avif",69065],["assets/img/marca.svg",656],["assets/img/icone-192.png",17144],["site.webmanifest",1026]]/*FIM*/;
var ESPERA_REDE = 3500; // ms antes de abrir a página guardada

self.addEventListener('install', function (e) {
  // Baixa só o que ainda não está guardado (a primeira visita já guarda quase tudo)
  e.waitUntil(caches.open(VERSAO).then(function (cache) {
    return Promise.all(LISTA.map(function (item) {
      return cache.match(item[0]).then(function (tem) {
        if (tem) return;
        return fetch(item[0], { cache: 'no-cache' }).then(function (r) {
          if (r.ok) return cache.put(item[0], r);
        }).catch(function () {});
      });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.map(function (n) {
      if (n.indexOf('dm-') === 0 && n !== VERSAO) return caches.delete(n);
    }));
  }).then(function () { return self.clients.claim(); }));
});

// "/DM/" e "/DM/imagem" são as mesmas páginas que "index.html" e "imagem.html"
function chaveDaPagina(url) {
  var u = new URL(url);
  u.hash = ''; u.search = '';
  if (u.pathname.slice(-1) === '/') u.pathname += 'index.html';
  else if (u.pathname.split('/').pop().indexOf('.') === -1) u.pathname += '.html';
  return u.href;
}

function pagina(req) {
  var chave = chaveDaPagina(req.url);
  return caches.open(VERSAO).then(function (cache) {
    var daRede = fetch(req).then(function (r) {
      if (r.ok && r.type === 'basic') cache.put(chave, r.clone());
      return r;
    });
    var guardada = function () {
      return cache.match(chave).then(function (r) {
        return r || cache.match(new URL('index.html', self.registration.scope).href);
      });
    };
    return new Promise(function (resolve, reject) {
      var feito = false;
      var usarGuardada = function () {
        guardada().then(function (r) {
          if (feito) return;
          if (r) { feito = true; resolve(r); }
        });
      };
      var t = setTimeout(usarGuardada, ESPERA_REDE);
      daRede.then(function (r) {
        clearTimeout(t);
        if (!feito) { feito = true; resolve(r); }
      }, function () {
        clearTimeout(t);
        guardada().then(function (r) {
          if (feito) return;
          feito = true;
          if (r) resolve(r); else reject(new Error('sem rede e sem cópia'));
        });
      });
    });
  });
}

function arquivo(req) {
  return caches.open(VERSAO).then(function (cache) {
    return cache.match(req).then(function (tem) {
      if (tem) return tem;
      return fetch(req).then(function (r) {
        if (r.ok && r.type === 'basic') cache.put(req, r.clone());
        return r;
      });
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(req.mode === 'navigate' ? pagina(req) : arquivo(req));
});

// Aviso das 15h: ao tocar, abre o Terço (ou a aba do site que já estiver aberta)
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var alvo = new URL('index.html#rezar', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (abas) {
    for (var k = 0; k < abas.length; k++) {
      if ('focus' in abas[k]) return abas[k].focus();
    }
    return self.clients.openWindow(alvo);
  }));
});
