// Тесты GAD-7 / PHQ-9: всё считается в браузере, ничего никуда не отправляется.
(function () {
  var box = document.querySelector('.qtest'); if (!box) return;
  var T = JSON.parse(box.getAttribute('data-t'));
  var form = box.querySelector('form'), res = box.querySelector('.qres');
  form.addEventListener('change', function () {
    var done = form.querySelectorAll('input:checked').length;
    box.querySelector('.qprog').textContent = done + ' из ' + T.n;
    form.querySelector('button').disabled = done < T.n;
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var sum = 0, crisis = false;
    form.querySelectorAll('input:checked').forEach(function (i) {
      var v = +i.value; sum += v;
      if (T.crisis !== null && +i.name.slice(1) === T.crisis && v > 0) crisis = true;
    });
    var L = T.levels.filter(function (l) { return sum >= l[0] && sum <= l[1]; })[0];
    res.querySelector('.qscore').textContent = sum + ' из ' + T.max;
    res.querySelector('.qlevel').textContent = L[2];
    res.querySelector('.qtext').textContent = L[3];
    res.querySelector('.qcrisis').hidden = !crisis;
    res.hidden = false; res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  box.querySelector('.qagain').addEventListener('click', function () {
    form.reset(); res.hidden = true; form.querySelector('button').disabled = true;
    box.querySelector('.qprog').textContent = '0 из ' + T.n; form.scrollIntoView({ behavior: 'smooth' });
  });
})();
