/* P01-POMODORO · Tonos de alarma
 * Cada tono se "dibuja" con notas (frecuencia, inicio, duración, tipo de onda).
 * No usa archivos de audio: el navegador genera el sonido.
 * Para crear un tono nuevo, copia uno de la lista y cambia sus notas.
 */
(function () {
  // Toca una nota. f = frecuencia (Hz), at = segundo en que empieza, d = duración,
  // o = opciones: wave (sine, square, triangle, sawtooth), vol, to (frecuencia final, para deslizar), att (ataque)
  function note(ctx, out, f, at, d, o) {
    o = o || {};
    var osc = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + 0.03 + at;
    osc.type = o.wave || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + d);
    var vol = o.vol || 0.25, att = o.att || 0.01;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    osc.connect(g); g.connect(out); osc.start(t0); osc.stop(t0 + d + 0.05);
  }
  // Campana: una nota con armónicos que se apagan despacio
  function bell(ctx, out, f, at, d, vol) {
    note(ctx, out, f, at, d, { vol: vol || 0.22 });
    note(ctx, out, f * 2.01, at, d * 0.6, { vol: (vol || 0.22) * 0.35 });
    note(ctx, out, f * 3.0, at, d * 0.35, { vol: (vol || 0.22) * 0.15 });
  }
  // Campana suave (tonos de oficina): armónicos más discretos
  function bellSoft(ctx, out, f, at, d, vol) {
    vol = vol || 0.18;
    note(ctx, out, f, at, d, { vol: vol, att: 0.008 });
    note(ctx, out, f * 2, at, d * 0.55, { vol: vol * 0.3, att: 0.008 });
    note(ctx, out, f * 3.01, at, d * 0.3, { vol: vol * 0.12, att: 0.008 });
  }
  // Marimba / madera: ataque seco con un poco de cuerpo
  function mallet(ctx, out, f, at, d, vol) {
    vol = vol || 0.3;
    note(ctx, out, f, at, d, { wave: 'triangle', vol: vol, att: 0.003 });
    note(ctx, out, f * 4, at, 0.05, { vol: vol * 0.25, att: 0.002 });
  }

  var C4 = 261.63, D4 = 293.66, Fs4 = 369.99, A4 = 440, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46,
    G5 = 783.99, A5 = 880, Bb5 = 932.33, C6 = 1046.5, E6 = 1318.5, G6 = 1568;

  window.TONOS = [
    { id: 'clasico', nombre: 'Clásico', desc: 'Cuatro pitidos fuertes', play: function (c, o) {
      for (var i = 0; i < 4; i++) note(c, o, 880, i * 0.5, 0.35, { wave: 'square' });
    } },
    { id: 'campanita', nombre: 'Campanita', desc: 'Tres campanadas suaves', play: function (c, o) {
      for (var i = 0; i < 3; i++) bell(c, o, E6, i * 0.7, 1.2, 0.2);
    } },
    { id: 'timbre', nombre: 'Timbre', desc: 'Ding-dong, dos veces', play: function (c, o) {
      bell(c, o, E5, 0, 1.0); bell(c, o, C5, 0.5, 1.4); bell(c, o, E5, 1.6, 1.0); bell(c, o, C5, 2.1, 1.6);
    } },
    { id: 'pajaritos', nombre: 'Pajaritos', desc: 'Pío-pío que suben y bajan', play: function (c, o) {
      for (var i = 0; i < 6; i++) {
        var at = i * 0.32 + (i % 2) * 0.05;
        note(c, o, 2600, at, 0.09, { to: 4200, vol: 0.12, att: 0.005 });
        note(c, o, 3800, at + 0.1, 0.08, { to: 2400, vol: 0.1, att: 0.005 });
      }
    } },
    { id: 'cajita', nombre: 'Cajita musical', desc: 'Una melodía tierna y lenta', play: function (c, o) {
      [E6, D5 * 2, C6, D5 * 2, E6, E6, E6].forEach(function (f, i) { bell(c, o, f, i * 0.3, 0.8, 0.14); });
    } },
    { id: 'recepcion', nombre: 'Recepción', desc: 'Dos campanas que suben, como el timbre de un mostrador', play: function (c, o) {
      bellSoft(c, o, G5, 0, 1.0); bellSoft(c, o, C6, 0.22, 1.2);
    } },
    { id: 'ascensor', nombre: 'Ascensor', desc: 'Tres notas que se encadenan: llegaste a tu piso', play: function (c, o) {
      bellSoft(c, o, C5, 0, 1.0, 0.16); bellSoft(c, o, E5, 0.18, 1.0, 0.16); bellSoft(c, o, G5, 0.36, 1.3, 0.16);
    } },
    { id: 'juntas', nombre: 'Sala de juntas', desc: 'Marimba que baja con calma', play: function (c, o) {
      mallet(c, o, G5, 0, 0.5); mallet(c, o, E5, 0.16, 0.5); mallet(c, o, C5, 0.32, 0.8);
    } },
    { id: 'piano', nombre: 'Piano suave', desc: 'Un acorde abierto, nota por nota', play: function (c, o) {
      [C5, E5, G5, C6].forEach(function (f, i) {
        note(c, o, f, i * 0.12, 1.4 - i * 0.1, { vol: 0.13, att: 0.01 });
        note(c, o, f * 2, i * 0.12, 0.5, { vol: 0.03, att: 0.01 });
      });
    } },
    { id: 'vibrafono', nombre: 'Vibráfono', desc: 'Notas metálicas y redondas, estilo jazz', play: function (c, o) {
      [F5, A5, C6].forEach(function (f, i) { bellSoft(c, o, f, i * 0.2, 1.3, 0.12); note(c, o, f * 4, i * 0.2, 0.08, { vol: 0.02, att: 0.008 }); });
    } },
    { id: 'recordatorio', nombre: 'Recordatorio', desc: 'Tres toques iguales y suaves', play: function (c, o) {
      for (var i = 0; i < 3; i++) note(c, o, A5, i * 0.22, 0.2, { vol: 0.15, att: 0.008 });
    } },
    { id: 'calendario', nombre: 'Calendario', desc: 'Dos notas tranquilas: tienes una cita', play: function (c, o) {
      note(c, o, F5, 0, 0.5, { vol: 0.16, att: 0.02 }); note(c, o, Bb5, 0.25, 0.8, { vol: 0.16, att: 0.02 });
    } },
    { id: 'madera', nombre: 'Madera', desc: 'Tres golpecitos en un bloque de madera', play: function (c, o) {
      [0, 0.15, 0.3].forEach(function (at, i) { note(c, o, i === 2 ? 900 : 1100, at, 0.07, { wave: 'triangle', vol: 0.3, att: 0.002 }); });
    } },
    { id: 'tarea', nombre: 'Tarea lista', desc: 'Subida corta y satisfactoria', play: function (c, o) {
      mallet(c, o, C6, 0, 0.3, 0.22); mallet(c, o, E6, 0.09, 0.3, 0.22); mallet(c, o, G6, 0.18, 0.6, 0.22);
    } },
    { id: 'cafe', nombre: 'Café', desc: 'Arpegio cálido y grave, sin prisa', play: function (c, o) {
      [D4, Fs4, A4, D5].forEach(function (f, i) { mallet(c, o, f, i * 0.14, 0.9, 0.26); });
    } }
  ];
})();
