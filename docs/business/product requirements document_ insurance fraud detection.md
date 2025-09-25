# Product Requirements Document: Insurance Fraud Detection PoC

## Executive Summary

Sviluppo di una Proof of Concept per un sistema di rilevamento frodi negli incidenti automobilistici, progettato per supportare gli investigatori assicurativi nell'identificazione di sinistri sospetti attraverso analisi avanzata dei dati e machine learning.

## Product Overview

### Obiettivi del Prodotto

- **Primario:** Automatizzare la valutazione del rischio frode per sinistri automobilistici
- **Secondario:** Fornire strumenti di analisi visuale per supportare le decisioni investigative
- **Strategico:** Dimostrare il valore dell'AI nell'ottimizzazione dei processi assicurativi


### Value Proposition

- Riduzione del 40% dei tempi di valutazione preliminare
- Identificazione proattiva di pattern fraudolenti
- Dashboard intuitiva per investigatori non-tecnici
- Score di rischio standardizzato e interpretabile


## Scope e Funzionalità

### Core Features

#### 1. Dataset Management System

- **Generazione dati sintetici:** Simulazione di 10,000+ sinistri con variabilità realistica
- **Data validation:** Controlli di consistenza e completezza automatici
- **Import/Export:** Supporto formati CSV, JSON, Parquet
- **Data lineage:** Tracciabilità delle trasformazioni sui dati


#### 2. Risk Scoring Engine

- **Algoritmo ML:** Ensemble di Random Forest, Gradient Boosting, Logistic Regression
- **Score normalizzato:** Scala 1-100 con soglie configurabili (Verde: 1-30, Giallo: 31-70, Rosso: 71-100)
- **Feature importance:** Ranking dei fattori contributivi al rischio
- **Explainable AI:** Interpretazione delle predizioni per compliance


#### 3. Analytics Dashboard

- **Overview KPIs:** Distribuzione rischi, trend temporali, performance modelli
- **Case Explorer:** Ricerca e filtri multi-dimensionali per singoli sinistri
- **Pattern Analysis:** Correlazioni geografiche, temporali e comportamentali
- **Comparative Analysis:** Benchmarking tra diverse tipologie di sinistri


#### 4. Interactive Visualization

- **Heatmaps geografiche:** Concentrazione frodi per zona
- **Time series plots:** Trend stagionali e anomalie temporali
- **Network graphs:** Relazioni tra soggetti coinvolti
- **Statistical charts:** Distribuzioni, box plots, scatter plots
