// 우리반 링크판 공통 기능
(function () {
  var API = window.LINKPAN_API;
  var ready = API && API.indexOf('PASTE_') !== 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u)) ? String(u) : '#'; }

  function qrSvg(text) {
    var q = qrcode(0, 'M');
    q.addData(unescape(encodeURIComponent(text)));
    q.make();
    var n = q.getModuleCount(), m = 2, size = n + m * 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges" role="img" aria-label="QR 코드"><rect width="100%" height="100%" fill="#fff"/><path fill="#14233D" d="' + d + '"/></svg>';
  }

  function withTimeout(url, opts, ms) {
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
    if (ctl) opts.signal = ctl.signal;
    return fetch(url, opts).then(function (r) { clearTimeout(timer); return r.json(); }, function (e) {
      clearTimeout(timer);
      throw new Error(e && e.name === 'AbortError' ? '연결이 느려요. 다시 눌러 보세요.' : '인터넷 연결을 확인해 주세요.');
    });
  }
  function list() {
    if (!ready) return Promise.reject(new Error('config.js에 웹 앱 주소가 아직 없어요.'));
    return withTimeout(API + '?t=' + Date.now(), { cache: 'no-store' }, 15000)
      .then(function (j) { if (!j.ok) throw new Error(j.error || '목록을 불러오지 못했어요.'); return j.data; });
  }
  function post(body) {
    if (!ready) return Promise.reject(new Error('config.js에 웹 앱 주소가 아직 없어요.'));
    return withTimeout(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }, 20000)
      .then(function (j) { if (!j.ok) throw new Error(j.error || '저장하지 못했어요.'); return j.data; });
  }
  function koDate(iso) {
    var p = String(iso || '').split('-'); if (p.length !== 3) return '';
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return (+p[1]) + '월 ' + (+p[2]) + '일 ' + '일월화수목금토'[d.getDay()] + '요일';
  }
  function toast(msg) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._h); toast._h = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  window.LP = { esc: esc, safeUrl: safeUrl, qrSvg: qrSvg, list: list, post: post, koDate: koDate, toast: toast, ready: ready };
})();
