/* P01-POMODORO
 * Temporizador Pomodoro: Concentración y Descanso encadenados, descanso largo cada 4 rondas.
 * En Android (Capacitor) las alarmas se programan en el sistema con notificaciones locales,
 * así suenan y vibran aunque el celular esté bloqueado. En el navegador (portátil) suenan
 * mientras la página esté abierta.
 */
(function () {
  'use strict';

  var VERSION = 'V1.5';
  var SETTINGS_KEY = 'p01-pomodoro-ajustes';
  var TIMER_KEY = 'p01-pomodoro-temporizador';
  var WARN_MS = 30000;          // aviso antes de terminar (Android: solo Concentración; web: todas las fases)
  var HORIZON = 16;             // fases que se dejan programadas por adelantado
  var NAMES = { focus: 'Concentración', brk: 'Descanso', long: 'Descanso largo' };

  var Cap = window.Capacitor;
  var isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  var LN = isNative && Cap.Plugins ? Cap.Plugins.LocalNotifications : null;
  var AppPlugin = isNative && Cap.Plugins ? Cap.Plugins.App : null;

  var $ = function (id) { return document.getElementById(id); };

  // ---------- Estado guardado ----------
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || 'null'); return v ? Object.assign(fallback, v) : fallback; }
    catch (e) { return fallback; }
  }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  var s = load(SETTINGS_KEY, { focus: 25, brk: 5, long: null, rounds: 4, todayDate: '', todayCount: 0 });
  if (!s.rounds) s.rounds = 4;
  var t = load(TIMER_KEY, { phase: 'focus', round: 1, running: false, endAt: 0, remainingMs: null, warned: false });

  function saveAll() { store(SETTINGS_KEY, s); store(TIMER_KEY, t); }
  function longMin() { return s.long == null ? s.brk * 2 : s.long; }
  function phaseMs(p) { return (p === 'focus' ? s.focus : p === 'brk' ? s.brk : longMin()) * 60000; }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function checkDay() { if (s.todayDate !== todayStr()) { s.todayDate = todayStr(); s.todayCount = 0; } }
  if (t.remainingMs == null) t.remainingMs = phaseMs(t.phase);

  // La fase que sigue a (phase, round)
  function nextOf(phase, round) {
    if (phase === 'focus') return { phase: round >= s.rounds ? 'long' : 'brk', round: round };
    return { phase: 'focus', round: phase === 'long' ? 1 : round + 1 };
  }

  // ---------- Reloj ----------
  function remaining(now) { return t.running ? t.endAt - now : t.remainingMs; }

  // Avanza las fases que ya terminaron (también las que pasaron con la app cerrada)
  function catchUp(now) {
    var crossed = [];
    while (t.running && now >= t.endAt) {
      if (t.phase === 'focus') { checkDay(); s.todayCount++; }
      crossed.push({ phase: t.phase, at: t.endAt });
      var n = nextOf(t.phase, t.round);
      t.phase = n.phase; t.round = n.round;
      t.endAt += phaseMs(t.phase);
      t.warned = false;
    }
    if (crossed.length) saveAll();
    return crossed;
  }

  // ---------- Sonido y vibración en el navegador ----------
  var audioCtx = null;
  function beep(times, freq) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var t0 = audioCtx.currentTime;
      for (var i = 0; i < times; i++) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain(), st = t0 + i * 0.5;
        o.type = 'square'; o.frequency.value = freq || 880;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.25, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.35);
        o.connect(g); g.connect(audioCtx.destination); o.start(st); o.stop(st + 0.4);
      }
    } catch (e) {}
  }
  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function webNotify(title, body) {
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body: body, icon: 'icon-192.png' }); } catch (e) {}
  }
  function endMessage(endedPhase) {
    if (endedPhase === 'focus') return { title: '¡Tiempo de descanso!', body: 'Terminó Concentración. Sigue: ' + NAMES[t.phase] + '.' };
    return { title: 'Se acabó el descanso', body: 'Vuelve a Concentración.' };
  }

  var wakeLock = null;
  async function keepAwake(on) {
    if (isNative) return;
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', function () { wakeLock = null; });
      }
      if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) {}
  }

  // ---------- Alarmas del sistema (Android) ----------
  // Los canales los crea MainActivity.java (la alarma usa el volumen de alarma)
  var CH_ALARM = 'alarma-v2', CH_WARN = 'aviso-v2';
  var nativeReady = Promise.resolve();

  async function ensurePermissions() {
    if (LN) {
      try {
        var p = await LN.checkPermissions();
        if (p.display !== 'granted') p = await LN.requestPermissions();
        if (p.display !== 'granted') { showBanner('Sin permiso de notificaciones, la alarma no puede sonar con el celular bloqueado.', 'Dar permiso', ensurePermissions); return; }
        var ex = await LN.checkExactNotificationSetting();
        if (ex.exact_alarm !== 'granted') {
          showBanner('Para que la alarma suene a la hora exacta, activa "Alarmas y recordatorios" para esta app.', 'Abrir ajustes', async function () { await LN.changeExactNotificationSetting(); hideBanner(); });
          return;
        }
        hideBanner();
      } catch (e) {}
    } else if ('Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch (e) {}
    }
  }

  var scheduling = Promise.resolve();
  function reschedule() {
    if (!LN) return;
    scheduling = scheduling.then(async function () {
      await nativeReady;
      try {
        var pending = await LN.getPending();
        if (pending.notifications && pending.notifications.length) {
          await LN.cancel({ notifications: pending.notifications.map(function (n) { return { id: n.id }; }) });
        }
        if (!t.running) return;
        var list = [], id = 1, now = Date.now();
        var phase = t.phase, round = t.round, end = t.endAt;
        for (var i = 0; i < HORIZON; i++) {
          var n = nextOf(phase, round);
          if (phase === 'focus' && end - WARN_MS > now + 1000 && phaseMs('focus') > WARN_MS) {
            list.push({ id: id++, title: 'Quedan 30 segundos', body: 'Prepárate, ya casi termina Concentración.', channelId: CH_WARN, schedule: { at: new Date(end - WARN_MS), allowWhileIdle: true } });
          }
          if (end > now + 500) {
            list.push({
              id: id++,
              title: phase === 'focus' ? '¡Tiempo de descanso!' : 'Se acabó el descanso',
              body: phase === 'focus' ? 'Sigue: ' + NAMES[n.phase] + ' (' + Math.round(phaseMs(n.phase) / 60000) + ' min).' : 'Vuelve a Concentración (' + s.focus + ' min).',
              channelId: CH_ALARM,
              schedule: { at: new Date(end), allowWhileIdle: true }
            });
          }
          phase = n.phase; round = n.round; end += phaseMs(phase);
        }
        if (list.length) await LN.schedule({ notifications: list });
      } catch (e) { console.error('No se pudieron programar las alarmas', e); }
    });
  }

  // ---------- Pantalla ----------
  (function buildTicks() {
    var out = '';
    for (var m = 0; m < 60; m++) {
      var a = -m * 6 * Math.PI / 180, big = m % 5 === 0, r1 = big ? 66 : 72, r2 = 80;
      out += '<line x1="' + (150 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (168 - r1 * Math.cos(a)).toFixed(1) +
        '" x2="' + (150 + r2 * Math.sin(a)).toFixed(1) + '" y2="' + (168 - r2 * Math.cos(a)).toFixed(1) +
        '" stroke="#1E2328" stroke-width="' + (big ? 2.2 : 1) + '" stroke-linecap="round"/>';
      if (big) {
        out += '<text x="' + (150 + 56 * Math.sin(a)).toFixed(1) + '" y="' + (168 - 56 * Math.cos(a) + 4).toFixed(1) +
          '" font-size="11" font-weight="600" text-anchor="middle" fill="#1E2328" font-family="system-ui, sans-serif">' + m + '</text>';
      }
    }
    $('ticks').innerHTML = out;
  })();

  function fmt(ms) {
    var x = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(x / 60), sec = x % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  var banner = { onClick: null };
  function showBanner(text, btn, onClick) { $('banner-text').textContent = text; $('banner-btn').textContent = btn; banner.onClick = onClick; $('banner').hidden = false; }
  function hideBanner() { $('banner').hidden = true; }
  $('banner-btn').addEventListener('click', function () { if (banner.onClick) banner.onClick(); });

  function render() {
    var rem = remaining(Date.now());
    checkDay();
    $('time').textContent = fmt(rem);
    $('phase').innerHTML = '<b>' + NAMES[t.phase] + '</b>';
    $('round-now').textContent = t.round;
    $('start').textContent = t.running ? 'Pausar' : (rem < phaseMs(t.phase) ? 'Seguir' : 'Empezar');
    $('today').textContent = s.todayCount;
    $('dial').style.transform = 'rotate(' + (Math.min(60, Math.max(0, rem) / 60000) * 6) + 'deg)';
    document.title = (t.running ? fmt(rem) + ' · ' : '') + 'P01-POMODORO';
    if (document.activeElement !== $('in-focus')) $('in-focus').value = s.focus;
    if (document.activeElement !== $('in-break')) $('in-break').value = s.brk;
    if (document.activeElement !== $('in-long')) $('in-long').value = longMin();
    if (document.activeElement !== $('in-rounds')) $('in-rounds').value = s.rounds;
    $('long-hint').textContent = s.long == null ? 'El doble del descanso' : 'Ajustado a mano';
  }

  // ---------- Bucle ----------
  var tickId = null;
  function tick() {
    var now = Date.now();
    var crossed = catchUp(now);
    if (crossed.length && !isNative) {
      var last = crossed[crossed.length - 1];
      if (now - last.at < 3000) { // terminó justo ahora, no hace horas
        beep(4); vibrate([800, 300, 800]);
        var msg = endMessage(last.phase); webNotify(msg.title, msg.body);
      }
    }
    if (crossed.length && isNative) reschedule();
    if (t.running && !t.warned && (t.phase === 'focus' || !isNative)) {
      var rem = t.endAt - now;
      if (rem <= WARN_MS && rem > 0) {
        t.warned = true; saveAll();
        if (!isNative) {
          vibrate([400, 200, 400, 200, 400]);
          if (!('vibrate' in navigator)) beep(1, 660);
          webNotify('Quedan 30 segundos', 'Ya casi termina ' + NAMES[t.phase] + '.');
        }
      }
    }
    render();
  }
  function loop(on) { clearInterval(tickId); tickId = on ? setInterval(tick, 250) : null; }

  function start() {
    beep(0); // desbloquea el audio con el toque del usuario
    t.running = true; t.endAt = Date.now() + t.remainingMs;
    t.warned = t.remainingMs <= WARN_MS;
    saveAll(); loop(true); keepAwake(true); ensurePermissions(); reschedule(); render();
  }
  function pause() {
    t.remainingMs = Math.max(0, t.endAt - Date.now()); t.running = false;
    saveAll(); loop(false); keepAwake(false); reschedule(); render();
  }
  function goNext() {
    var wasRunning = t.running;
    if (t.phase === 'focus') { checkDay(); s.todayCount++; }
    var n = nextOf(t.phase, t.round);
    t.phase = n.phase; t.round = n.round; t.warned = false;
    t.remainingMs = phaseMs(t.phase);
    if (wasRunning) t.endAt = Date.now() + t.remainingMs;
    saveAll(); reschedule(); render();
  }
  function reset() {
    t = { phase: 'focus', round: 1, running: false, endAt: 0, remainingMs: phaseMs('focus'), warned: false };
    saveAll(); loop(false); keepAwake(false); reschedule(); render();
  }

  $('start').addEventListener('click', function () { if (t.running) pause(); else start(); });
  $('skip').addEventListener('click', goNext);
  $('reset').addEventListener('click', reset);

  // ---------- Ajustes ----------
  function setVal(key, v) {
    v = Math.round(Number(v));
    if (!isFinite(v) || v < 1) v = 1;
    if (v > 120) v = 120;
    // ¿la fase actual está sin empezar? entonces toma la nueva duración
    var fresh = !t.running && t.remainingMs === phaseMs(t.phase);
    if (key === 'rounds') v = Math.min(v, 12);
    if (key === 'long') s.long = (v === s.brk * 2) ? null : v;
    else s[key] = v;
    if (key === 'rounds' && t.round > s.rounds) t.round = s.rounds;
    if (fresh) t.remainingMs = phaseMs(t.phase);
    saveAll(); reschedule(); render();
  }
  document.querySelectorAll('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.step, cur = k === 'long' ? longMin() : s[k];
      setVal(k, cur + Number(b.dataset.d));
    });
  });
  $('in-focus').addEventListener('change', function (e) { setVal('focus', e.target.value); });
  $('in-break').addEventListener('change', function (e) { setVal('brk', e.target.value); });
  $('in-long').addEventListener('change', function (e) { setVal('long', e.target.value); });
  $('in-rounds').addEventListener('change', function (e) { setVal('rounds', e.target.value); });
  $('in-rounds').addEventListener('focus', function (e) { e.target.select(); });
  $('in-rounds').addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.blur(); });

  // ---------- Volver a la app ----------
  function onResume() {
    tick();
    if (t.running) { keepAwake(true); reschedule(); }
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') onResume(); });
  if (AppPlugin) { try { AppPlugin.addListener('appStateChange', function (st) { if (st.isActive) onResume(); }); } catch (e) {} }

  // ---------- Inicio ----------
  $('version').textContent = VERSION;
  $('note').textContent = isNative
    ? 'Vibra 30 segundos antes de que termine Concentración y suena una alarma al terminar cada temporizador, aunque el celular esté bloqueado o en vibración.'
    : 'Te notifica 30 segundos antes de que termine Concentración y Descanso. Suena una alarma al terminar cada temporizador.';
  catchUp(Date.now());
  if (t.running) { loop(true); reschedule(); }
  if (LN) ensurePermissions();
  render();

  if (!isNative && 'serviceWorker' in navigator && location.protocol === 'https:') {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function () {});
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (hadController) location.reload(); });
  }
})();
