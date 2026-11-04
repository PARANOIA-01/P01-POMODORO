package io.github.paranoia01.pomodoro;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.NotificationCompat;

/** Muestra la notificación de la alarma cuando llega la hora (el sonido lo pone el canal del tono). */
public class AlarmaReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        int id = i.getIntExtra("id", 1);
        String canal = i.getStringExtra("canal");
        if (canal == null || canal.isEmpty()) canal = MainActivity.CH_ALARM_PREFIX + "clasico";
        boolean esAlarma = canal.startsWith(MainActivity.CH_ALARM_PREFIX);

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
}
