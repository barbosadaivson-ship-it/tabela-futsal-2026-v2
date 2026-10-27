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
