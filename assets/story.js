// «Опора»: небо меняется от ночи к утру по мере прокрутки (секции с data-sky), шапка, появление при прокрутке, лента статей.
(function () {
  var root = document.documentElement, body = document.body;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── шапка: прозрачная над фото, плотная после первого экрана ──
  function onHead() { body.classList.toggle('scrolled', scrollY > innerHeight * 0.45); }

  // ── небо ──
  var secs = [].slice.call(document.querySelectorAll('[data-sky]'));
  function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  var cols = secs.map(function (s) { return hex(s.getAttribute('data-sky')); });
  function lum(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function sky() {
    if (!secs.length) return;
    var mid = innerHeight * 0.55, i = 0, f = 0;
    for (var k = 0; k < secs.length; k++) {
      var r = secs[k].getBoundingClientRect();
      if (r.top <= mid) { i = k; f = r.height ? Math.min(1, Math.max(0, (mid - r.top) / r.height)) : 0; }
    }
    var a = cols[i], b = cols[Math.min(i + 1, cols.length - 1)];
    var t = Math.min(1, Math.max(0, (f - 0.55) / 0.45)); t = t * t * (3 - 2 * t);
    var c = a.map(function (v, j) { return Math.round(v + (b[j] - v) * t); });
    var L = lum(c);
    var key = c.join(','); if (key === sky.last) return; sky.last = key;
    root.style.setProperty('--sky', 'rgb(' + key + ')');
    body.classList.toggle('onlight', L > 0.5);
    root.style.setProperty('--stars', Math.max(0, 1 - L * 2.6).toFixed(3));
    root.style.setProperty('--sun', Math.min(1, Math.max(0, (L - 0.12) * 1.6)).toFixed(3));
  }

  var ticking = false;
  function frame() { ticking = false; onHead(); sky(); }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();

  // ── появление при прокрутке (скрыто только при html.js) ──
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !still) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // ── лента статей: кнопки листания ──
  document.querySelectorAll('[data-strip]').forEach(function (wrap) {
    var s = wrap.querySelector('.strip');
    wrap.querySelectorAll('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        s.scrollBy({ left: +b.getAttribute('data-dir') * s.clientWidth * 0.8, behavior: still ? 'auto' : 'smooth' });
      });
    });
  });

  // ── мобильное меню: закрыть по Esc ──
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { var n = document.querySelector('.nav'); if (n && n.classList.contains('open')) document.querySelector('.burger').click(); }
  });
})();
// боковая реклама прячется у подвала
(function () { var f = document.querySelector('footer'); if (!f || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (e) { document.body.classList.toggle('foot', e[0].isIntersecting); }).observe(f); })();
// реклама: в каждом .rot показываем один случайный вариант
[].forEach.call(document.querySelectorAll('.rot'), function (r) {
  var n = r.children.length; if (n < 2) return; var keep = Math.floor(Math.random() * n);
  for (var j = n - 1; j >= 0; j--) if (j !== keep) r.removeChild(r.children[j]);
});
// боковая реклама: пул вариантов; на широком экране — колонка справа на всю длину (листается вместе с сайтом),
// на узком — карточки между блоками
(function () {
  var tpl = document.getElementById('oppool'); if (!tpl) return;
  var side = tpl.parentNode;
  var by = { tr: [], vr: [], en: [], sr: [] };
  [].slice.call(tpl.content.children).sort(function () { return Math.random() - .5; }).forEach(function (n) { by[n.dataset.b].push(n); });
  var order = ['tr', 'en', 'vr', 'sr', 'tr', 'vr', 'en', 'sr', 'tr'], cards = [];
  order.forEach(function (b) { var n = by[b].shift(); if (n) cards.push(n.cloneNode(true)); });
  [].forEach.call(side.querySelectorAll('.og'), function (g) { g.remove(); });
  var wide = matchMedia('(min-width:1200px)');
  if (wide.matches) {
    cards.forEach(function (c) { side.appendChild(c); });
    side.classList.add('col');
    var main = document.querySelector('main'), foot = document.querySelector('footer');
    function place() {
      var first = main.firstElementChild, top = side.classList.contains('home') && first ? first.offsetTop + first.offsetHeight + 40 : main.offsetTop + 110;
      var h = Math.max(600, foot.offsetTop - top - 60), n = Math.max(2, Math.min(cards.length, Math.floor(h / 520)));
      cards.forEach(function (c, k) { c.style.display = k < n ? '' : 'none'; });
      side.style.top = top + 'px'; side.style.height = h + 'px';
    }
    place(); addEventListener('load', place); addEventListener('resize', place);
    document.body.classList.add('with-col');
  } else {
    var main2 = document.querySelector('main');
    var spots = [].slice.call(main2.querySelectorAll('h2')).slice(1), tag = 'div';
    if (spots.length < 2) { spots = [].slice.call(main2.querySelectorAll('li')).filter(function (x, j) { return j && j % 4 === 0; }); tag = 'li'; }
    var step = Math.max(1, Math.ceil(spots.length / 4)), k = 0;
    for (var i = 0; i < spots.length && k < 4; i += step) {
      var box = document.createElement(tag); box.className = 'side-vr inl'; box.style.listStyle = 'none'; box.appendChild(cards[k++]);
      var h2 = spots[i], anchor = h2.closest('section') && h2.closest('section').parentNode === main2 ? h2.closest('section') : h2;
      anchor.parentNode.insertBefore(box, anchor);
    }
    side.remove();
  }
})();
