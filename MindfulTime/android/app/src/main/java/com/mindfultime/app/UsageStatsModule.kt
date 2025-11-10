package com.mindfultime.app

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.provider.Settings
import com.facebook.react.bridge.*

class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    /**
     * Verifică dacă aplicația are permisiunea de Usage Stats
     */
    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        try {
            val appOps = reactApplicationContext
                .getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactApplicationContext.packageName
            )

            val hasPermission = mode == AppOpsManager.MODE_ALLOWED
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check permission: ${e.message}")
        }
    }

    /**
     * Deschide Settings pentru a cere permisiunea
     */
    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open settings: ${e.message}")
        }
    }

    /**
     * Obține statistici de utilizare pentru o perioadă specificată
     */
    @ReactMethod
    fun getUsageStats(startTime: Double, endTime: Double, promise: Promise) {
        try {
            if (!checkPermission()) {
                promise.reject("NO_PERMISSION", "Usage stats permission not granted")
                return
            }

            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime.toLong(),
                endTime.toLong()
            )

            val result = Arguments.createArray()
            val packageManager = reactApplicationContext.packageManager

            for (usageStat in stats) {
                // Doar aplicații user-installed
                try {
                    val appInfo = packageManager.getApplicationInfo(
                        usageStat.packageName,
                        0
                    )

                    if (appInfo.flags and ApplicationInfo.FLAG_SYSTEM == 0) {
                        val map = Arguments.createMap()
                        map.putString("packageName", usageStat.packageName)
                        map.putDouble("totalTimeInForeground", usageStat.totalTimeInForeground.toDouble())
                        map.putDouble("lastTimeUsed", usageStat.lastTimeUsed.toDouble())
                        map.putInt("lastTimeVisible", usageStat.lastTimeVisible.toInt())

                        // Încearcă să obții numele aplicației
                        try {
                            val appName = packageManager.getApplicationLabel(appInfo).toString()
                            map.putString("appName", appName)
                        } catch (e: Exception) {
                            map.putString("appName", usageStat.packageName)
                        }

                        result.pushMap(map)
                    }
                } catch (e: PackageManager.NameNotFoundException) {
                    // Skip dacă aplicația nu mai există
                    continue
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get usage stats: ${e.message}")
        }
    }

    /**
     * Obține lista aplicațiilor instalate (non-system)
     */
    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val packages = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)

            val result = Arguments.createArray()

            for (packageInfo in packages) {
                // Doar aplicații non-system
                if (packageInfo.flags and ApplicationInfo.FLAG_SYSTEM == 0) {
                    val map = Arguments.createMap()
                    map.putString("packageName", packageInfo.packageName)

                    try {
                        val appName = packageManager.getApplicationLabel(packageInfo).toString()
                        map.putString("appName", appName)
                    } catch (e: Exception) {
                        map.putString("appName", packageInfo.packageName)
                    }

                    result.pushMap(map)
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get installed apps: ${e.message}")
        }
    }

    /**
     * Helper pentru a verifica permisiunea
     */
    private fun checkPermission(): Boolean {
        val appOps = reactApplicationContext
            .getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            reactApplicationContext.packageName
        )

        return mode == AppOpsManager.MODE_ALLOWED
    }
}
