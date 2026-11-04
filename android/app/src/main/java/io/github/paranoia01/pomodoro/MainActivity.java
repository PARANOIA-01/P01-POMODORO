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

    // Deben coincidir con www/app.js: la alarma usa el canal "alarma-v3-<tono>" y el aviso CH_WARN.
    // Los ids y nombres son los de www/tonos.js; cada tono tiene su archivo res/raw/tono_<id>.wav.
    static final String CH_ALARM_PREFIX = "alarma-v3-";
    static final String CH_WARN = "aviso-v3";
    static final String[][] TONOS = {
        { "clasico", "Clásico" }, { "campanita", "Campanita" }, { "timbre", "Timbre" },
        { "pajaritos", "Pajaritos" }, { "cajita", "Cajita musical" }, { "recepcion", "Recepción" },
        { "ascensor", "Ascensor" }, { "juntas", "Sala de juntas" }, { "piano", "Piano suave" },
        { "vibrafono", "Vibráfono" }, { "recordatorio", "Recordatorio" }, { "calendario", "Calendario" },
        { "madera", "Madera" }, { "tarea", "Tarea lista" }, { "cafe", "Café" }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
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

        AudioAttributes alarmAudio = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        for (String[] tono : TONOS) {
            Uri sound = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/tono_" + tono[0]);
            NotificationChannel alarm = new NotificationChannel(CH_ALARM_PREFIX + tono[0], "Alarma: " + tono[1], NotificationManager.IMPORTANCE_HIGH);
            alarm.setDescription("Suena cuando termina Concentración o Descanso con el tono " + tono[1]);
            alarm.setSound(sound, alarmAudio);
            alarm.enableVibration(true);
            alarm.setVibrationPattern(new long[] { 0, 800, 300, 800, 300, 800 });
            alarm.setBypassDnd(true);
            nm.createNotificationChannel(alarm);
        }

        NotificationChannel warn = new NotificationChannel(CH_WARN, "Aviso de 30 segundos", NotificationManager.IMPORTANCE_HIGH);
        warn.setDescription("Vibra 30 segundos antes de que termine Concentración y Descanso");
        warn.setSound(null, null);
        warn.enableVibration(true);
        warn.setVibrationPattern(new long[] { 0, 400, 200, 400, 200, 400 });
        nm.createNotificationChannel(warn);
    }
}
