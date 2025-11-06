# Proiect Licență - MindfulTime

## Descriere Generală

Acest repository conține proiectul de licență: **MindfulTime** - o aplicație mobilă cross-platform care ajută utilizatorii să reducă timpul petrecut pe telefon prin încurajarea activităților mindfulness din lumea reală.

## Concept

MindfulTime este o aplicație inovatoare care combină:
- **Monitorizarea utilizării aplicațiilor** - tracking automat al timpului petrecut
- **Limite personalizabile** - setează limite zilnice pentru aplicațiile tale
- **Activități mindfulness** - ieși afară, citește, meditează, fă exerciții
- **Verificare prin fotografie** - dovadă vizuală a completării activităților
- **Sistem de recompense** - câștigă timp suplimentar prin activități benefice

## Structura Proiectului

```
ProiectLicenta/
├── MindfulTime/              # Aplicația React Native
│   ├── src/
│   │   ├── screens/          # Ecrane UI
│   │   ├── services/         # Business logic
│   │   ├── components/       # Componente reutilizabile
│   │   ├── navigation/       # Routing
│   │   └── types/           # TypeScript definitions
│   ├── App.tsx              # Entry point
│   ├── README.md            # Documentație detaliată
│   ├── QUICK_START.md       # Ghid rapid
│   └── DEVELOPMENT.md       # Ghid dezvoltare
└── README.md                # Acest fișier
```

## Quick Start

```bash
# Clonează repository-ul
git clone https://github.com/your-username/ProiectLicenta.git

# Intră în directorul aplicației
cd ProiectLicenta/MindfulTime

# Instalează dependențele
npm install

# Pornește aplicația
npm start
```

Pentru instrucțiuni detaliate, vezi [MindfulTime/QUICK_START.md](MindfulTime/QUICK_START.md)

## Tehnologii Utilizate

- **Framework**: React Native + Expo
- **Limbaj**: TypeScript
- **UI**: React Native Paper (Material Design)
- **Navigare**: React Navigation v6
- **Storage**: AsyncStorage
- **Camera**: Expo Camera & Image Picker
- **Platforme**: Android & iOS

## Caracteristici Principale

### ✅ Implementat

- [x] Arhitectură aplicație cross-platform
- [x] 5 ecrane principale (Home, Tasks, Apps, Stats, Settings)
- [x] 8 activități mindfulness predefinite
- [x] Sistem de tracking timp și limite
- [x] Verificare activități prin fotografie
- [x] Statistici și streak-uri
- [x] Sistem de recompense (minute câștigate)
- [x] UI/UX complet Material Design
- [x] TypeScript pentru type safety

### 🚧 În Dezvoltare

- [ ] Module native pentru monitorizare reală Android/iOS
- [ ] Sistem de notificări
- [ ] Blocare efectivă aplicații la atingerea limitei
- [ ] Activități personalizate de la utilizator
- [ ] Backup cloud / sincronizare

### 🔮 Planificat Viitor

- [ ] Machine Learning pentru verificare fotografii
- [ ] Gamification (badges, achievements)
- [ ] Widget-uri home screen
- [ ] Partajare progres social
- [ ] Rapoarte detaliate săptămânale

## Documentație

- **[MindfulTime/README.md](MindfulTime/README.md)** - Documentație completă aplicație
- **[MindfulTime/QUICK_START.md](MindfulTime/QUICK_START.md)** - Ghid rapid pornire
- **[MindfulTime/DEVELOPMENT.md](MindfulTime/DEVELOPMENT.md)** - Ghid dezvoltare și arhitectură
- **[MindfulTime/src/native-modules/README.md](MindfulTime/src/native-modules/README.md)** - Module native

## Setup Mediu Dezvoltare

### Prerequisites
- Node.js v16+
- npm sau yarn
- Expo CLI
- Android Studio (pentru Android)
- Xcode (pentru iOS, doar macOS)

### Instalare Rapidă

```bash
# Intră în directorul aplicației
cd MindfulTime

# Instalează dependențele
npm install

# Pornește development server
npm start

# Run pe Android
npm run android

# Run pe iOS (doar macOS)
npm run ios
```

## Project Status

📅 **Data început**: Noiembrie 2024
📊 **Status**: În dezvoltare activă
🎯 **Versiune curentă**: 1.0.0 (MVP)

## Autor

**Darius**
- GitHub: [@Darius](https://github.com/Darius)

---

**Dezvoltat pentru o viață digitală mai echilibrată**
