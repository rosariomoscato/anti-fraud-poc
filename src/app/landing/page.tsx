"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  BarChart3, 
  Search, 
  TrendingUp,
  Zap,
  Database,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Reindirizza gli utenti già loggati alla dashboard
  useEffect(() => {
    if (!isPending && session) {
      router.push('/');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Reindirizzamento alla dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sistema Avanzato di Rilevamento Frodi Assicurative
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Proteggi la tua azienda dalle frodi con intelligenza artificiale, machine learning e analytics in tempo reale
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/dashboard">Inizia Ora</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" asChild>
              <a href="#funzionalita">Scopri di più</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funzionalita" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Funzionalità Principali</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Una soluzione completa per la gestione e prevenzione delle frodi assicurative
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dashboard in Tempo Reale</h3>
            <p className="text-gray-600">
              Monitoraggio continuo delle attività con metriche aggiornate e visualizzazioni interattive
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Rilevamento AI</h3>
            <p className="text-gray-600">
              Algoritmi avanzati di machine learning per identificare pattern sospetti e frodi
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
              <Search className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Gestione Indagini</h3>
            <p className="text-gray-600">
              Sistema completo per tracciare e gestire le indagini in corso con assegnazione automatica
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Analytics Avanzate</h3>
            <p className="text-gray-600">
              Analisi predittiva e report dettagliati per identificare trend e pattern di frode
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dati Sintetici</h3>
            <p className="text-gray-600">
              Generazione di dati di test realistici per addestrare e migliorare i modelli di detection
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Performance Ottimale</h3>
            <p className="text-gray-600">
              Processamento rapido e scalabile con tempi di risposta inferiori al secondo
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">99.9%</div>
              <div className="text-gray-600">Accuracy Detection</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">&lt;1s</div>
              <div className="text-gray-600">Tempo di Risposta</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">87%</div>
              <div className="text-gray-600">Riduzione Frodi</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Monitoraggio</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto a Proteggere la Tua Azienda?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Unisciti alle aziende che già utilizzano il nostro sistema per combattere le frodi assicurative
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link href="/dashboard">Inizia la Protezione</Link>
          </Button>
        </div>
      </section>

      </div>
  );
}