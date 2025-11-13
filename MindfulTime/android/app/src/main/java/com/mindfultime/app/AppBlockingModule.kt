package com.mindfultime.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.os.Build
import com.facebook.react.bridge.*
import androidx.core.content.ContextCompat

/**
 * Module Android pentru gestionarea blocării aplicațiilor
 * Folosește Accessibility Service și Overlay pentru a detecta și bloca aplicații
 */
class AppBlockingModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS_NAME = "AppBlockingPrefs"
        const val KEY_BLOCKED_APPS = "blocked_apps"
        const val KEY_BLOCKING_ENABLED = "blocking_enabled"
    }

    override fun getName(): String {
        return "AppBlockingModule"
    }

    /**
     * Verifică dacă aplicația are permisiunea de overlay (SYSTEM_ALERT_WINDOW)
     */
    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        try {
            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactContext)
            } else {
                true // Permission automatically granted on API < 23
            }
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check overlay permission: ${e.message}")
        }
    }

    /**
     * Cere permisiunea de overlay
     */
    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to request overlay permission: ${e.message}")
        }
    }

    /**
     * Verifică dacă Accessibility Service este activat
     */
    @ReactMethod
    fun hasAccessibilityPermission(promise: Promise) {
        try {
            val hasPermission = isAccessibilityServiceEnabled()
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check accessibility permission: ${e.message}")
        }
    }

    /**
     * Deschide Settings pentru Accessibility Service
     */
    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open accessibility settings: ${e.message}")
        }
    }

    /**
     * Setează lista de aplicații blocate
     */
    @ReactMethod
    fun setBlockedApps(blockedAppsJson: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_BLOCKED_APPS, blockedAppsJson).apply()

            // Notifică Accessibility Service despre schimbări
            sendBroadcastToService("UPDATE_BLOCKED_APPS")

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to set blocked apps: ${e.message}")
        }
    }

    /**
     * Obține lista de aplicații blocate
     */
    @ReactMethod
    fun getBlockedApps(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val blockedApps = prefs.getString(KEY_BLOCKED_APPS, "[]") ?: "[]"
            promise.resolve(blockedApps)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get blocked apps: ${e.message}")
        }
    }

    /**
     * Activează/dezactivează blocarea
     */
    @ReactMethod
    fun setBlockingEnabled(enabled: Boolean, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(KEY_BLOCKING_ENABLED, enabled).apply()

            // Notifică service-ul
            sendBroadcastToService(if (enabled) "ENABLE_BLOCKING" else "DISABLE_BLOCKING")

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to set blocking enabled: ${e.message}")
        }
    }

    /**
     * Verifică dacă blocarea este activată
     */
    @ReactMethod
    fun isBlockingEnabled(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val enabled = prefs.getBoolean(KEY_BLOCKING_ENABLED, false)
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check blocking enabled: ${e.message}")
        }
    }

    /**
     * Verifică dacă o aplicație este blocată
     */
    @ReactMethod
    fun isAppBlocked(packageName: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val blockedAppsJson = prefs.getString(KEY_BLOCKED_APPS, "[]") ?: "[]"
            val isBlocked = blockedAppsJson.contains("\"$packageName\"")
            promise.resolve(isBlocked)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check if app is blocked: ${e.message}")
        }
    }

    /**
     * Forțează oprirea unei aplicații (necesită permisiuni root - nu va funcționa pe majoritatea device-urilor)
     */
    @ReactMethod
    fun forceStopApp(packageName: String, promise: Promise) {
        try {
            // Nu putem forța oprirea aplicațiilor fără permisiuni de sistem
            // În schimb, vom folosi overlay-ul pentru a bloca accesul
            promise.reject("NOT_SUPPORTED", "Force stop requires system permissions. Use overlay blocking instead.")
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to force stop app: ${e.message}")
        }
    }

    /**
     * Verifică toate permisiunile necesare pentru blocare
     */
    @ReactMethod
    fun checkAllBlockingPermissions(promise: Promise) {
        try {
            val hasOverlay = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactContext)
            } else {
                true
            }

            val hasAccessibility = isAccessibilityServiceEnabled()

            val result = Arguments.createMap()
            result.putBoolean("hasOverlay", hasOverlay)
            result.putBoolean("hasAccessibility", hasAccessibility)
            result.putBoolean("allGranted", hasOverlay && hasAccessibility)

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check permissions: ${e.message}")
        }
    }

    /**
     * Helper: Verifică dacă Accessibility Service este activat
     */
    private fun isAccessibilityServiceEnabled(): Boolean {
        val service = "${reactContext.packageName}/${AppMonitoringService::class.java.canonicalName}"
        val settingValue = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )
        return settingValue?.contains(service) == true
    }

    /**
     * Helper: Trimite broadcast către Accessibility Service
     */
    private fun sendBroadcastToService(action: String) {
        try {
            val intent = Intent("com.mindfultime.app.ACTION_$action")
            intent.setPackage(reactContext.packageName)
            reactContext.sendBroadcast(intent)
        } catch (e: Exception) {
            // Ignore if service is not running
        }
    }
}
