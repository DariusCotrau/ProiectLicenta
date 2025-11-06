# Quick Start Guide - MindfulTime

## Setup Rapid (5 minute)

### 1. Instalare Dependențe

```bash
cd MindfulTime
npm install
```

### 2. Pornire Aplicație

```bash
npm start
```

Acest command va deschide Expo DevTools în browser. Ai următoarele opțiuni:

- **Android**: Apasă `a` în terminal sau scanează QR code-ul cu Expo Go
- **iOS**: Apasă `i` în terminal sau scanează QR code-ul cu camera (necesită macOS)
- **Web**: Apasă `w` în terminal

### 3. Testare pe Dispozitiv Fizic

#### Android:
1. Instalează [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) din Play Store
2. Scanează QR code-ul din terminal/browser
3. Aplicația se va încărca automat

#### iOS:
1. Instalează [Expo Go](https://apps.apple.com/app/expo-go/id982107779) din App Store
2. Scanează QR code-ul cu aplicația Camera
3. Deschide în Expo Go

## Prima Utilizare

### Date Demo

Aplicația vine cu date demo pre-configurate:

- **5 aplicații monitorizate**: Instagram, Facebook, TikTok, YouTube, Twitter
- **8 activități mindfulness** predefinite
- **Statistici demo**: 12 activități completate, 3 zile streak

### Testare Funcționalități

1. **Ecran Home**:
   - Vezi dashboard-ul cu aplicațiile blocate
   - Verifică progresul zilnic
   - Observă streak-ul curent (3 zile)

2. **Completare Activitate**:
   - Mergi la tab-ul "Activități"
   - Selectează o activitate (ex: "Plimbare în aer liber")
   - Dacă necesită foto: ia o fotografie
   - Câștigi minute suplimentare!

3. **Gestionare Aplicații**:
   - Mergi la tab-ul "Aplicații"
   - Vezi aplicațiile și limitele lor
   - Editează limita zilnică pentru o aplicație
   - Observă statusul (activ/blocat)

4. **Statistici**:
   - Mergi la tab-ul "Statistici"
   - Schimbă perioada (astăzi/săptămână/lună)
   - Vezi numărul de activități și minute câștigate

5. **Setări**:
   - Mergi la tab-ul "Setări"
   - Activează/dezactivează notificările
   - Setează obiectivul zilnic
   - Test: Șterge toate datele și reîncarcă app

## Dezvoltare

### Hot Reload

- Salvează orice fișier → aplicația se actualizează automat
- Shake device sau `Cmd+D` (iOS) / `Ctrl+M` (Android) pentru dev menu

### Logs

Logs-urile apar în terminal unde ai rulat `npm start`.

### Debugging

```bash
# Deschide React DevTools
npx react-devtools
```

## Structura Codului

```
src/
├── screens/          # Cele 5 ecrane principale
├── services/         # Business logic
├── types/           # TypeScript definitions
├── constants/       # Date predefinite (tasks, colors)
├── navigation/      # React Navigation config
└── utils/          # Funcții helper
```

### Fișiere Importante

- `App.tsx` - Entry point, inițializare app
- `src/navigation/AppNavigator.tsx` - Tab navigation
- `src/services/TaskService.ts` - Logica pentru activități
- `src/services/TimeLimitService.ts` - Logica pentru limite
- `src/services/StorageService.ts` - Persistență date

## Common Tasks

### Adaugă o Activitate Nouă

Editează `src/constants/tasks.ts`:

```typescript
{
  id: 'my-new-task',
  title: 'Activitatea Mea',
  description: 'Descriere detaliată',
  category: TaskCategory.OUTDOOR,
  timeReward: 30,
  icon: 'walk',
  requiresPhoto: true,
}
```

### Schimbă Culorile

Editează `src/constants/colors.ts`:

```typescript
export const colors = {
  primary: '#6200EE', // Schimbă culoarea principală
  // ...
};
```

### Modifică Datele Demo

Editează `src/utils/initializeDemoData.ts`:

```typescript
const demoApps: App[] = [
  {
    id: 'my-app',
    name: 'My App',
    packageName: 'com.example.app',
    dailyLimit: 60,
    usedTime: 0,
    isBlocked: false,
  },
];
```

## Troubleshooting

### Aplicația nu pornește

```bash
# Curăță cache-ul
npm start --clear

# Sau
npx expo start -c
```

### Erori TypeScript

```bash
# Repornește TypeScript server
# În VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Expo Go nu se conectează

- Asigură-te că telefonul și PC-ul sunt pe aceeași rețea WiFi
- Dezactivează firewall-ul temporar
- Folosește tunnel mode: `npm start --tunnel`

### Modificările nu apar

- Verifică că salvezi fișierul
- Shake device → Reload
- Restart dev server: `Ctrl+C` apoi `npm start`

## Build pentru Producție

### Configurare EAS (Expo Application Services)

```bash
# Instalează EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurare proiect
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

### Testare Build Local

```bash
# Android
npm run android --variant=release

# iOS
npm run ios --configuration Release
```

## Next Steps

După ce ești familiarizat cu aplicația:

1. Citește [DEVELOPMENT.md](DEVELOPMENT.md) pentru detalii arhitectură
2. Citește [src/native-modules/README.md](src/native-modules/README.md) pentru implementare native
3. Explorează și modifică codul pentru învățare
4. Implementează funcționalități noi

## Resurse Utile

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper Components](https://callstack.github.io/react-native-paper/)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Suport

Pentru probleme sau întrebări:
1. Verifică [DEVELOPMENT.md](DEVELOPMENT.md) - Common Issues & Solutions
2. Verifică documentația Expo
3. Deschide un issue pe GitHub

---

**Happy Coding! 🚀**
