# Implementare Limitare Timp și Tracking Aplicații

## Probleme Tehnice și Limitări

### ⚠️ **IMPORTANT: Limitări Majore**

#### iOS
- **Screen Time API**: Nu este disponibil pentru dezvoltatori terți
- **App Extensions**: Limitate și nu permit blocarea aplicațiilor
- **Family Controls**: Disponibil din iOS 15, dar FOARTE limitat
- **Soluție**: iOS NU permite aplicațiilor terțe să blocheze alte aplicații

#### Android
- **UsageStats**: Permite tracking, dar NU permite blocarea
- **Accessibility Service**: Poate detecta când o app se deschide
- **Device Admin**: Poate bloca accesul, dar necesită privilegii de administrator
- **Soluție**: Android permite tracking dar blocarea completă necesită acces root sau Device Admin

## Implementări Posibile

### 1. **Android - Usage Stats Tracking** ✅ POSIBIL

```typescript
// Permisiunea necesară în AndroidManifest.xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
```

**Cum funcționează:**
- Permite citirea statisticilor de utilizare
- NU permite blocarea aplicațiilor
- Necesită aprobare manuală din Settings

**Limitări:**
- User trebuie să meargă manual în Settings → Apps → Special Access → Usage Access
- Nu poate bloca aplicații automat
- Poate doar să monitorizeze timpul

### 2. **Android - Accessibility Service** ⚠️ COMPLICAT

```typescript
// Poate detecta când user deschide o aplicație
// DAR nu poate opri aplicația să se deschidă
```

**Cum funcționează:**
- Detectează când se schimbă aplicația
- Poate afișa overlay-uri peste alte aplicații
- Poate simula acțiuni (ex: butonul Back)

**Limitări:**
- Nu poate PREVENI deschiderea unei aplicații
- Poate doar să afișeze un overlay sau să închidă aplicația după ce s-a deschis
- Necesită permisiune Accessibility (foarte invazivă)

### 3. **iOS - Screen Time API (iOS 15.4+)** ❌ NU FUNCȚIONEAZĂ

```swift
// Screen Time API este DISPONIBIL dar EXTREM de limitat
import FamilyControls
import ManagedSettings
```

**Limitări CRITICE:**
- Funcționează DOAR pentru parental controls
- Nu poate fi folosit pentru self-limiting apps
- Necesită autorizare Family Sharing
- Apple REFUZĂ aplicații care încearcă să circumvențeze această limitare

### 4. **iOS - Shortcuts/Focus Modes** 🤔 ALTERNATIVĂ

User poate fi ghidat să folosească:
- Focus Modes (iOS 15+)
- Screen Time nativ
- App Limits din Settings

## Soluții Recomandate pentru MindfulTime

### Opțiunea 1: **Tracking + Notificări** (Cel mai realistic)

✅ **Ce POATE face aplicația:**

**Android:**
1. Tracking timp de utilizare (UsageStats)
2. Notificări când se apropie de limită
3. Widget cu statistici
4. Overlay reminder când deschide o aplicație blocată
5. Gamification pentru a descuraja folosirea

**iOS:**
1. Tracking manual (user declară când folosește aplicațiile)
2. Notificări programate
3. Widget cu progress
4. Ghidare către Screen Time nativ
5. Integrare cu Focus Modes (prin Shortcuts)

### Opțiunea 2: **Hybrid - Best of Both Worlds**

**Pentru Android:**
- UsageStats pentru tracking automat
- Accessibility Service pentru overlay-uri
- Notificări persistente când limita este atinsă
- "Blocarea" prin overlay fullscreen care cere confirmări multiple

**Pentru iOS:**
- Tracking estimat bazat pe app state
- Notificări locale
- Deep linking către Screen Time settings
- Widget cu statistici
- Siri Shortcuts pentru activare Focus Mode

## Implementare Practică

### Android - UsageStats Permission

```kotlin
// 1. Verificare permisiune
fun hasUsageStatsPermission(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        context.packageName
    )
    return mode == AppOpsManager.MODE_ALLOWED
}

// 2. Request permisiune (deschide Settings)
fun requestUsageStatsPermission(context: Context) {
    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
    context.startActivity(intent)
}

// 3. Obținere date de utilizare
fun getAppUsageStats(context: Context, startTime: Long, endTime: Long): List<UsageStats> {
    val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    return usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        startTime,
        endTime
    )
}
```

### React Native Bridge

```typescript
// Pentru a accesa funcționalitățile native din React Native
// Trebuie creat un Native Module

// UsageStatsModule.ts
import { NativeModules } from 'react-native';

const { UsageStatsModule } = NativeModules;

interface AppUsageStats {
  packageName: string;
  totalTimeInForeground: number; // milliseconds
  lastTimeUsed: number; // timestamp
}

export const UsageStatsService = {
  async hasPermission(): Promise<boolean> {
    return await UsageStatsModule.hasUsageStatsPermission();
  },

  async requestPermission(): Promise<void> {
    await UsageStatsModule.requestUsageStatsPermission();
  },

  async getUsageStats(
    startTime: number,
    endTime: number
  ): Promise<AppUsageStats[]> {
    return await UsageStatsModule.getUsageStats(startTime, endTime);
  },

  async getInstalledApps(): Promise<string[]> {
    return await UsageStatsModule.getInstalledApps();
  },
};
```

### iOS - App State Tracking

```typescript
// Pentru iOS, tracking-ul este limitat la app state
import { AppState, AppStateStatus } from 'react-native';

class AppUsageTracker {
  private currentApp: string | null = null;
  private startTime: number = 0;
  private usageData: Map<string, number> = new Map();

  startTracking() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      this.startTime = Date.now();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      if (this.startTime > 0) {
        const duration = Date.now() - this.startTime;
        this.recordUsage('MindfulTime', duration); // Only tracks own app
        this.startTime = 0;
      }
    }
  };

  private recordUsage(appName: string, duration: number) {
    const current = this.usageData.get(appName) || 0;
    this.usageData.set(appName, current + duration);
  }
}
```

## Pasii de Implementare

### Pas 1: Creează Native Module pentru Android

1. **Crează fișierul Java/Kotlin:**
```
android/app/src/main/java/com/mindfultime/UsageStatsModule.kt
```

2. **Înregistrează module-ul:**
```
android/app/src/main/java/com/mindfultime/UsageStatsPackage.kt
```

3. **Adaugă în MainApplication:**
```kotlin
packages.add(UsageStatsPackage())
```

### Pas 2: Adaugă Permisiuni în Manifest

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
        tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
</manifest>
```

### Pas 3: Implementează Permission Flow

```typescript
// Verifică și cere permisiune la primul launch
useEffect(() => {
  async function checkPermissions() {
    if (Platform.OS === 'android') {
      const hasPermission = await UsageStatsService.hasPermission();
      if (!hasPermission) {
        // Arată ecran educațional
        setShowPermissionScreen(true);
      }
    }
  }
  checkPermissions();
}, []);
```

## Recomandări Finale

### ✅ Ceea ce ar trebui implementat:

1. **Android:**
   - UsageStats tracking ✅
   - Notificări când se apropie de limită ✅
   - Overlay fullscreen cu reminder ✅
   - Widget cu statistici ✅

2. **iOS:**
   - Tracking manual declarativ ✅
   - Notificări programate ✅
   - Widget ✅
   - Link către Screen Time nativ ✅

### ❌ Ceea ce NU este posibil:

1. **Android:**
   - Blocarea completă a aplicațiilor fără root ❌
   - Prevenirea deschiderii aplicațiilor ❌

2. **iOS:**
   - Orice tracking automat al altor aplicații ❌
   - Orice blocarea a altor aplicații ❌

### 🎯 Strategia Recomandată:

**"Gentle Blocking" + Gamification:**
- Nu blochezi HARD aplicațiile
- Folosești psihologia comportamentală:
  - Friction (overlay cu confirmare multiplă)
  - Shame/Pride (statistici vizibile)
  - Commitment (streaks, achievements)
  - Social proof (comparații, leaderboards)

**Exemplu de "Gentle Blocking":**
```
User deschide Instagram când e blocat →
1. Overlay fullscreen apare
2. "Instagram e blocat. Ai 0 minute disponibile"
3. "Vrei să continui oricum?" [Da] [Nu, înapoi]
4. Dacă Da → "Ești sigur? Vei pierde streak-ul" [Da, oricum] [Nu]
5. Dacă Da din nou → Se deschide app, dar:
   - Se pierde streak
   - Se înregistrează "cheat"
   - Se afișează notificare persistentă cu "reminder"
```

Acest approach funcționează MULT mai bine decât blocking-ul hard!
