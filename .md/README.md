# MindfulTime - Aplicație de gestionare conștientă a timpului

## Descriere

MindfulTime este o aplicație mobilă pentru Android care ajută utilizatorii să reducă timpul petrecut pe aplicațiile de socializare și alte aplicații distractive, prin încurajarea unor activități mindfulness în lumea reală.

### Caracteristici principale:

- **Monitorizare utilizare aplicații**: Urmărește timpul petrecut în fiecare aplicație
- **Limite de timp personalizabile**: Setează limite zilnice pentru aplicațiile tale
- **Activități mindfulness**: Completează activități din viața reală pentru a câștiga timp suplimentar
- **Verificare prin fotografie**: Dovada completării activităților prin fotografii
- **Statistici detaliate**: Vizualizează progresul tău și streak-urile
- **Sistem de recompense**: Câștigă minute suplimentare pentru aplicațiile favorite

## Stack Tehnologic

- **Framework**: React Native + Expo
- **Limbaj**: TypeScript
- **UI Library**: React Native Paper (Material Design)
- **Navigare**: React Navigation
- **Storage**: AsyncStorage
- **Camera**: Expo Camera & Image Picker
- **Notificări**: Expo Notifications

## Structura Proiectului

```
MindfulTime/
├── src/
│   ├── components/          # Componente reutilizabile
│   ├── constants/           # Constante (culori, taskuri predefinite)
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # Configurare navigare
│   ├── native-modules/     # Module native pentru Android
│   ├── screens/            # Ecrane principale
│   │   ├── HomeScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   ├── AppsScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # Servicii business logic
│   │   ├── StorageService.ts
│   │   ├── TaskService.ts
│   │   └── TimeLimitService.ts
│   ├── store/              # State management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Funcții utilitare
├── App.tsx                 # Entry point
└── package.json
```

## Instalare și Configurare

### Prerequisite

- Node.js (v16 sau mai nou)
- npm sau yarn
- Expo CLI
- Android Studio

### Pași de instalare

1. **Clonează repository-ul**:
```bash
git clone https://github.com/your-username/ProiectLicenta.git
cd ProiectLicenta/MindfulTime
```

2. **Instalează dependențele**:
```bash
npm install
```

3. **Pornește aplicația**:

Pentru development cu Expo Go:
```bash
npm start
```

Pentru Android:
```bash
npm run android
```

Pentru Web (pentru testare):
```bash
npm run web
```

## Utilizare

### 1. Ecranul Principal (Home)
- Vizualizează starea curentă a utilizării aplicațiilor
- Vezi câte activități ai completat astăzi
- Monitorizează streak-ul tău

### 2. Activități (Tasks)
- Selectează o activitate mindfulness din lista predefinită
- Filtrează activități pe categorii:
  - Activități în aer liber
  - Lectură
  - Exerciții fizice
  - Meditație
  - Activități creative
  - Socializare
- Completează activitatea și fă o fotografie ca dovadă
- Câștigă minute suplimentare pentru aplicațiile tale

### 3. Aplicații (Apps)
- Vezi toate aplicațiile monitorizate
- Setează limite zilnice personalizate
- Monitorizează timpul rămas pentru fiecare aplicație
- Vezi statusul (activ/blocat) pentru fiecare aplicație

### 4. Statistici (Stats)
- Vezi statistici pe perioade (astăzi/săptămână/lună)
- Urmărește numărul de activități completate
- Vezi totalul minutelor câștigate
- Monitorizează streak-urile tale (zilnice și record)

### 5. Setări (Settings)
- Activează/dezactivează notificările
- Mod strict (blochează imediat la atingerea limitei)
- Setează obiectiv zilnic pentru activități mindfulness
- Gestionează datele aplicației

## Categorii de Activități Predefinite

### Activități în aer liber (30 min recompensă)
- Plimbare de 15 minute în aer liber cu fotografie

### Lectură (25 min recompensă)
- Citit 15 minute dintr-o carte fizică

### Meditație (20 min recompensă)
- Meditație sau respirație conștientă 10 minute

### Exerciții fizice (35 min recompensă)
- Exerciții sau stretching 15 minute

### Activități creative (30 min recompensă)
- Desenat, pictat sau alte activități creative 20 minute

### Socializare (25 min recompensă)
- Conversație față în față 15 minute

## Implementare Module Native

Pentru funcționalitatea completă de monitorizare și blocare a aplicațiilor, aplicația necesită module native.

### Android
- **UsageStatsManager API** pentru monitorizare
- **AccessibilityService** pentru blocare (opțional)

**Documentație detaliată**: Vezi [src/native-modules/README.md](src/native-modules/README.md)

## Permisiuni Necesare

### Android
- `PACKAGE_USAGE_STATS` - Pentru monitorizarea utilizării aplicațiilor
- `QUERY_ALL_PACKAGES` - Pentru listarea aplicațiilor instalate
- `CAMERA` - Pentru fotografiile de verificare
- `READ_EXTERNAL_STORAGE` - Pentru salvarea fotografiilor

## Testare

### Rulare teste (când vor fi implementate)
```bash
npm test
```

### Testare pe dispozitiv fizic

Aplicația necesită testare pe dispozitive fizice pentru:
- Monitorizarea reală a aplicațiilor
- Funcționalitatea camerei
- Notificările
- Permisiunile speciale

**Notă**: Emulatorii/simulatoarele au limitări în ceea ce privește accesul la datele de utilizare a aplicațiilor.

## Build pentru Producție

### Android (APK/AAB)
```bash
eas build --platform android
```

**Notă**: Necesită configurare Expo Application Services (EAS)

## Roadmap / Funcționalități Viitoare

- [ ] Implementare completă module native Android
- [ ] Sistem de notificări (avertizări când se apropie limita)
- [ ] Activități personalizate (utilizatorii pot adăuga propriile activități)
- [ ] Gamification (badges, achievements)
- [ ] Backup cloud (sincronizare pe multiple dispozitive)
- [ ] Widget-uri pentru ecranul principal
- [ ] Rapoarte săptămânale/lunare
- [ ] Partajare progres cu prietenii
- [ ] Machine Learning pentru detectarea automată a activităților din fotografii
- [ ] Integrare cu alte aplicații de wellbeing

## Provocări Tehnice

### 1. Monitorizare Aplicații
- Necesită permisiuni speciale (Usage Stats)
- **Soluție curentă**: Implementare demo pentru UI, module native în dezvoltare

### 2. Blocarea Aplicațiilor
- Necesită Accessibility Service (problematic pentru store approval)
- **Alternativă**: Overlay-uri și notificări în loc de blocare hard

### 3. Verificare Fotografii
- **Challenge**: Verificarea autenticității activității
- **Soluție viitoare**: ML models pentru detectarea contextului (outdoor, carte, exerciții etc.)

## Contribuții

Contribuțiile sunt binevenite! Pentru schimbări majore:

1. Fork repository-ul
2. Creează un branch pentru feature-ul tău (`git checkout -b feature/AmazingFeature`)
3. Commit schimbările (`git commit -m 'Add some AmazingFeature'`)
4. Push pe branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

## Licență

Acest proiect este dezvoltat ca parte a unei lucrări de licență.

## Contact & Support

Pentru întrebări sau sugestii, deschide un issue pe GitHub.

---

## Getting Started cu Development

### Prima rulare

După instalarea dependențelor, aplicația va porni cu date demo:

1. **Adaugă aplicații de monitorizat** (manual pentru început)
2. **Completează o activitate** din tab-ul Tasks
3. **Fă o fotografie** pentru verificare
4. **Câștigă minute suplimentare** care se distribuie la aplicațiile tale

### Hot Reload

Expo oferă hot reload automat - modificările în cod se reflectă imediat în aplicație.

### Debug

- Shake device pentru debug menu
- `Ctrl+M` pentru dev menu
- React DevTools pentru inspectarea componentelor

### Logs

```bash
# Expo logs
npx expo start

# Android logs
adb logcat
```

## Arhitectură

### Services Layer
- **StorageService**: Gestionează persistența datelor (AsyncStorage)
- **TaskService**: Business logic pentru activități mindfulness
- **TimeLimitService**: Gestionează limitele de timp și blocarea

### State Management
- În prezent folosim React hooks (useState, useEffect)
- Pentru viitor: Context API sau Redux pentru state global

### Type Safety
- TypeScript strict mode
- Type definitions complete în `src/types/`

---

**Dezvoltat cu ❤️ pentru o viață digitală mai echilibrată**
