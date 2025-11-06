# Native Modules Documentation

Această aplicație necesită module native pentru a implementa funcționalitatea de monitorizare și blocare a aplicațiilor. Aceste module trebuie implementate separat pentru Android și iOS.

## Android Implementation

### 1. App Usage Monitoring

Pentru Android, vom folosi **UsageStatsManager** API.

#### Pași de implementare:

1. **Permisiuni necesare** în `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
```

2. **Creare modul native**:
Creați `android/app/src/main/java/com/mindfultime/UsageStatsModule.java`:

```java
package com.mindfultime;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.Calendar;
import java.util.List;
import java.util.Map;

public class UsageStatsModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "UsageStatsModule";

    UsageStatsModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void getUsageStats(Promise promise) {
        try {
            UsageStatsManager usm = (UsageStatsManager) getReactApplicationContext()
                    .getSystemService(Context.USAGE_STATS_SERVICE);

            Calendar calendar = Calendar.getInstance();
            long endTime = calendar.getTimeInMillis();
            calendar.add(Calendar.DAY_OF_YEAR, -1);
            long startTime = calendar.getTimeInMillis();

            Map<String, UsageStats> usageStatsMap = usm.queryAndAggregateUsageStats(
                    startTime, endTime);

            WritableArray result = new WritableNativeArray();
            PackageManager pm = getReactApplicationContext().getPackageManager();

            for (Map.Entry<String, UsageStats> entry : usageStatsMap.entrySet()) {
                UsageStats stats = entry.getValue();

                try {
                    ApplicationInfo appInfo = pm.getApplicationInfo(
                            stats.getPackageName(), 0);
                    String appName = pm.getApplicationLabel(appInfo).toString();

                    WritableMap map = new WritableNativeMap();
                    map.putString("packageName", stats.getPackageName());
                    map.putString("appName", appName);
                    map.putDouble("totalTimeInForeground",
                            stats.getTotalTimeInForeground() / 1000 / 60); // minutes

                    result.pushMap(map);
                } catch (PackageManager.NameNotFoundException e) {
                    // App not found, skip
                }
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void checkUsageStatsPermission(Promise promise) {
        // Check if app has usage stats permission
        promise.resolve(hasUsageStatsPermission());
    }

    private boolean hasUsageStatsPermission() {
        UsageStatsManager usm = (UsageStatsManager) getReactApplicationContext()
                .getSystemService(Context.USAGE_STATS_SERVICE);

        long time = System.currentTimeMillis();
        List<UsageStats> stats = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                time - 1000 * 10, time);

        return stats != null && stats.size() > 0;
    }
}
```

### 2. App Blocking (Android)

Pentru blocarea aplicațiilor, vom folosi **AccessibilityService**.

**Notă**: Această implementare este complexă și necesită permisiuni speciale de la utilizator.

#### Alternativă simplificată:
Putem folosi **Digital Wellbeing API** sau doar afișăm overlay-uri care încurajează utilizatorul să nu folosească aplicația.

---

## iOS Implementation

### 1. App Usage Monitoring

Pentru iOS, vom folosi **Screen Time API** (disponibil din iOS 14+).

#### Pași de implementare:

1. **Adăugare capability** în Xcode:
   - Signing & Capabilities → Family Controls

2. **Cerere autorizare**:
```swift
import FamilyControls

AuthorizationCenter.shared.requestAuthorization { result in
    switch result {
    case .success():
        print("Authorization granted")
    case .failure(let error):
        print("Authorization failed: \\(error)")
    }
}
```

3. **Monitorizare activitate**:
```swift
import DeviceActivity

let schedule = DeviceActivitySchedule(
    intervalStart: DateComponents(hour: 0, minute: 0),
    intervalEnd: DateComponents(hour: 23, minute: 59),
    repeats: true
)

let center = DeviceActivityCenter()
try? center.startMonitoring(
    .daily,
    during: schedule
)
```

### 2. App Blocking (iOS)

Pentru iOS, folosim **Managed Settings**:

```swift
import ManagedSettings

let store = ManagedSettingsStore()

// Block specific apps
let selection = FamilyActivitySelection(
    applicationTokens: blockedAppTokens
)

store.shield.applications = selection.applicationTokens
```

**Limitări iOS**:
- Necesită permisiuni Family Controls
- Funcționează doar pe dispozitive personale
- Nu poate fi folosit pentru monitorizare enterprise

---

## TypeScript Interface

Creați interfața TypeScript pentru modulele native:

```typescript
// src/native-modules/UsageStats.ts
import { NativeModules } from 'react-native';

interface UsageStatsInterface {
  getUsageStats(): Promise<AppUsageData[]>;
  checkUsageStatsPermission(): Promise<boolean>;
  requestUsageStatsPermission(): Promise<void>;
}

interface AppUsageData {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // in minutes
}

const { UsageStatsModule } = NativeModules;

export default UsageStatsModule as UsageStatsInterface;
```

---

## Implementare alternativă (mai simplă)

Dacă implementarea modulelor native este prea complexă pentru început, puteți:

1. **Folosire demo data** pentru testare
2. **Integrare cu biblioteci existente**:
   - `react-native-device-activity` (iOS)
   - `react-native-usage-stats` (Android)

3. **Focus pe UI/UX** și logica aplicației, apoi adăugarea monitorizării reale mai târziu

---

## Next Steps

1. Implementați modulele native sau folosiți biblioteci third-party
2. Testați pe dispozitive fizice (nu funcționează în emulator)
3. Configurați permisiunile corect
4. Adăugați instrucțiuni pentru utilizatori despre cum să acorde permisiunile necesare
