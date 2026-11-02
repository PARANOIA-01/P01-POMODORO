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
    var osc = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + at;
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

  var C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880, B5 = 987.77, C6 = 1046.5, E6 = 1318.5, G4 = 392, E4 = 329.63, C4 = 261.63;

  window.TONOS = [
    { id: 'clasico', nombre: 'Clásico', desc: 'Cuatro pitidos fuertes', play: function (c, o) {
      for (var i = 0; i < 4; i++) note(c, o, 880, i * 0.5, 0.35, { wave: 'square' });
    } },
    { id: 'digital', nombre: 'Reloj digital', desc: 'Bip-bip como un reloj de pulsera', play: function (c, o) {
      for (var r = 0; r < 4; r++) for (var i = 0; i < 2; i++) note(c, o, 2093, r * 0.6 + i * 0.13, 0.08, { wave: 'square', vol: 0.12, att: 0.003 });
    } },
    { id: 'campanita', nombre: 'Campanita', desc: 'Tres campanadas suaves', play: function (c, o) {
      for (var i = 0; i < 3; i++) bell(c, o, E6, i * 0.7, 1.2, 0.2);
    } },
    { id: 'timbre', nombre: 'Timbre', desc: 'Ding-dong, dos veces', play: function (c, o) {
      bell(c, o, E5, 0, 1.0); bell(c, o, C5, 0.5, 1.4); bell(c, o, E5, 1.6, 1.0); bell(c, o, C5, 2.1, 1.6);
    } },
    { id: 'marimba', nombre: 'Marimba', desc: 'Una melodía alegre de madera', play: function (c, o) {
      var m = [C5, E5, G5, C6, G5, E5, G5, C6];
      m.forEach(function (f, i) { note(c, o, f, i * 0.18, 0.35, { wave: 'triangle', vol: 0.35, att: 0.004 }); });
    } },
    { id: 'amanecer', nombre: 'Amanecer', desc: 'Notas que suben poco a poco', play: function (c, o) {
      [C4, E4, G4, C5, E5, G5, C6].forEach(function (f, i) { note(c, o, f, i * 0.28, 0.9, { vol: 0.2, att: 0.08 }); });
    } },
    { id: 'retro', nombre: 'Videojuego', desc: 'Musiquita de 8 bits: nivel superado', play: function (c, o) {
      var m = [[G5, 0.1], [C6, 0.1], [E6, 0.1], [G5, 0.1], [C6, 0.1], [E6, 0.45]], at = 0;
      m.forEach(function (n) { note(c, o, n[0], at, n[1], { wave: 'square', vol: 0.1, att: 0.003 }); at += n[1] + 0.02; });
      note(c, o, C6, at + 0.15, 0.6, { wave: 'square', vol: 0.1 });
    } },
    { id: 'pajaritos', nombre: 'Pajaritos', desc: 'Pío-pío que suben y bajan', play: function (c, o) {
      for (var i = 0; i < 6; i++) {
        var at = i * 0.32 + (i % 2) * 0.05;
        note(c, o, 2600, at, 0.09, { to: 4200, vol: 0.12, att: 0.005 });
        note(c, o, 3800, at + 0.1, 0.08, { to: 2400, vol: 0.1, att: 0.005 });
      }
    } },
    { id: 'gong', nombre: 'Gong', desc: 'Un golpe grave y profundo', play: function (c, o) {
      note(c, o, 110, 0, 3.0, { vol: 0.4, att: 0.005 });
      note(c, o, 164.8, 0, 2.4, { vol: 0.18, att: 0.005 });
      note(c, o, 293, 0, 1.4, { vol: 0.08, att: 0.005 });
      note(c, o, 412, 0, 0.8, { vol: 0.05, att: 0.005 });
    } },
    { id: 'cajita', nombre: 'Cajita musical', desc: 'Una melodía tierna y lenta', play: function (c, o) {
      var m = [E6, D5 * 2, C6, D5 * 2, E6, E6, E6];
      m.forEach(function (f, i) { bell(c, o, f, i * 0.3, 0.8, 0.14); });
    } },
    { id: 'sirena', nombre: 'Sirena', desc: 'Sube y baja, imposible ignorarla', play: function (c, o) {
      for (var i = 0; i < 3; i++) { note(c, o, 600, i * 0.9, 0.45, { to: 1200, wave: 'sawtooth', vol: 0.08, att: 0.02 }); note(c, o, 1200, i * 0.9 + 0.45, 0.45, { to: 600, wave: 'sawtooth', vol: 0.08 }); }
    } },
    { id: 'suave', nombre: 'Suave', desc: 'Un acorde tranquilo, sin sustos', play: function (c, o) {
      [[C5, E5, G5], [F5, A5, C6], [G5, B5, D5 * 2], [C5, E5, G5 * 2]].forEach(function (ch, i) {
        ch.forEach(function (f) { note(c, o, f, i * 0.6, 1.1, { vol: 0.07, att: 0.1 }); });
      });
    } }
  ];
})();
