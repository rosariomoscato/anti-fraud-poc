"use client";

import Link from "next/link";
import { Shield, BarChart3, Database, Code, Mail, Linkedin, ExternalLink, FileText, Eye, CheckCircle, Zap, Users, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Info className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Info</h1>
                <p className="text-xs text-muted-foreground">Guida e Informazioni</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">

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
                  <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Dashboard Analitica</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualizzazione in tempo reale delle transazioni sospette e dei trend di frode
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Dati Sintetici</h3>
                    <p className="text-sm text-muted-foreground">
                      Generazione di dati di test realistici per simulare scenari di frode
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Report Dettagliati</h3>
                    <p className="text-sm text-muted-foreground">
                      Esportazione di indagini in formati multipli (HTML, JSON, CSV)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Gestione Investigatori</h3>
                    <p className="text-sm text-muted-foreground">
                      Assegnazione sistematica delle indagini agli investigatori disponibili
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Analisi in Tempo Reale</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitoraggio continuo delle transazioni con rilevamento immediato delle anomalie
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Tracciamento Stato</h3>
                    <p className="text-sm text-muted-foreground">
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
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Fattori di Calcolo
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-600 dark:bg-red-900/20 dark:border-red-500">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Importo Transazione</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Transazioni di importo elevato ricevono un punteggio di rischio maggiore
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600 dark:bg-orange-900/20 dark:border-orange-500">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Frequenza</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Numero di transazioni in un intervallo di tempo ristretto
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600 dark:bg-yellow-900/20 dark:border-yellow-500">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Comportamento Anomalo</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Deviazioni dai pattern normali di comportamento
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600 dark:bg-blue-900/20 dark:border-blue-500">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Localizzazione Geografica</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Transazioni da location insolite o sospette
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Livelli di Rischio
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-yellow-100">0-30</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-yellow-200">Basso Rischio</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-100">31-70</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-yellow-200">Medio Rischio</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                    <div className="text-2xl font-bold text-red-600 dark:text-yellow-100">71-100</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-yellow-200">Alto Rischio</div>
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
                <h4 className="font-semibold text-foreground">Frontend</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• TypeScript - Tipizzazione sicura</li>
                  <li>• Tailwind CSS - Styling moderno</li>
                  <li>• shadcn/ui - Componenti UI accessibili</li>
                  <li>• Radix UI - Primitives accessibili</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Backend & Database</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Node.js - Runtime JavaScript</li>
                  <li>• Drizzle ORM - Query builder TypeScript</li>
                  <li>• PostgreSQL - Database relazionale</li>
                  <li>• Better Auth - Autenticazione</li>
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
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80">
                <span className="text-primary-foreground text-xl font-bold">RM</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">RoMoS</h3>
                <p className="text-muted-foreground">Full Stack Developer</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <a 
                    href="mailto:r.moscato@ilivetech.it" 
                    className="ml-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    r.moscato@ilivetech.it
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-sm text-muted-foreground">LinkedIn:</span>
                  <a 
                    href="https://www.linkedin.com/in/rosariomoscato/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  >
                    linkedin.com/in/rosariomoscato
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Sviluppato con ❤️ utilizzando tecnologie moderne e best practices
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg">
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

      </div>
  );
}