package io.github.paranoia01.pomodoro;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

/**
 * Programa las alarmas del temporizador directamente en el sistema.
 * Usa setAlarmClock (la forma que usan los despertadores): suena a la hora exacta
 * aunque el celular esté bloqueado o en ahorro de batería.
 * También mantiene el servicio "Temporizador en curso", que detecta cuándo se cierra la app.
 */
@CapacitorPlugin(name = "Alarmas")
public class AlarmasPlugin extends Plugin {

    static final String PREFS = "p01-alarmas";

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static PendingIntent intentoAlarma(Context c, int id, Intent extras, int flags) {
        Intent i = new Intent(c, AlarmaReceiver.class);
        if (extras != null) i.putExtras(extras);
        return PendingIntent.getBroadcast(c, id, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent abrirApp(Context c) {
        Intent i = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if (i == null) i = new Intent(c, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Cancela todas las alarmas programadas (no toca las notificaciones que ya se ven). */
    static void cancelarTodo(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        String ids = prefs(c).getString("ids", "");
        for (String s : ids.split(",")) {
            if (s.isEmpty()) continue;
            try {
                PendingIntent pi = intentoAlarma(c, Integer.parseInt(s), null, PendingIntent.FLAG_NO_CREATE);
                if (pi != null) { am.cancel(pi); pi.cancel(); }
            } catch (Exception e) { /* id inválido: se ignora */ }
        }
        prefs(c).edit().putString("ids", "").apply();
    }

    static boolean puedeExactas(AlarmManager am) {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms();
    }

    @PluginMethod
    public void programar(PluginCall call) {
        Context c = getContext();
        cancelarTodo(c);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        boolean exactas = puedeExactas(am);
        StringBuilder ids = new StringBuilder();
        try {
            JSArray items = call.getArray("items", new JSArray());
            for (int k = 0; k < items.length(); k++) {
                JSONObject it = items.getJSONObject(k);
                int id = it.getInt("id");
                long at = it.getLong("at");
                Intent extras = new Intent();
                extras.putExtra("id", id);
                extras.putExtra("titulo", it.optString("titulo"));
                extras.putExtra("cuerpo", it.optString("cuerpo"));
                extras.putExtra("canal", it.optString("canal"));
                extras.putExtra("tono", it.optString("tono", "clasico"));
                extras.putExtra("sigTexto", it.optString("sigTexto", ""));
                extras.putExtra("sigFin", it.optLong("sigFin", 0));
                PendingIntent pi = intentoAlarma(c, id, extras, PendingIntent.FLAG_UPDATE_CURRENT);
                if (exactas) am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, abrirApp(c)), pi);
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                if (ids.length() > 0) ids.append(',');
                ids.append(id);
            }
        } catch (Exception e) {
            call.reject("No se pudieron programar las alarmas", e);
            return;
        }
        prefs(c).edit().putString("ids", ids.toString()).apply();

        // Servicio "Temporizador en curso": muestra la cuenta atrás y avisa si se cierra la app
        try {
            Intent s = new Intent(c, TemporizadorService.class);
            s.putExtra("texto", call.getString("texto", "Temporizador en curso"));
            s.putExtra("fin", call.getLong("fin", 0L));
            if (TemporizadorService.activo) {
                TemporizadorService.actualizar(c, call.getString("texto", "Temporizador en curso"), call.getLong("fin", 0L));
            } else {
                ContextCompat.startForegroundService(c, s);
            }
        } catch (Exception e) { /* sin servicio, las alarmas igual suenan */ }

        JSObject ret = new JSObject();
        ret.put("exactas", exactas);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelar(PluginCall call) {
        Context c = getContext();
        cancelarTodo(c);
        try { c.stopService(new Intent(c, TemporizadorService.class)); } catch (Exception e) { }
        call.resolve();
    }

    /** Devuelve cuándo se cerró la app con el temporizador corriendo (0 si no se cerró) y borra el dato. */
    @PluginMethod
    public void consumirCierre(PluginCall call) {
        long t = prefs(getContext()).getLong("cerradaEn", 0L);
        prefs(getContext()).edit().remove("cerradaEn").apply();
        JSObject ret = new JSObject();
        ret.put("cerradaEn", t);
        call.resolve(ret);
    }
}
