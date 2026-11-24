/* Desktop: windows, icons, menus and boot screen.
   Without JS, or on narrow screens, every window is a normal stacked section and none of this runs. */
(function () {
  'use strict';
  var root = document.documentElement;
  var desktop = document.getElementById('desktop');
  if (!desktop) return;
  var mq = window.matchMedia('(min-width: 821px)');
  var coarse = window.matchMedia('(pointer: coarse)');
  var wins = Array.prototype.slice.call(desktop.querySelectorAll('.win'));
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-win]'));
  var icons = Array.prototype.slice.call(document.querySelectorAll('.ico'));
  var byId = {};
  wins.forEach(function (w) { byId[w.id] = w; });
  var z = 10;

  function isDesk() { return root.classList.contains('desk'); }
  function visible() { return wins.filter(function (w) { return !w.hidden; }); }
  function active() { return wins.filter(function (w) { return !w.hidden && w.classList.contains('active'); })[0]; }
  function titleOf(w) { return w.querySelector('h2').textContent; }

  /* ----- windows ----- */
  function focusWin(w) {
    wins.forEach(function (o) { o.classList.toggle('active', o === w); });
    w.style.zIndex = ++z;
  }

  function fit(w) {
    if (w.classList.contains('zoomed')) return;
    w.style.maxHeight = Math.max(160, desktop.clientHeight - w.offsetTop - 14) + 'px';
  }

  function place(w) {
    if (w.style.left) return;
    var ww = Math.min(+w.dataset.w, desktop.clientWidth - 160);
    w.style.width = ww + 'px';
    w.style.left = Math.max(8, Math.min(+w.dataset.x, desktop.clientWidth - 150 - ww)) + 'px';
    w.style.top = Math.max(6, +w.dataset.y) + 'px';
    fit(w);
  }

  function open(id) {
    var w = byId[id];
    if (!w) return;
    w.hidden = false;
    place(w);
    focusWin(w);
  }

  function close(w) {
    if (w.classList.contains('zoomed')) zoom(w);
    w.hidden = true;
    w.classList.remove('active');
    var rest = visible().sort(function (a, b) { return (+a.style.zIndex || 0) - (+b.style.zIndex || 0); });
    if (rest.length) focusWin(rest[rest.length - 1]);
  }

  function closeAll() { visible().forEach(function (w) { w.hidden = true; w.classList.remove('active'); }); }

  function zoom(w) {
    if (w.classList.contains('zoomed')) {
      var s = (w.dataset.saved || '').split('|');
      w.classList.remove('zoomed');
      w.style.left = s[0]; w.style.top = s[1]; w.style.width = s[2]; w.style.height = s[3];
      fit(w);
    } else {
      w.dataset.saved = [w.style.left, w.style.top, w.style.width, w.style.height].join('|');
      w.classList.add('zoomed');
      w.style.maxHeight = 'none';
      w.style.left = '6px'; w.style.top = '6px';
      w.style.width = (desktop.clientWidth - 150) + 'px';
      w.style.height = (desktop.clientHeight - 12) + 'px';
    }
    focusWin(w);
  }

  function resetStyles(w) {
    w.hidden = false;
    w.classList.remove('zoomed', 'active', 'drag');
    ['left', 'top', 'width', 'height', 'maxHeight', 'zIndex'].forEach(function (k) { w.style[k] = ''; });
  }

  function startWindows() {
    var start = location.hash.slice(1);
    var startIds = ['about'];
    if (byId[start] && start !== 'about') startIds.push(start);
    wins.forEach(function (w) { w.hidden = startIds.indexOf(w.id) < 0; });
    startIds.forEach(open);
  }

  function applyMode() {
    if (mq.matches) {
      root.classList.add('desk');
      startWindows();
    } else {
      root.classList.remove('desk', 'booting');
      wins.forEach(resetStyles);
    }
  }

  /* ----- icons and links ----- */
  function select(el) { icons.forEach(function (i) { i.classList.toggle('sel', i === el); }); }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!isDesk()) return;
      e.preventDefault();
      var isIcon = a.classList.contains('ico');
      /* Icons: click selects, double-click opens (keyboard Enter and touch open straight away). */
      if (isIcon && !coarse.matches && e.detail !== 0) { select(a); return; }
      if (isIcon) select(a);
      open(a.dataset.win);
      try { history.replaceState(null, '', '#' + a.dataset.win); } catch (err) {}
    });
    if (a.classList.contains('ico')) {
      a.addEventListener('dblclick', function (e) {
        if (!isDesk()) return;
        e.preventDefault();
        open(a.dataset.win);
      });
    }
  });
  desktop.addEventListener('pointerdown', function (e) { if (e.target === desktop) select(null); });

  /* ----- drag, resize, zoom ----- */
  wins.forEach(function (w) {
    var tb = w.querySelector('.tb'), grip = w.querySelector('.grip');
    var sx, sy, ox, oy, ow, oh, mode = '';
    w.addEventListener('pointerdown', function () { if (isDesk() && !w.classList.contains('active')) focusWin(w); });
    w.querySelector('.x').addEventListener('click', function () { close(w); });
    w.querySelector('.z').addEventListener('click', function () { zoom(w); });
    tb.addEventListener('dblclick', function (e) { if (isDesk() && !e.target.closest('.x,.z')) zoom(w); });

    tb.addEventListener('pointerdown', function (e) {
      if (!isDesk() || e.target.closest('.x,.z') || w.classList.contains('zoomed')) return;
      mode = 'move'; sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop;
      w.classList.add('drag');
      tb.setPointerCapture(e.pointerId);
    });
    tb.addEventListener('pointermove', function (e) {
      if (mode !== 'move') return;
      w.style.left = Math.max(-w.offsetWidth + 80, Math.min(desktop.clientWidth - 60, ox + e.clientX - sx)) + 'px';
      w.style.top = Math.max(0, Math.min(desktop.clientHeight - 30, oy + e.clientY - sy)) + 'px';
      fit(w);
    });
    function endMove() { if (mode === 'move') { mode = ''; w.classList.remove('drag'); } }
    tb.addEventListener('pointerup', endMove);
    tb.addEventListener('pointercancel', endMove);

    grip.addEventListener('pointerdown', function (e) {
      if (!isDesk()) return;
      e.stopPropagation();
      mode = 'size'; sx = e.clientX; sy = e.clientY; ow = w.offsetWidth; oh = w.offsetHeight;
      focusWin(w);
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener('pointermove', function (e) {
      if (mode !== 'size') return;
      w.style.width = Math.max(300, Math.min(ow + e.clientX - sx, desktop.clientWidth - w.offsetLeft - 8)) + 'px';
      w.style.height = Math.max(150, Math.min(oh + e.clientY - sy, desktop.clientHeight - w.offsetTop - 8)) + 'px';
    });
    function endSize() { mode = ''; }
    grip.addEventListener('pointerup', endSize);
    grip.addEventListener('pointercancel', endSize);
  });

  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    if (isDesk() && byId[id]) open(id);
  });

  /* ----- menus ----- */
  var mbs = Array.prototype.slice.call(document.querySelectorAll('.mb'));
  var openBtn = null;

  function buildWindowMenu() {
    var end = document.getElementById('win-list-end');
    var parent = end.parentNode;
    Array.prototype.slice.call(parent.querySelectorAll('.win-item')).forEach(function (n) { parent.removeChild(n); });
    var list = visible();
    if (!list.length) {
      var none = document.createElement('li');
      none.className = 'win-item'; none.setAttribute('role', 'none');
      none.innerHTML = '<button role="menuitem" type="button" disabled>No open windows</button>';
      parent.insertBefore(none, end);
    }
    list.forEach(function (w) {
      var li = document.createElement('li');
      li.className = 'win-item'; li.setAttribute('role', 'none');
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'menuitem');
      b.dataset.act = 'focus'; b.dataset.win = w.id;
      b.innerHTML = '<span class="chk">' + (w.classList.contains('active') ? '✓' : '') + '</span>';
      b.appendChild(document.createTextNode(titleOf(w)));
      li.appendChild(b);
      parent.insertBefore(li, end);
    });
  }

  function setMenu(btn) {
    mbs.forEach(function (b) {
      var on = b === btn;
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      document.getElementById(b.dataset.menu).hidden = !on;
    });
    openBtn = btn || null;
    if (btn && btn.dataset.menu === 'dd-window') buildWindowMenu();
  }

  mbs.forEach(function (b) {
    b.addEventListener('click', function () { setMenu(openBtn === b ? null : b); });
    b.addEventListener('mouseenter', function () { if (openBtn && openBtn !== b) setMenu(b); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); setMenu(b);
        var f = document.getElementById(b.dataset.menu).querySelector('button:not(:disabled)'); if (f) f.focus();
      }
    });
  });
  document.addEventListener('pointerdown', function (e) { if (openBtn && !e.target.closest('.mwrap')) setMenu(null); });
  document.addEventListener('keydown', function (e) {
    if (!openBtn) return;
    var dd = document.getElementById(openBtn.dataset.menu);
    var items = Array.prototype.slice.call(dd.querySelectorAll('button:not(:disabled)'));
    var i = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { var b = openBtn; setMenu(null); b.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      var k = mbs.indexOf(openBtn), n = mbs[(k + (e.key === 'ArrowRight' ? 1 : -1) + mbs.length) % mbs.length];
      setMenu(n); var f = document.getElementById(n.dataset.menu).querySelector('button:not(:disabled)'); if (f) f.focus();
    }
  });
  Array.prototype.slice.call(document.querySelectorAll('.dd')).forEach(function (dd) {
    dd.addEventListener('click', function (e) {
      var item = e.target.closest('button[data-act]');
      if (!item) return;
      var act = item.dataset.act, a = active();
      setMenu(null);
      if (act === 'open' || act === 'focus') open(item.dataset.win);
      else if (act === 'close' && a) close(a);
      else if (act === 'zoom' && a) zoom(a);
      else if (act === 'closeall') closeAll();
      else if (act === 'restart') restart();
    });
  });

  /* ----- boot screen ----- */
  var bootDone = true;
  function boot(done) {
    var el = document.getElementById('boot');
    if (!el || !mq.matches) { if (done) done(); return; }
    var fill = document.getElementById('boot-fill'), msg = document.getElementById('boot-msg');
    var steps = ['Checking memory…', 'Mounting Samir HD…', 'Loading extensions…', 'Starting desktop…'];
    var t0 = performance.now(), dur = 1800, finished = false;
    root.classList.add('booting');
    bootDone = false;
    function finish() {
      if (finished) return;
      finished = true; bootDone = true;
      root.classList.remove('booting');
      try { sessionStorage.setItem('booted', '1'); } catch (e) {}
      document.removeEventListener('keydown', finish);
      el.removeEventListener('click', finish);
      if (done) done();
    }
    function frame(now) {
      if (finished) return;
      var p = Math.min(1, (now - t0) / dur);
      fill.style.width = (Math.floor(p * 20) / 20 * 100) + '%';
      msg.textContent = steps[Math.min(steps.length - 1, Math.floor(p * steps.length))];
      if (p < 1) requestAnimationFrame(frame); else setTimeout(finish, 250);
    }
    requestAnimationFrame(frame);
    el.addEventListener('click', finish);
    document.addEventListener('keydown', finish);
  }

  function restart() {
    closeAll();
    wins.forEach(function (w) { ['left', 'top', 'width', 'height', 'maxHeight'].forEach(function (k) { w.style[k] = ''; }); w.classList.remove('zoomed'); });
    boot(function () { startWindows(); });
  }

  applyMode();
  if (root.classList.contains('booting')) boot(function () {});
  if (mq.addEventListener) mq.addEventListener('change', applyMode);
})();
