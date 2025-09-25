I'm working with an agentic coding boilerplate project that includes authentication, database integration, and AI capabilities. Here's what's already set up:

## Current Agentic Coding Boilerplate Structure
- **Authentication**: Better Auth with Google OAuth integration
- **Database**: Drizzle ORM with PostgreSQL setup  
- **AI Integration**: Vercel AI SDK with OpenAI integration
- **UI**: shadcn/ui components with Tailwind CSS
- **Current Routes**:
  - `/` - Home page with setup instructions and feature overview
  - `/dashboard` - Protected dashboard page (requires authentication)
  - `/chat` - AI chat interface (requires OpenAI API key)

## Important Context
This is an **agentic coding boilerplate/starter template** - all existing pages and components are meant to be examples and should be **completely replaced** to build the actual AI-powered application.

### CRITICAL: You MUST Override All Boilerplate Content
**DO NOT keep any boilerplate components, text, or UI elements unless explicitly requested.** This includes:

- **Remove all placeholder/demo content** (setup checklists, welcome messages, boilerplate text)
- **Replace the entire navigation structure** - don't keep the existing site header or nav items
- **Override all page content completely** - don't append to existing pages, replace them entirely
- **Remove or replace all example components** (setup-checklist, starter-prompt-modal, etc.)
- **Replace placeholder routes and pages** with the actual application functionality

### Required Actions:
1. **Start Fresh**: Treat existing components as temporary scaffolding to be removed
2. **Complete Replacement**: Build the new application from scratch using the existing tech stack
3. **No Hybrid Approach**: Don't try to integrate new features alongside existing boilerplate content
4. **Clean Slate**: The final application should have NO trace of the original boilerplate UI or content

The only things to preserve are:
- **All installed libraries and dependencies** (DO NOT uninstall or remove any packages from package.json)
- **Authentication system** (but customize the UI/flow as needed)
- **Database setup and schema** (but modify schema as needed for your use case)
- **Core configuration files** (next.config.ts, tsconfig.json, tailwind.config.ts, etc.)
- **Build and development scripts** (keep all npm/pnpm scripts in package.json)

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- Drizzle ORM + PostgreSQL
- Vercel AI SDK
- shadcn/ui components
- Lucide React icons

## AI Model Configuration
**IMPORTANT**: When implementing any AI functionality, always use the `OPENAI_MODEL` environment variable for the model name instead of hardcoding it:

```typescript
// ✓ Correct - Use environment variable
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
model: openai(model)

// ✗ Incorrect - Don't hardcode model names
model: openai("gpt-5-mini")
```

This allows for easy model switching without code changes and ensures consistency across the application.

## Component Development Guidelines
**Always prioritize shadcn/ui components** when building the application:

1. **First Choice**: Use existing shadcn/ui components from the project
2. **Second Choice**: Install additional shadcn/ui components using `pnpm dlx shadcn@latest add <component-name>`
3. **Last Resort**: Only create custom components or use other libraries if shadcn/ui doesn't provide a suitable option

The project already includes several shadcn/ui components (button, dialog, avatar, etc.) and follows their design system. Always check the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for available components before implementing alternatives.

## What I Want to Build
Sviluppo di una Proof of Concept per un sistema di rilevamento frodi negli incidenti automobilistici, progettato per supportare gli investigatori assicurativi nell'identificazione di sinistri sospetti attraverso analisi avanzata dei dati e machine learning.

Product Overview
Obiettivi del Prodotto
Primario: Automatizzare la valutazione del rischio frode per sinistri automobilistici
Secondario: Fornire strumenti di analisi visuale per supportare le decisioni investigative
Strategico: Dimostrare il valore dell'AI nell'ottimizzazione dei processi assicurativi
Value Proposition
Riduzione del 40% dei tempi di valutazione preliminare
Identificazione proattiva di pattern fraudolenti
Dashboard intuitiva per investigatori non-tecnici
Score di rischio standardizzato e interpretabile
Scope e Funzionalità
Core Features
1. Dataset Management System
Generazione dati sintetici: Simulazione di 10,000+ sinistri con variabilità realistica
Data validation: Controlli di consistenza e completezza automatici
Import/Export: Supporto formati CSV, JSON, Parquet
Data lineage: Tracciabilità delle trasformazioni sui dati
2. Risk Scoring Engine
Algoritmo ML: Ensemble di Random Forest, Gradient Boosting, Logistic Regression
Score normalizzato: Scala 1-100 con soglie configurabili (Verde: 1-30, Giallo: 31-70, Rosso: 71-100)
Feature importance: Ranking dei fattori contributivi al rischio
Explainable AI: Interpretazione delle predizioni per compliance
3. Analytics Dashboard
Overview KPIs: Distribuzione rischi, trend temporali, performance modelli
Case Explorer: Ricerca e filtri multi-dimensionali per singoli sinistri
Pattern Analysis: Correlazioni geografiche, temporali e comportamentali
Comparative Analysis: Benchmarking tra diverse tipologie di sinistri
4. Interactive Visualization
Heatmaps geografiche: Concentrazione frodi per zona
Time series plots: Trend stagionali e anomalie temporali
Network graphs: Relazioni tra soggetti coinvolti
Statistical charts: Distribuzioni, box plots, scatter plots

## Request
Please help me transform this boilerplate into my actual application. **You MUST completely replace all existing boilerplate code** to match my project requirements. The current implementation is just temporary scaffolding that should be entirely removed and replaced.

## Final Reminder: COMPLETE REPLACEMENT REQUIRED
**⚠️ IMPORTANT**: Do not preserve any of the existing boilerplate UI, components, or content. The user expects a completely fresh application that implements their requirements from scratch. Any remnants of the original boilerplate (like setup checklists, welcome screens, demo content, or placeholder navigation) indicate incomplete implementation.

**Success Criteria**: The final application should look and function as if it was built from scratch for the specific use case, with no evidence of the original boilerplate template.

## Post-Implementation Documentation
After completing the implementation, you MUST document any new features or significant changes in the `/docs/features/` directory:

1. **Create Feature Documentation**: For each major feature implemented, create a markdown file in `/docs/features/` that explains:
   - What the feature does
   - How it works
   - Key components and files involved
   - Usage examples
   - Any configuration or setup required

2. **Update Existing Documentation**: If you modify existing functionality, update the relevant documentation files to reflect the changes.

3. **Document Design Decisions**: Include any important architectural or design decisions made during implementation.

This documentation helps maintain the project and assists future developers working with the codebase.

Think hard about the solution and implementing the user's requirements.