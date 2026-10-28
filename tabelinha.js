/* Tabelinha Futsal · troca emojis por ícones de linha (tabelinha.css), inclusive no conteúdo gerado depois. */
(function () {
  var MAP = { '📍': 'pin', '📅': 'cal', '⏰': 'clock', '⏱': 'clock', '🏆': 'trophy', '🥇': 'medal m1', '🥈': 'medal m2', '🥉': 'medal m3',
    '⚽': 'ball', '🏠': 'home', '🚗': 'bus', '🚌': 'bus', '🗺': 'map', '🔗': 'link', '🌟': 'star', '⭐': 'star', '📊': 'chart',
    '📋': 'list', '✏': 'pencil', '✔': 'check', '✓': 'check', '🔴': 'dot', '☀': 'sun', '🌙': 'moon', '🔥': '', '👆': '' };
  var RE = new RegExp('(' + Object.keys(MAP).join('|') + ')\\uFE0F?', 'g');
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, TITLE: 1, OPTION: 1, NOSCRIPT: 1 };
  var busy = false;

  function fix(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), list = [], n;
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!p || SKIP[p.nodeName] || (p.classList && p.classList.contains('ic'))) continue;
      RE.lastIndex = 0;
      if (RE.test(n.nodeValue)) list.push(n);
    }
    list.forEach(function (node) {
      var txt = node.nodeValue, frag = document.createDocumentFragment(), last = 0, m;
      RE.lastIndex = 0;
      while ((m = RE.exec(txt))) {
        frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var k = MAP[m[1]];
        if (k) { var i = document.createElement('i'); i.className = 'ic ic-' + k.split(' ').join(' ic-'); i.setAttribute('aria-hidden', 'true'); frag.appendChild(i); }
        last = m.index + m[0].length;
      }
      frag.appendChild(document.createTextNode(txt.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function run() { if (busy) return; busy = true; try { fix(document.body); } finally { busy = false; } }
  function start() {
    run();
    new MutationObserver(function () { run(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* Waze: no Android tenta abrir o app; se não abrir, avisa. No iPhone e no computador usa o link universal. */
(function () {
  var ua = navigator.userAgent || '';
  var android = /Android/i.test(ua);
  function toast(web) {
    var old = document.querySelector('.tf-toast'); if (old) old.remove();
    var t = document.createElement('div'); t.className = 'tf-toast'; t.setAttribute('role', 'status');
    t.innerHTML = '<span>Parece que você não tem o Waze instalado.</span><a href="' + web + '" target="_blank" rel="noopener">Abrir no navegador</a><button aria-label="Fechar">×</button>';
    t.querySelector('button').onclick = function () { t.remove(); };
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 9000);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="waze.com/ul"]');
    if (!a || !android) return;
    e.preventDefault();
    var q = new URL(a.href).searchParams.get('q') || '';
    var left = false;
    var mark = function () { left = true; };
    document.addEventListener('visibilitychange', mark, { once: true });
    window.addEventListener('pagehide', mark, { once: true });
    window.addEventListener('blur', mark, { once: true });
    window.location.href = 'waze://?q=' + encodeURIComponent(q) + '&navigate=yes';
    setTimeout(function () { if (!left && !document.hidden) toast(a.href); }, 1800);
  });
})();

/* Carrossel: cria as bolinhas (uma por bloco) e acompanha a rolagem; só aparecem no celular */
(function () {
  var SEL = '.stats-cols, .champ-grid, .metal-agenda-grid, .next-stack';
  function setup(box) {
    if (box.dataset.cz) return; box.dataset.cz = '1';
    var dots = document.createElement('div'); dots.className = 'dots'; dots.setAttribute('aria-hidden', 'true');
    box.parentNode.insertBefore(dots, box.nextSibling);
    function sync() {
      var kids = box.children, step = kids.length > 1 ? kids[1].offsetLeft - kids[0].offsetLeft : 1;
      var i = Math.min(kids.length - 1, Math.max(0, Math.round(box.scrollLeft / (step || 1))));
      Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === i); });
    }
    function build() {
      var n = box.children.length;
      dots.innerHTML = new Array(n + 1).join('<i></i>');
      Array.prototype.forEach.call(dots.children, function (d, k) {
        d.onclick = function () { box.scrollTo({ left: box.children[k].offsetLeft - box.children[0].offsetLeft, behavior: 'smooth' }); };
      });
      sync();
    }
    box.addEventListener('scroll', sync, { passive: true });
    new MutationObserver(build).observe(box, { childList: true });
    build();
  }
  function run() { document.querySelectorAll(SEL).forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
})();

/* ═════ Rodada 6 ═════ */
/* Troca de chave: o conteúdo entra deslizando; meio segundo depois a rolagem "puxa" duas vezes (tuc, tuc) e volta */
/* "tuc, tuc": a rolagem puxa duas vezes para o lado e volta, para mostrar que há mais conteúdo */
window.tfNudge = function (scroller, delay) {
  if (!scroller || scroller.scrollWidth <= scroller.clientWidth + 4) return;
  scroller.scrollLeft = 0;
  var tween = function (to, ms) {
    var from = scroller.scrollLeft, t0 = Date.now();
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / ms), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      scroller.scrollLeft = from + (to - from) * e;
      if (p >= 1) clearInterval(iv);
    }, 16);
  };
  var go = function (x, at) { setTimeout(function () { tween(x, 220); }, (delay || 0) + at); };
  go(54, 0); go(0, 260); go(54, 460); go(0, 720);
};
/* Troca de chave: o conteúdo entra deslizando; meio segundo depois vem o "tuc, tuc" */
window.tfPull = function (scroller, content) {
  if (content) { content.classList.remove('tf-pop'); void content.offsetWidth; content.classList.add('tf-pop'); }
  window.tfNudge(scroller, 500);
};
/* Ao rolar até o chaveamento (aparecer na tela), faz o "tuc, tuc" uma vez */
(function () {
  if (!('IntersectionObserver' in window)) return;
  function setup() {
    [['#chaves', '#chaves .bk-scroll'], ['.bracket-section', '.bracket-tree-container']].forEach(function (pair) {
      var host = document.querySelector(pair[0]); if (!host) return;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { io.disconnect(); setTimeout(function () { window.tfNudge(document.querySelector(pair[1]), 0); }, 300); }
        });
      }, { threshold: 0.55 });
      io.observe(host);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();

var tfReduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Títulos do banner: palavra por palavra */
(function () {
  if (tfReduced) return;
  function run() {
    document.querySelectorAll('.half-hero, .hero-full .hero-title, .hero-full .tb-title').forEach(function (el) {
      if (el.dataset.sp) return; el.dataset.sp = '1'; el.setAttribute('aria-label', el.textContent.trim());
      var k = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.nodeValue.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span'); w.className = 'tf-w'; w.style.setProperty('--k', k++); w.textContent = part; frag.appendChild(w);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      })(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

/* "Agora é semi!": começa no centro do banner (--cy) e depois sobe puxando as outras linhas */
(function () {
  function center() {
    var t = document.querySelector('.half-hero'), hero = document.querySelector('.hero-full');
    if (!t || !hero) return;
    var off = function (e, k) { var v = 0; while (e && e !== hero) { v += e[k]; e = e.offsetParent; } return v; };
    // começa no meio do banner (nos dois eixos no desktop; só na vertical no celular)
    var tc = off(t, 'offsetTop') + t.offsetHeight / 2;
    // um pouco abaixo do meio do banner
    var cy = Math.max(0, hero.offsetHeight * 0.52 - tc);
    var cx = innerWidth >= 620 ? hero.offsetWidth / 2 - (off(t, 'offsetLeft') + t.offsetWidth / 2) : 0;
    t.style.setProperty('--cy', Math.round(cy) + 'px');
    t.style.setProperty('--cx', Math.round(cx) + 'px');
  }
  var again = function () { center(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(center); setTimeout(center, 600); setTimeout(center, 1500); };
  window.addEventListener('load', center); window.addEventListener('resize', center);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', again); else again();
})();

/* "Agora é semi!": confetes saindo do título */
(function () {
  if (tfReduced) return;
  function burst() {
    var hero = document.querySelector('.hero-full'), t = document.querySelector('.half-hero');
    if (!hero || !t) return;
    var hr = hero.getBoundingClientRect(), tr = t.getBoundingClientRect();
    var cx = tr.left - hr.left + tr.width / 2, cy = tr.top - hr.top + tr.height / 2;
    var colors = ['#FFD60A', '#FFFFFF', '#0D0D0D', '#FBF7F0', '#FF8A1F', '#3DAFA2'];
    var box = document.createElement('div'); box.className = 'tf-confetti'; hero.appendChild(box);
    for (var i = 0; i < 46; i++) {
      var p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = (90 + Math.random() * 190) * Math.min(2.4, Math.max(1, hero.offsetWidth / 420));
      p.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;background:' + colors[i % colors.length] + ';width:' + (5 + Math.random() * 6) + 'px;height:' + (7 + Math.random() * 8) + 'px;' +
        '--dx:' + Math.cos(a) * d + 'px;--dy:' + (Math.sin(a) * d * 0.8 - 40) + 'px;--rot:' + (Math.random() * 720 - 360) + 'deg;animation-delay:' + (Math.random() * 0.25) + 's;animation-duration:' + (1.5 + Math.random() * 1.1) + 's';
      box.appendChild(p);
    }
    setTimeout(function () { box.remove(); }, 3200);
  }
  (function () { var go = function () { if (document.querySelector('.half-hero')) setTimeout(burst, 1250); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go(); })();
})();

/* Números: efeito escada (1, 2, 3, 4); os do banner e os das caixas rodam ao mesmo tempo */
(function () {
  if (tfReduced) return;
  var groups = [[], []];
  function parse(el) { var m = (el.textContent || '').trim().match(/^(\d+(?:[.,]\d+)?)(.*)$/); return m ? { el: el, final: el.textContent.trim(), to: parseFloat(m[1].replace(',', '.')), dec: (m[1].split(/[.,]/)[1] || '').length, suf: m[2] } : null; }
  function prep() {
    document.querySelectorAll('.tb-stat .n').forEach(function (el) { var it = parse(el); if (it) { groups[0].push(it); el.textContent = (0).toFixed(it.dec) + it.suf; el.style.opacity = '.35'; } });
    document.querySelectorAll('.wdl-card.w .wdl-num, .wdl-card.d .wdl-num, .wdl-card.l .wdl-num, .wdl-card.a .wdl-num').forEach(function (el) { var it = parse(el); if (it) { groups[1].push(it); el.textContent = (0).toFixed(it.dec) + it.suf; el.style.opacity = '.35'; } });
  }
  function play(it) {
    var t0 = Date.now(); it.el.style.opacity = '1';
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / 900), e = 1 - Math.pow(1 - p, 3);
      it.el.textContent = (it.to * e).toFixed(it.dec) + it.suf;
      if (p >= 1) { clearInterval(iv); it.el.textContent = it.final; }
    }, 33);
  }
  function start() { groups.forEach(function (g) { g.forEach(function (it, i) { setTimeout(function () { play(it); }, i * 320); }); }); }
  var go = function () { prep(); setTimeout(start, 1300); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(go, 0); }); else go();
})();
