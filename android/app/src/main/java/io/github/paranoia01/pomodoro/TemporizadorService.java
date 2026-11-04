package io.github.paranoia01.pomodoro;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * Servicio que acompaña al temporizador mientras corre. Muestra "Temporizador en curso"
 * con la cuenta atrás y, si el usuario cierra la app (la desliza en Recientes o usa
 * "Cerrar todo"), cancela las alarmas y anota la hora para pausar el temporizador.
 */
public class TemporizadorService extends Service {

    static final int ID = 4242;
    static final String CH = "en-curso";
    static volatile boolean activo = false;

    static Notification construir(Context c, String texto, long fin) {
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH)
            .setSmallIcon(R.drawable.ic_stat_tomate)
            .setContentTitle(texto == null || texto.isEmpty() ? "Temporizador en curso" : texto)
            .setContentText("Si cierras la app, el temporizador se detiene.")
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setContentIntent(AlarmasPlugin.abrirApp(c));
        if (fin > System.currentTimeMillis()) {
            b.setWhen(fin).setShowWhen(true).setUsesChronometer(true).setChronometerCountDown(true);
        } else {
            b.setShowWhen(false);
        }
        return b.build();
    }

    static void actualizar(Context c, String texto, long fin) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(ID, construir(c, texto, fin));
    }

    @Override
    public void onCreate() {
        super.onCreate();
        activo = true;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String texto = intent != null ? intent.getStringExtra("texto") : null;
        long fin = intent != null ? intent.getLongExtra("fin", 0L) : 0L;
        Notification n = construir(this, texto, fin);
        try {
            if (Build.VERSION.SDK_INT >= 34) startForeground(ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            else startForeground(ID, n);
        } catch (Exception e) {
            stopSelf();
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // La app se cerró desde Recientes: se detiene el temporizador
        AlarmasPlugin.cancelarTodo(this);
        AlarmasPlugin.prefs(this).edit().putLong("cerradaEn", System.currentTimeMillis()).commit();
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        activo = false;
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
