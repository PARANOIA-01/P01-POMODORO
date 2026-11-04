package io.github.paranoia01.pomodoro;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

/**
 * Cuando llega la hora: toca el tono elegido una sola vez (directo, con el volumen de alarma,
 * sin esperar al sonido de la notificación) y muestra la notificación, que solo vibra.
 */
public class AlarmaReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        int id = i.getIntExtra("id", 1);
        String canal = i.getStringExtra("canal");
        if (canal == null || canal.isEmpty()) canal = MainActivity.CH_ALARM_PREFIX + "clasico";
        boolean esAlarma = canal.startsWith(MainActivity.CH_ALARM_PREFIX);
        if (esAlarma) tocar(c, i.getStringExtra("tono"));
        else vibrarAviso(c);

        NotificationCompat.Builder b = new NotificationCompat.Builder(c, canal)
            .setSmallIcon(R.drawable.ic_stat_tomate)
            .setContentTitle(i.getStringExtra("titulo"))
            .setContentText(i.getStringExtra("cuerpo"))
            .setStyle(new NotificationCompat.BigTextStyle().bigText(i.getStringExtra("cuerpo")))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(esAlarma ? NotificationCompat.CATEGORY_ALARM : NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(AlarmasPlugin.abrirApp(c));
        Notification n = b.build();
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(id, n);

        // Actualiza la cuenta atrás de "Temporizador en curso" con la fase que empieza
        String sig = i.getStringExtra("sigTexto");
        long sigFin = i.getLongExtra("sigFin", 0L);
        if (TemporizadorService.activo && sig != null && !sig.isEmpty()) TemporizadorService.actualizar(c, sig, sigFin);
    }

    /** Tres toques de vibración para el aviso de 30 segundos. */
    private void vibrarAviso(Context c) {
        try {
            Vibrator v = (Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null || !v.hasVibrator()) return;
            long[] patron = { 0, 350, 200, 350, 200, 350 };
            AudioAttributes aa = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            if (android.os.Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(patron, -1), aa);
            else v.vibrate(patron, -1, aa);
        } catch (Exception e) { }
    }

    private void tocar(Context c, String tono) {
        int res = tono == null ? 0 : c.getResources().getIdentifier("tono_" + tono, "raw", c.getPackageName());
        if (res == 0) res = R.raw.tono_clasico;
        AudioAttributes aa = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        final PendingResult pr = goAsync(); // mantiene vivo el receptor mientras suena (máx. ~10 s)
        final boolean[] listo = { false };
        final Runnable terminar = () -> { if (!listo[0]) { listo[0] = true; try { pr.finish(); } catch (Exception e) { } } };
        try {
            MediaPlayer mp = MediaPlayer.create(c, res, aa, 0);
            if (mp == null) { terminar.run(); return; }
            mp.setOnCompletionListener(m -> { m.release(); terminar.run(); });
            mp.start();
            new Handler(Looper.getMainLooper()).postDelayed(terminar, 8000);
        } catch (Exception e) {
            terminar.run();
        }
    }
}
