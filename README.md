# Anti-Fraud System

Sistema avanzato di rilevamento frodi per sinistri automobilistici con intelligenza artificiale, machine learning e analytics dashboard per investigatori assicurativi.

## 🎯 Cos'è

Un'applicazione web completa progettata per aiutare le compagnie assicurative a identificare e gestire potenziali frodi nei sinistri automobilistici. Il sistema utilizza algoritmi avanzati di risk scoring per analizzare i sinistri e identificare pattern anomali che potrebbero indicare attività fraudolente.

## 🔧 A che serve

- **Rilevamento Frodi**: Analisi automatica dei sinistri per identificare potenziali frodi
- **Risk Assessment**: Calcolo automatico dell'indice di rischio frode per ogni sinistro
- **Gestione Investigazioni**: Assegnazione sistematica delle indagini agli investigatori
- **Dashboard Analitica**: Visualizzazione in tempo reale dei dati e delle tendenze
- **Report Dettagliati**: Esportazione delle analisi in vari formati (HTML, JSON, CSV)

## 🛠️ Tecnologie Utilizzate

### Frontend
- **Next.js 15**: Framework React full-stack con App Router
- **TypeScript**: Tipizzazione sicura per il codice JavaScript
- **Tailwind CSS**: Framework CSS per styling moderno e responsive
- **shadcn/ui**: Componenti UI accessibili e personalizzabili
- **Lucide React**: Icone moderne e scalabili

### Backend & Database
- **Node.js**: Runtime JavaScript per il server
- **Drizzle ORM**: Query builder TypeScript per PostgreSQL
- **PostgreSQL**: Database relazionale robusto
- **Better Auth**: Sistema di autenticazione moderno e sicuro

### Analytics & AI
- **Recharts**: Libreria per grafici e visualizzazioni dati
- **Custom Risk Engine**: Algoritmi proprietari per il calcolo del rischio frode

## ⭐ Punti di Forza

### 🔍 Algoritmi di Rilevamento Avanzati
- Analisi multifattoriale del rischio frode
- Considerazione di importo, frequenza, comportamento anomalo e localizzazione
- Risk score calcolato in tempo reale (0-100)

### 📊 Dashboard Intuitiva
- Visualizzazione dati in tempo reale
- Grafici interattivi e filtri dinamici
- Interfaccia responsive per desktop e mobile

### 🔄 Gestione Completa del Ciclo di Vita
- Creazione e gestione sinistri
- Assegnazione automatica agli investigatori
- Tracciamento dello stato delle indagini
- Reportistica dettagliata

### 🎨 Design System Coerente
- Interfaccia moderna e accessibile
- Tema chiaro/scuro integrato
- Componenti riutilizzabili e consistenti

## 💻 Risorse Necessarie

### Requisiti Minimi
- **Node.js**: Versione 18.0 o superiore
- **Git**: Per il controllo versione
- **PostgreSQL**: Versione 14 o superiore (locale o cloud)
- **RAM**: Minimo 4GB, consigliati 8GB
- **Storage**: Minimo 2GB di spazio libero

### Requisiti Consigliati
- **Node.js**: Versione 20.x o superiore
- **PostgreSQL**: Versione 15.x o superiore
- **RAM**: 8GB o più
- **Storage**: 5GB o più
- **Processore**: Multi-core per migliori performance

## 🚀 Installazione e Configurazione

### 1. Clona il Repository

```bash
git clone https://gitea.rosmoscato.xyz/ros/anti-fraud-poc.git
cd anti-fraud-poc
```

### 2. Installa le Dipendenze

```bash
npm install
```

### 3. Configurazione dell'Ambiente

Copia il file di ambiente di esempio:

```bash
cp example.env .env
```

Configura le variabili d'ambiente nel file `.env`:

```env
# Database PostgreSQL
POSTGRES_URL="postgresql://username:password@localhost:5432/anti_fraud_db"

# Autenticazione
BETTER_AUTH_SECRET="tua-secret-key-di-32-caratteri"

# Google OAuth (da Google Cloud Console)
GOOGLE_CLIENT_ID="tuo-google-client-id"
GOOGLE_CLIENT_SECRET="tuo-google-client-secret"

# OpenAI API (per funzionalità AI opzionali)
OPENAI_API_KEY="tuo-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"

# URL dell'applicazione
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup del Database

Genera ed esegui le migrazioni del database:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Avvia il Server di Sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile all'indirizzo [http://localhost:3000](http://localhost:3000)

## 🗂️ Struttura del Progetto

```
src/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── auth/                # Autenticazione
│   │   ├── claims/              # Gestione sinistri
│   │   ├── dashboard/           # Dati dashboard
│   │   ├── investigations/      # Gestione indagini
│   │   └── analytics/           # Analytics e report
│   ├── page.tsx                 # Dashboard principale
│   ├── claims/                  # Pagina sinistri
│   ├── info/                    # Pagina informativa
│   ├── admin/                   # Amministrazione
│   └── investigations/          # Pagina indagini
├── components/                  # Componenti React
│   ├── ui/                      # Componenti shadcn/ui
│   ├── auth/                    # Componenti autenticazione
│   ├── charts/                  # Componenti grafici
│   └── forms/                   # Componenti form
├── lib/                         # Utilità e configurazioni
│   ├── db.ts                    # Connessione database
│   ├── schema.ts                # Schema Drizzle
│   ├── auth.ts                  # Configurazione auth
│   ├── risk-calculator.ts       # Motore rischio frode
│   └── utils.ts                 # Funzioni utility
└── types/                       # TypeScript types
```

## 🔡 Script Disponibili

```bash
npm run dev              # Avvia server sviluppo
npm run build            # Build per produzione
npm run start            # Avvia server produzione
npm run lint             # Esegui ESLint
npm run typecheck        # Controllo tipi TypeScript

# Database
npm run db:generate      # Genera migrazioni
npm run db:migrate       # Esegui migrazioni
npm run db:push          # Push schema al database
npm run db:studio        # Apri Drizzle Studio
npm run db:dev           # Push schema per sviluppo
npm run db:reset         # Reset database
```

## 📊 Funzionalità Principali

### 🎯 Calcolo Indice di Frode
Il sistema calcola un indice di rischio frode (0-100) basato su:

- **Importo Transazione**: Transazioni di importo elevato ricevono punteggi maggiori
- **Frequenza**: Numero di sinistri in un intervallo di tempo ristretto
- **Comportamento Anomalo**: Deviazioni dai pattern normali
- **Localizzazione Geografica**: Transazioni da location insolite

### 📈 Dashboard Analytics
- Visualizzazione in tempo reale dei sinistri sospetti
- Trend di frode e analisi storiche
- Fattori di rischio principali
- Distribuzione geografica delle frodi

### 📋 Gestione Sinistri
- Form completo per l'inserimento sinistri
- Validazione automatica dei dati
- Calcolo immediato del rischio frode
- Generazione report investigativi

### 👥 Gestione Investigatori
- Assegnazione automatica delle indagini
- Tracciamento stato investigazioni
- Dashboard personalizzata per investigatori
- Sistema di notifiche

## 🌐 Pagine dell'Applicazione

- **Dashboard (`/`)**: Panoramica principale con statistiche e metriche
- **Nuovo Sinistro (`/claims/new`)**: Form per inserimento nuovi sinistri
- **Investigazioni (`/investigations`)**: Gestione delle indagini in corso
- **Analytics (`/analytics`)**: Analisi avanzate e report
- **Info (`/info`)**: Guida e informazioni sul sistema
- **Admin (`/admin`)**: Pannello amministrativo

## 🚀 Deployment

### Vercel (Consigliato)

1. Installa Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy dell'applicazione:
   ```bash
   vercel --prod
   ```

3. Configura le variabili d'ambiente nel dashboard Vercel

### Variabili d'Ambiente di Produzione

Assicurati di configurare queste variabili in produzione:

- `POSTGRES_URL` - Stringa connessione PostgreSQL
- `BETTER_AUTH_SECRET` - Secret key per autenticazione
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `OPENAI_API_KEY` - OpenAI API key (opzionale)
- `NEXT_PUBLIC_APP_URL` - URL dell'applicazione in produzione

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit delle modifiche (`git commit -m 'Aggiungi nuova funzionalità'`)
4. Push del branch (`git push origin feature/nuova-funzionalita`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è sotto licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

## 🆘 Supporto

In caso di problemi, visita la sezione Issues su Github:

**https://github.com/rosariomoscato/anti-fraud-poc/issues**

Prima di creare una nuova issue:
1. Controlla se il problema è già stato segnalato
2. Rivedi la documentazione sopra per verificare eventuali soluzioni
3. Crea una nuova issue fornendo informazioni dettagliate sul problema encountered

## ☕ Supporta il Progetto

Se trovi questo progetto utile e vuoi supportare il mio lavoro, considera di offrirmi un caffè! Il tuo supporto mi aiuta a mantenere e migliorare questo sistema.

[Buy Me a Coffee](https://paypal.me/rosmoscato)

---

**Sviluppato con ❤️ da RoMoS**
