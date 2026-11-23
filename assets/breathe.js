// Шарик-дыхание 4-7-8: нажала — три цикла вдох/задержка/выдох с подсказками. Повторное нажатие — стоп.
(function () {
  var b = document.getElementById('breathe'), say = document.getElementById('say');
  if (!b) return;
  var timers = [], running = false;
  var IDLE = 'Подышим?<small>Нажми, и я поведу</small>';
  function set(cls, text, sub) { b.className = 'breathe ' + cls; say.innerHTML = text + (sub ? '<small>' + sub + '</small>' : ''); }
  function stop(msg) {
    timers.forEach(clearTimeout); timers = []; running = false;
    set('', msg || 'Подышим?', msg ? 'Нажми, чтобы ещё раз' : 'Нажми, и я поведу');
  }
  function count(cls, word, sec, at) {
    for (var s = 0; s < sec; s++) (function (k) {
      timers.push(setTimeout(function () { set(cls, word, String(sec - k)); }, at + k * 1000));
    })(s);
    return at + sec * 1000;
  }
  b.addEventListener('click', function () {
    if (running) return stop();
    running = true; var t = 0;
    for (var i = 0; i < 3; i++) { t = count('in', 'Вдох', 4, t); t = count('hold', 'Задержи', 7, t); t = count('out', 'Выдох', 8, t); }
    timers.push(setTimeout(function () { stop('Ты молодец'); }, t));
  });
  say.innerHTML = IDLE;
})();
