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

    // Deben coincidir con CH_ALARM y CH_WARN en www/app.js
    static final String CH_ALARM = "alarma-v2";
    static final String CH_WARN = "aviso-v2";

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

        nm.deleteNotificationChannel("alarma-v1");
        nm.deleteNotificationChannel("aviso-v1");

        Uri alarmSound = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/alarma");
        AudioAttributes alarmAudio = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        NotificationChannel alarm = new NotificationChannel(CH_ALARM, "Alarma de fin de temporizador", NotificationManager.IMPORTANCE_HIGH);
        alarm.setDescription("Suena cuando termina Concentración o Descanso");
        alarm.setSound(alarmSound, alarmAudio);
        alarm.enableVibration(true);
        alarm.setVibrationPattern(new long[] { 0, 800, 300, 800, 300, 800 });
        alarm.setBypassDnd(true);
        nm.createNotificationChannel(alarm);

        NotificationChannel warn = new NotificationChannel(CH_WARN, "Aviso de 30 segundos", NotificationManager.IMPORTANCE_HIGH);
        warn.setDescription("Vibra 30 segundos antes de que termine Concentración");
        warn.setSound(null, null);
        warn.enableVibration(true);
        warn.setVibrationPattern(new long[] { 0, 400, 200, 400, 200, 400 });
        nm.createNotificationChannel(warn);
    }
}
