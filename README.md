# 📊 Historical Multi-Market Dashboard

Un dashboard finanziario interattivo e moderno costruito con **Next.js**, che fornisce analisi in tempo reale e storiche per ETF e titoli quotati sulla **Borsa Italiana (Milano)**.

![Versione 1.0](https://img.shields.io/badge/Version-1.0-blue)
![Next.js](https://img.shields.io/badge/Framework-Next.js-black)
![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC)
![Recharts](https://img.shields.io/badge/Charts-Recharts-FF6384)

## ✨ Funzionalità

- **Dati Reali in Tempo Reale**: Integrazione con Yahoo Finance per quotazioni aggiornate e dati storici accurati.
- **Analisi Tecnica Automatica**: Calcolo istantaneo di Medie Mobili Semplici (SMA), Esponenziali (EMA) e Deviazione Standard direttamente nel browser.
- **Interfaccia Interattiva**: Grafici zoomabili con persistenza della selezione e gestione fluida dei periodi temporali (30d, 90d, 1y, Max).
- **Focus Borsa Italiana**: Supporto completo per i ticker di Milano (es. `VUSA.MI`, `SWDA.MI`, `FTSEMIB.MI`) con prezzi visualizzati in **Euro (€)**.
- **Performance & Caching**: Sistema di caching intelligente (1 ora) per ottimizzare il numero di richieste API e garantire velocità estrema.

## 🚀 Tecnologie Utilizzate

- **Frontend**: React 18, Next.js 14 (App Router).
- **Grafica**: Tailwind CSS per il design responsivo e Recharts per le visualizzazioni dati.
- **Dati**: `yahoo-finance2` per il recupero dei dati di mercato.
- **Analisi**: Motore di calcolo custom in TypeScript per indicatori tecnici.

## 🛠️ Installazione Locale

1. Clona il repository:
   ```bash
   git clone https://github.com/chiarademeglio77/stock-dashboard.git
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
4. Apri [http://localhost:3000](http://localhost:3000) nel tuo browser.

## 💼 Per il Portfolio

Questo progetto dimostra competenza nella gestione di API esterne, visualizzazione di dati complessi e costruzione di interfacce utente dinamiche e professionali in ambiente professionale Next.js.

---
Creato da [Chiara De Meglio](https://github.com/chiarademeglio77)
