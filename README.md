# P01-TOMATO

Temporizador para estudiar y trabajar con el método Pomodoro, sin anuncios ni suscripciones.

- **Concentración** y **Descanso** se encadenan solos, con duraciones ajustables.
- **Descanso largo** cada 4 rondas (puedes cambiar el número): por defecto dura el doble del descanso y se ajusta solo.
- Avisa 30 segundos antes de que termine cada temporizador y suena una alarma al terminar, también con el celular bloqueado.
- **15 tonos** de alarma para elegir, desde unos alegres hasta otros tranquilos para la oficina.
- Mensajes distintos en cada notificación, para sacarte una sonrisa.
- Cuenta las rondas del día.
- Reloj con forma de tomate de cocina que gira con el tiempo que queda.
- Si cierras la app o la pestaña, el temporizador queda en pausa.

## Usar

- **Web (computador):** abre [paranoia-01.github.io/P01-TOMATO](https://paranoia-01.github.io/P01-TOMATO/) en Chrome o Edge. Para tenerla como app, usa “Instalar app” en la barra de direcciones.
- **Android:** en [Releases](../../releases/latest) descarga el archivo `.apk` desde el celular y ábrelo. La primera vez, Android pide permitir instalar apps de esta fuente.

## Versiones

Cada cambio sube un decimal: V2.5, V2.6, V2.7… La versión actual aparece al pie de la app.

## Cómo está hecha

- `www/`: la app (HTML, CSS y JavaScript). Es la misma en Android y en el navegador.
  - `mensajes.js`: los textos de las notificaciones.
  - `tonos.js`: los tonos de alarma, creados con código (sin archivos de audio).
- `android/`: el proyecto Android hecho con [Capacitor](https://capacitorjs.com). Las alarmas se programan como las de un despertador para que suenen a la hora exacta.
- `.github/workflows/android.yml`: arma el APK firmado y lo publica en Releases.
- `.github/workflows/web.yml`: publica la versión web en GitHub Pages.

Hecha por [PARANOIA-01](https://github.com/PARANOIA-01).
