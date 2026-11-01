# P01-POMODORO

Temporizador Pomodoro para estudiar, sin anuncios ni suscripciones.

- **Concentración** y **Descanso** se encadenan solos, con duraciones ajustables.
- **Descanso largo** cada 4 rondas: por defecto dura el doble del descanso y se ajusta solo.
- Vibra 30 segundos antes de que termine Concentración y suena una alarma al terminar cada temporizador, también con el celular bloqueado.
- Cuenta las rondas del día.
- Reloj con forma de tomate de cocina que gira con el tiempo que queda.

## Instalar

- **Android:** en [Releases](../../releases/latest) descarga el archivo `.apk` desde el celular y ábrelo. La primera vez, Android pide permitir instalar apps de esta fuente.
- **Portátil (Windows):** abre la versión web en Chrome o Edge y usa “Instalar app” en la barra de direcciones.

## Versiones

Cada cambio sube un decimal: V1.0, V1.1, V1.2… La versión actual aparece al pie de la app.

## Cómo está hecha

- `www/`: la app (HTML, CSS y JavaScript). Es la misma en Android y en el navegador.
- `android/`: el proyecto Android generado con [Capacitor](https://capacitorjs.com). Las alarmas usan notificaciones locales programadas en el sistema.
- `.github/workflows/android.yml`: arma el APK firmado y lo publica en Releases en cada cambio.
- `.github/workflows/web.yml`: publica la versión web en GitHub Pages.
