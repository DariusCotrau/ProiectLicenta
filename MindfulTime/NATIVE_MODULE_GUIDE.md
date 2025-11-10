# Ghid: Creare Native Module pentru Usage Stats (Android)

## ⚠️ Important: Expo Prebuild Necesar

Acest proiect folosește **Expo Managed Workflow**. Pentru a adăuga cod nativ (Kotlin/Java), trebuie să generezi directoarele native folosind `expo prebuild`.

### Pas 0: Pregătire Expo pentru Native Modules

```bash
# 1. Instalează expo-dev-client (necesar pentru custom native code)
cd MindfulTime
npm install expo-dev-client

# 2. Generează directoarele native (android/ și ios/)
npx expo prebuild

# 3. După prebuild, vei avea:
# - android/ directory cu structura completă Android
# - ios/ directory cu structura completă iOS
```

**Note importante:**
- După `expo prebuild`, proiectul va trece de la "managed" la "bare" workflow
- Vei putea modifica codul nativ, dar vei pierde unele beneficii Expo
- Pentru development builds, folosește `npx expo run:android` în loc de `expo start`
- Builds viitoare vor necesita `expo-dev-client`

### Alternativă: Expo Config Plugin

Dacă preferi să rămâi în managed workflow, poți crea un Expo Config Plugin care modifică codul nativ la build time. Acest ghid se focusează pe abordarea prebuild pentru simplitate.

---

## Structura Fișierelor

```
android/
├── app/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── mindfultime/
│           │           ├── UsageStatsModule.kt
│           │           ├── UsageStatsPackage.kt
│           │           └── MainApplication.kt
│           └── AndroidManifest.xml
```

## Pas 1: Creează UsageStatsModule.kt

```kotlin
// android/app/src/main/java/com/mindfultime/UsageStatsModule.kt

package com.mindfultime

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*

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
```

## Pas 2: Creează UsageStatsPackage.kt

```kotlin
// android/app/src/main/java/com/mindfultime/UsageStatsPackage.kt

package com.mindfultime

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class UsageStatsPackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(UsageStatsModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

## Pas 3: Înregistrează Package-ul în MainApplication

```kotlin
// android/app/src/main/java/com/mindfultime/MainApplication.kt

package com.mindfultime

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> {
          val packages = PackageList(this).packages

          // ADAUGĂ PACKAGE-UL TĂU AICI
          packages.add(UsageStatsPackage())

          return packages
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
```

## Pas 4: Adaugă Permisiunile în AndroidManifest.xml

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permisiuni necesare -->
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
        tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"
        tools:ignore="QueryAllPackagesPermission" />

    <application
      android:name=".MainApplication"
      ...>
      ...
    </application>
</manifest>
```

## Pas 5: Folosește Module-ul în React Native

```typescript
// src/services/NativeUsageStatsService.ts

import { NativeModules, Platform } from 'react-native';

const { UsageStatsModule } = NativeModules;

export interface AppUsageStats {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // milliseconds
  lastTimeUsed: number; // timestamp
  lastTimeVisible: number;
}

export interface InstalledApp {
  packageName: string;
  appName: string;
}

class NativeUsageStatsService {
  /**
   * Verifică dacă are permisiunea
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      return await UsageStatsModule.hasUsageStatsPermission();
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Cere permisiunea (deschide Settings)
   */
  async requestPermission(): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Only available on Android');
    }

    try {
      await UsageStatsModule.requestUsageStatsPermission();
    } catch (error) {
      console.error('Error requesting permission:', error);
      throw error;
    }
  }

  /**
   * Obține statistici de utilizare
   */
  async getUsageStats(
    startTime: number,
    endTime: number
  ): Promise<AppUsageStats[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    try {
      const stats = await UsageStatsModule.getUsageStats(startTime, endTime);
      return stats;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return [];
    }
  }

  /**
   * Obține aplicații instalate
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    try {
      const apps = await UsageStatsModule.getInstalledApps();
      return apps;
    } catch (error) {
      console.error('Error getting installed apps:', error);
      return [];
    }
  }

  /**
   * Obține statistici pentru azi
   */
  async getTodayUsageStats(): Promise<AppUsageStats[]> {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.getUsageStats(startOfDay.getTime(), now);
  }
}

export default new NativeUsageStatsService();
```

## Pas 6: Testează

```typescript
// Exemplu de utilizare
import NativeUsageStatsService from './services/NativeUsageStatsService';

// Verifică permisiunea
const hasPermission = await NativeUsageStatsService.hasPermission();

if (!hasPermission) {
  // Cere permisiunea
  await NativeUsageStatsService.requestPermission();
}

// Obține statistici pentru azi
const stats = await NativeUsageStatsService.getTodayUsageStats();

stats.forEach(app => {
  console.log(`${app.appName}: ${Math.round(app.totalTimeInForeground / 1000 / 60)} minute`);
});
```

## Build și Run

### Pentru Expo (după prebuild):

```bash
# Development build cu Expo
npx expo run:android

# Sau folosește Expo Go pentru testing fără native code
# (nu va funcționa cu UsageStatsModule - necesită dev build)
npx expo start --dev-client
```

### Alternative (Direct React Native):

```bash
# Rebuild aplicația Android
cd android
./gradlew clean

cd ..
npx react-native run-android
```

**Recomandare**: Folosește `expo run:android` pentru consistență cu Expo workflow.

## Troubleshooting

### Eroare: "Module not found"
- Asigură-te că ai adăugat `UsageStatsPackage()` în `MainApplication.kt`
- Rebuild aplicația

### Eroare: "Permission denied"
- Verifică că ai adăugat permisiunea în `AndroidManifest.xml`
- User trebuie să acorde manual permisiunea din Settings

### Module returnează date goale
- Verifică că ai permisiunea activată
- Verifică că period-ul de timp este corect
- Unele device-uri pot avea restricții

## Note Importante

1. **Permisiunea trebuie acordată manual** - user-ul trebuie să meargă în Settings
2. **Nu funcționează pe iOS** - Apple nu permite acest lucru
3. **Folosește doar pentru tracking** - nu poți bloca aplicații
4. **Privacy** - fii transparent cu utilizatorii despre ce date colectezi

## Resurse Suplimentare

- [Android UsageStatsManager Documentation](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-android)
- [Android App Usage Statistics](https://developer.android.com/training/monitoring-device-state/app-usage)
