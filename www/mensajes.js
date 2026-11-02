/* P01-POMODORO · Mensajes de las notificaciones
 * Cada notificación tiene una lista de mensajes: "título / mensaje".
 * La app escoge uno al azar cada vez (sin repetir el anterior).
 * {min} se reemplaza por los minutos de la fase que sigue.
 * Para agregar o quitar mensajes, basta con editar estas listas.
 */
window.MENSAJES = {
  // 1. Quedan 30 s de Concentración
  avisoConcentracion: [
    'Quedan 30 segundos / Ya casi termina Concentración.',
    'Quedan 30 segundos / Ya casi es hora de descansar.',
    'Quedan 30 segundos / Ya casi es hora de estirar las piernas :)',
    'Quedan 30 segundos / Ya casi es hora de refrescar la mente.',
    'Quedan 30 segundos / Quizás caminar un poco te aclare la mente.',
    'Quedan 30 segundos / Termina esa idea, es hora de descansar.',
    'Quedan 30 segundos / ¿Vamos por un snack?',
    'Quedan 30 segundos / No olvides guardar tu progreso :)',
    'Quedan 30 segundos / Asegúrate de tocar algo de pasto :)',
    'Quedan 30 segundos / Ese cerebro necesita algo de circulación.',
    'Quedan 30 segundos / No olvides guardar los cambios ;)',
    'Quedan 30 segundos / Un café no vendría mal, ¿no crees?',
    'Quedan 30 segundos / He oído que estirar ayuda.',
    'Quedan 30 segundos / Un poco de aire fresco te vendría bien.',
    'Quedan 30 segundos / {min} minutos de descanso no suenan mal.',
    'Quedan 30 segundos / ¿{min} minutos de descanso alcanzan para un café?'
  ],

  // 2. Quedan 30 s de Descanso
  avisoDescanso: [
    'Quedan 30 segundos / Ya casi termina Descanso.',
    'Quedan 30 segundos / Ya casi es hora de volver.',
    'Quedan 30 segundos / Espero que lo hayas disfrutado :)',
    'Quedan 30 segundos / Descanso bastante requerido, ¿no crees?',
    'Quedan 30 segundos / Nada es para siempre…',
    'Quedan 30 segundos / Cómo vuela el tiempo…',
    'Quedan 30 segundos / Ánimo, lo estás haciendo bien ;)',
    'Quedan 30 segundos / Descuida, no es el fin del mundo :)',
    'Quedan 30 segundos / ¡¿Tan rápido?!',
    'Quedan 30 segundos / Justo y necesario.',
    'Quedan 30 segundos / Oye, tú escogiste cuánto tiempo poner, ¿ok?',
    'Quedan 30 segundos / Ese nivel tendrá que esperar…',
    'Quedan 30 segundos / Último scroll. Te lo mereces.',
    'Quedan 30 segundos / Vale, un video más…',
    'Quedan 30 segundos / Ve estirando esa espalda.',
    'Quedan 30 segundos / Quizás… ¿agregar más tiempo la próxima vez?…',
    'Quedan 30 segundos / ¡Una mente concentrada es imparable!',
    'Quedan 30 segundos / Todo lo que sube tiene que bajar…',
    'Quedan 30 segundos / De vuelta a la marcha.',
    'Quedan 30 segundos / Pon en marcha todas esas ideas frescas.',
    'Quedan 30 segundos / ¡Que esas ideas caigan al papel!'
  ],

  // 3. Quedan 30 s de Descanso largo
  avisoDescansoLargo: [
    'Quedan 30 segundos / Ya casi termina Descanso largo.',
    'Quedan 30 segundos / ¿Cómo se supone que vuelvas a trabajar?',
    'Quedan 30 segundos / ¿Dormiste bien?',
    'Quedan 30 segundos / ¿Sigues en la cafetería? ¡Vuelve al escritorio!',
    'Quedan 30 segundos / Quizás intentar dormir no fue la mejor idea…',
    'Quedan 30 segundos / Quizás intenta dormir mejor por la noche.',
    'Quedan 30 segundos / ¿Estás por ahí?',
    'Quedan 30 segundos / ¿Sigues ahí?',
    'Quedan 30 segundos / Un par de rondas más y me volverás a ver ;)',
    'Quedan 30 segundos / Así es el ciclo de la vida…',
    'Quedan 30 segundos / Cruel, pero justo.',
    'Quedan 30 segundos / ¿En dónde estabas metido? ¡Te quedan 30 segundos!',
    'Quedan 30 segundos / Te dije que no te encariñaras…',
    'Quedan 30 segundos / Espero ver ese descanso reflejado en tu trabajo.',
    'Quedan 30 segundos / Podría ser peor, ¿no?'
  ],

  // 4. Terminó Concentración, sigue Descanso
  finConcentracion: [
    '¡Tiempo de descansar! / Terminó Concentración.',
    '¡Tiempo de descansar! / Ni un clic más.',
    '¡Tiempo de descansar! / Suelta ya ese ratón.',
    '¡Tiempo de descansar! / Las manos arriba de ese teclado.',
    '¡Tiempo de descansar! / ¿Qué esperas? ¡El descanso ya empezó!',
    '¡Tiempo de descansar! / Tu cerebro lo necesita. ¿Qué esperas?',
    '¡Tiempo de descansar! / ¿A quién engaño? No necesitas alarma para esta.',
    '¡Tiempo de descansar! / Date la vuelta y empieza a caminar.',
    '¡Tiempo de descansar! / Esos {min} minutos no durarán para siempre.',
    '¡Tiempo de descansar! / ¡Hora de la aventura!',
    '¡Tiempo de descansar! / ¡¿Cómo que no has guardado los cambios todavía?!',
    '¡Tiempo de descansar! / Tic tac, tic tac, tic tac.',
    '¡Tiempo de descansar! / Estoy orgulloso de ti. ¡Ahora ve a descansar!',
    '¡Tiempo de descansar! / ¿Recuerdas ese café que te mencioné?',
    '¡Tiempo de descansar! / A descansar. No aceptaré un no como respuesta.',
    '¡Tiempo de descansar! / ¿Por qué sigues aquí? ¿Otra vez dejando las cosas para el final?',
    '¡Tiempo de descansar! / No olvides beber agua ;)',
    '¡Tiempo de descansar! / Wù jí bì fǎn.'
  ],

  // 5. Terminó Concentración, sigue Descanso largo
  finConcentracionLargo: [
    'Hora de un descanso largo / Terminó Concentración.',
    'Hora de un descanso largo / Solo no te encariñes, ¿vale?',
    'Hora de un descanso largo / ¿Crees que alcance para una siesta?',
    'Hora de un descanso largo / Un gran descanso para una gran persona.',
    'Hora de un descanso largo / Un gran esfuerzo requiere un gran descanso.',
    'Hora de un descanso largo / ¿Es esa época del año otra vez?',
    'Hora de un descanso largo / Espero que lo aproveches para moverte un poco.',
    'Hora de un descanso largo / Justo a tiempo, ¿no?',
    'Hora de un descanso largo / Disfruta tus mini vacaciones.',
    'Hora de un descanso largo / Suficiente para darle vueltas a ese problema.',
    'Hora de un descanso largo / Quizás otro ángulo te ayude a encontrar la solución.',
    'Hora de un descanso largo / A recargar esas baterías.',
    'Hora de un descanso largo / Libre albedrío… ¿Qué harás con él?',
    'Hora de un descanso largo / Disfruta tu descanso. Te lo mereces :)',
    'Hora de un descanso largo / Tiempo suficiente para crear nuevas ideas.',
    'Hora de un descanso largo / Un cerebro descansado trabaja mucho mejor.',
    'Hora de un descanso largo / ¿No te apetece comer algo?'
  ],

  // 6. Terminó el descanso (normal o largo), sigue Concentración
  finDescanso: [
    'Se acabó el descanso / Vuelve a Concentración.',
    'Se acabó el descanso / Hora de concentrarse.',
    'Se acabó el descanso / Y volvemos a la normalidad.',
    'Se acabó el descanso / Espero que te hayas hidratado :)',
    'Se acabó el descanso / ¿Encontraste la solución a ese problema?',
    'Se acabó el descanso / Fue bueno mientras duró.',
    'Se acabó el descanso / Te dije que el pasto te haría bien.',
    'Se acabó el descanso / Caminar ayuda, ¿no crees?',
    'Se acabó el descanso / ¡Con mucho ánimo! Espero…',
    'Se acabó el descanso / Pronto llegarán unas vacaciones de verdad…',
    'Se acabó el descanso / ¡Tú puedes!',
    'Se acabó el descanso / ¡Ponte en marcha!'
  ]
};
