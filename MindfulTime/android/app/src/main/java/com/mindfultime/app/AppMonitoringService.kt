package com.mindfultime.app

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.view.accessibility.AccessibilityEvent
import android.util.Log
import org.json.JSONArray

/**
 * Accessibility Service pentru monitorizarea aplicațiilor în timp real
 * Detectează când utilizatorul deschide o aplicație blocată și afișează overlay-ul
 */
class AppMonitoringService : AccessibilityService() {

    companion object {
        private const val TAG = "AppMonitoringService"
        private const val PREFS_NAME = "AppBlockingPrefs"
        private const val KEY_BLOCKED_APPS = "blocked_apps"
        private const val KEY_BLOCKING_ENABLED = "blocking_enabled"
    }

    private var currentPackage: String? = null
    private var blockedApps: Set<String> = emptySet()
    private var isBlockingEnabled: Boolean = false
    private val updateReceiver = BlockingUpdateReceiver()

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Accessibility Service Connected")

        // Încarcă setările
        loadSettings()

        // Înregistrează receiver pentru update-uri
        val filter = IntentFilter().apply {
            addAction("com.mindfultime.app.ACTION_UPDATE_BLOCKED_APPS")
            addAction("com.mindfultime.app.ACTION_ENABLE_BLOCKING")
            addAction("com.mindfultime.app.ACTION_DISABLE_BLOCKING")
        }
        registerReceiver(updateReceiver, filter)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || !isBlockingEnabled) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                val packageName = event.packageName?.toString()

                if (packageName != null && packageName != currentPackage) {
                    currentPackage = packageName

                    // Verifică dacă aplicația este blocată
                    if (isAppBlocked(packageName)) {
                        Log.d(TAG, "Blocked app detected: $packageName")
                        showBlockingOverlay(packageName)
                    }
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "Service Interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(updateReceiver)
        } catch (e: Exception) {
            // Receiver not registered
        }
    }

    /**
     * Încarcă setările din SharedPreferences
     */
    private fun loadSettings() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // Încarcă lista de aplicații blocate
        val blockedAppsJson = prefs.getString(KEY_BLOCKED_APPS, "[]") ?: "[]"
        blockedApps = parseBlockedApps(blockedAppsJson)

        // Verifică dacă blocarea este activată
        isBlockingEnabled = prefs.getBoolean(KEY_BLOCKING_ENABLED, false)

        Log.d(TAG, "Settings loaded - Blocking enabled: $isBlockingEnabled, Blocked apps: ${blockedApps.size}")
    }

    /**
     * Parsează JSON-ul cu aplicații blocate
     */
    private fun parseBlockedApps(json: String): Set<String> {
        return try {
            val jsonArray = JSONArray(json)
            val set = mutableSetOf<String>()
            for (i in 0 until jsonArray.length()) {
                set.add(jsonArray.getString(i))
            }
            set
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing blocked apps: ${e.message}")
            emptySet()
        }
    }

    /**
     * Verifică dacă o aplicație este blocată
     */
    private fun isAppBlocked(packageName: String): Boolean {
        // Nu bloca aplicația proprie
        if (packageName == this.packageName) {
            return false
        }

        // Nu bloca launcher-ul sau aplicații de sistem critice
        if (packageName.contains("launcher", ignoreCase = true) ||
            packageName == "com.android.systemui") {
            return false
        }

        return blockedApps.contains(packageName)
    }

    /**
     * Afișează overlay-ul de blocare
     */
    private fun showBlockingOverlay(packageName: String) {
        try {
            val intent = Intent(this, BlockingOverlayActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            intent.putExtra("blocked_package", packageName)
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Error showing blocking overlay: ${e.message}")
        }
    }

    /**
     * BroadcastReceiver pentru update-uri din React Native
     */
    inner class BlockingUpdateReceiver : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                "com.mindfultime.app.ACTION_UPDATE_BLOCKED_APPS" -> {
                    loadSettings()
                    Log.d(TAG, "Blocked apps updated")
                }
                "com.mindfultime.app.ACTION_ENABLE_BLOCKING" -> {
                    isBlockingEnabled = true
                    Log.d(TAG, "Blocking enabled")
                }
                "com.mindfultime.app.ACTION_DISABLE_BLOCKING" -> {
                    isBlockingEnabled = false
                    Log.d(TAG, "Blocking disabled")
                }
            }
        }
    }
}
