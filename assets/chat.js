// «Опора» — чат с ИИ. История хранится только в браузере (localStorage), на сервере не сохраняется.
(function () {
  var API = window.OPORA_API || 'https://opora-chat.videorils.workers.dev/chat';
  var KEY = 'opora_chat_v1';
  var log = document.getElementById('log'), ta = document.getElementById('msg'), send = document.getElementById('send');
  var chips = document.getElementById('chips'), clear = document.getElementById('clear');
  if (!log) return;
  var hist = [];
  try { hist = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { hist = []; }
  var HELLO = 'Привет. Я «Опора» — можно просто выговориться, я выслушаю без оценок.\nРасскажи, что у тебя сейчас происходит? Или выбери тему ниже 👇';

  function save() { try { localStorage.setItem(KEY, JSON.stringify(hist.slice(-40))); } catch (e) {} }
  function add(role, text, crisis) {
    var d = document.createElement('div');
    d.className = 'm ' + (role === 'user' ? 'u' : 'a') + (crisis ? ' crisis' : '');
    d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function render() {
    log.innerHTML = ''; add('assistant', HELLO);
    hist.forEach(function (m) { add(m.role, m.content, m.crisis); });
    chips.style.display = hist.length ? 'none' : '';
  }
  var busy = false;
  function ask(text) {
    text = (text || '').trim(); if (!text || busy) return;
    busy = true; send.disabled = true; chips.style.display = 'none';
    hist.push({ role: 'user', content: text }); add('user', text); save(); ta.value = ''; ta.style.height = '';
    var t = document.createElement('div'); t.className = 'typing'; t.textContent = 'Опора печатает…'; log.appendChild(t); log.scrollTop = log.scrollHeight;
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: hist.map(function (m) { return { role: m.role, content: m.content }; }) }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { var a = { role: 'assistant', content: j.reply || 'Я здесь. Попробуй написать ещё раз.', crisis: !!j.crisis }; hist.push(a); save(); add(a.role, a.content, a.crisis); })
      .catch(function () { add('assistant', 'Связь пропала. Проверь интернет и попробуй ещё раз. Если тебе сейчас очень плохо — 8-495-989-50-50 или 112.', true); })
      .finally(function () { t.remove(); busy = false; send.disabled = false; ta.focus(); });
  }
  send.onclick = function () { ask(ta.value); };
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(ta.value); } });
  ta.addEventListener('input', function () { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; });
  chips.addEventListener('click', function (e) { if (e.target.tagName === 'BUTTON') ask(e.target.textContent); });
  clear.onclick = function () { if (confirm('Стереть переписку с этого устройства?')) { hist = []; save(); render(); } };
  var q = new URLSearchParams(location.search).get('q');
  render();
  if (q) ask(q);
})();
