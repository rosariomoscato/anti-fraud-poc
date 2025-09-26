"use client";

import Link from "next/link";
import { Shield, BarChart3, Database, Code, Mail, Linkedin, ExternalLink, FileText, Eye, CheckCircle, Zap, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Anti-Fraud System</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sistema di Rilevamento Frodi</p>
              </div>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-600/10 dark:bg-red-600/20">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Anti-Fraud System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Sistema Avanzato di Rilevamento e Analisi delle Frodi
          </p>
        </div>

        {/* Features Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Caratteristiche Principali
            </CardTitle>
            <CardDescription>
              Scopri le funzionalità che rendono il nostro sistema unico e potente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Dashboard Analitica</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visualizzazione in tempo reale delle transazioni sospette e dei trend di frode
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Dati Sintetici</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generazione di dati di test realistici per simulare scenari di frode
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Report Dettagliati</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Esportazione di indagini in formati multipli (HTML, JSON, CSV)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Gestione Investigatori</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assegnazione sistematica delle indagini agli investigatori disponibili
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Analisi in Tempo Reale</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monitoraggio continuo delle transazioni con rilevamento immediato delle anomalie
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Tracciamento Stato</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gestione completa del ciclo di vita delle indagini e delle frodi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Index Calculation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Indice di Frode: Come Funziona
            </CardTitle>
            <CardDescription>
              Comprendere il calcolo dell&apos;indice di rischio frode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Fattori di Calcolo
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-600">
                    <h4 className="font-medium text-gray-900 dark:text-white">Importo Transazione</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transazioni di importo elevato ricevono un punteggio di rischio maggiore
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-600">
                    <h4 className="font-medium text-gray-900 dark:text-white">Frequenza</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Numero di transazioni in un intervallo di tempo ristretto
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-600">
                    <h4 className="font-medium text-gray-900 dark:text-white">Comportamento Anomalo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deviazioni dai pattern normali di comportamento
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600">
                    <h4 className="font-medium text-gray-900 dark:text-white">Localizzazione Geografica</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transazioni da location insolite o sospette
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Livelli di Rischio
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0-30</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Basso Rischio</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">31-70</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Medio Rischio</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">71-100</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Alto Rischio</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Tecnologie Utilizzate
            </CardTitle>
            <CardDescription>
              Le tecnologie moderne che alimentano il nostro sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Frontend</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Next.js 14 - Framework React full-stack</li>
                  <li>• TypeScript - Tipizzazione sicura</li>
                  <li>• Tailwind CSS - Styling moderno</li>
                  <li>• shadcn/ui - Componenti UI accessibili</li>
                  <li>• Radix UI - Primitives accessibili</li>
                  <li>• Lucide React - Icone moderne</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Backend & Database</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Node.js - Runtime JavaScript</li>
                  <li>• Drizzle ORM - Query builder TypeScript</li>
                  <li>• PostgreSQL - Database relazionale</li>
                  <li>• API Routes - Endpoint Next.js</li>
                  <li>• NextAuth - Autenticazione</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sviluppatore
            </CardTitle>
            <CardDescription>
              Informazioni sullo sviluppatore del progetto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600">
                <span className="text-white text-xl font-bold">RM</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">RosMoS</h3>
                <p className="text-gray-600 dark:text-gray-400">Full Stack Developer</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-red-600" />
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <a 
                    href="mailto:r.moscato@ilivetech.it" 
                    className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    r.moscato@ilivetech.it
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-red-600" />
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">LinkedIn:</span>
                  <a 
                    href="https://www.linkedin.com/in/rosariomoscato/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors inline-flex items-center gap-1"
                  >
                    linkedin.com/in/rosariomoscato
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Sviluppato con ❤️ utilizzando tecnologie moderne e best practices
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
            <Link href="/">
              <Shield className="mr-2 h-4 w-4" />
              Vai alla Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" asChild>
            <Link href="/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analisi Avanzate
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 Anti-Fraud System. Sviluppato da RosMoS.</p>
            <p className="mt-1">
              Contattaci: <a href="mailto:r.moscato@ilivetech.it" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                r.moscato@ilivetech.it
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}