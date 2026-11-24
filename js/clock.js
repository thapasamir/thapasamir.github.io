/* Menu-bar clock, shows Kathmandu time. */
(function () {
  var el = document.getElementById('clock');
  if (!el) return;
  function tick() {
    try {
      el.textContent = 'KTM ' + new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date());
    } catch (e) { el.textContent = ''; }
  }
  tick();
  setInterval(tick, 30000);
})();
