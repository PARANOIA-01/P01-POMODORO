package io.github.paranoia01.pomodoro;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Deben coincidir con www/app.js. El tono lo toca AlarmaReceiver (res/raw/tono_<id>.wav);
    // el canal de la alarma solo muestra la notificación y vibra.
    static final String CH_ALARM_PREFIX = "alarma-v4";
    static final String CH_WARN = "aviso-v3";
    static final String[] TONOS_V3 = {
        "clasico", "campanita", "timbre", "pajaritos", "cajita", "recepcion", "ascensor", "juntas",
        "piano", "vibrafono", "recordatorio", "calendario", "madera", "tarea", "cafe"
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AlarmasPlugin.class);
        super.onCreate(savedInstanceState);
        createChannels();
    }

    // Los canales se crean aquí y no desde JavaScript porque el plugin usa el volumen de
    // notificaciones, que se silencia con el celular en vibración. La alarma usa el volumen
    // de alarma, como un despertador.
    private void createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null) return;

        for (String old : new String[] { "alarma-v1", "aviso-v1", "alarma-v2", "aviso-v2" }) nm.deleteNotificationChannel(old);
        for (String t : TONOS_V3) nm.deleteNotificationChannel("alarma-v3-" + t); // V2.2-V2.3: un canal con sonido por tono

        NotificationChannel alarm = new NotificationChannel(CH_ALARM_PREFIX, "Alarma de fin de temporizador", NotificationManager.IMPORTANCE_HIGH);
        alarm.setDescription("Avisa cuando termina Concentración o Descanso (el tono se elige dentro de la app)");
        alarm.setSound(null, null);
        alarm.enableVibration(true);
        alarm.setVibrationPattern(new long[] { 0, 800, 300, 800 });
        alarm.setBypassDnd(true);
        nm.createNotificationChannel(alarm);

        NotificationChannel warn = new NotificationChannel(CH_WARN, "Aviso de 30 segundos", NotificationManager.IMPORTANCE_HIGH);
        warn.setDescription("Vibra 30 segundos antes de que termine Concentración y Descanso");
        warn.setSound(null, null);
        warn.enableVibration(true);
        warn.setVibrationPattern(new long[] { 0, 400, 200, 400, 200, 400 });
        nm.createNotificationChannel(warn);

        NotificationChannel curso = new NotificationChannel(TemporizadorService.CH, "Temporizador en curso", NotificationManager.IMPORTANCE_LOW);
        curso.setDescription("Muestra la cuenta atrás mientras el temporizador corre");
        curso.setSound(null, null);
        curso.enableVibration(false);
        curso.setShowBadge(false);
        nm.createNotificationChannel(curso);
    }
}
