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
