"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  Upload,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SyntheticDataPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);

  // Reindirizza alla landing page se non autenticato
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Reindirizzamento...</p>
        </div>
      </div>
    );
  }

  const handleGenerateData = async (count: number) => {
    setIsGenerating(true);
    setGenerationStatus(`Generazione di ${count} sinistri sintetici in corso...`);
    
    try {
      const response = await fetch('/api/synthetic-data/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedCount(count);
        setGenerationStatus(`✅ ${result.message}`);
      } else {
        setGenerationStatus('❌ Errore durante la generazione dei dati');
      }
    } catch (error) {
      setGenerationStatus('❌ Errore di connessione al server');
    } finally {
      setIsGenerating(false);
    }
  };

  const dataGenerationOptions = [
    { count: 100, label: 'Picolo Dataset (100 sinistri)', description: 'Per test e sviluppo rapido' },
    { count: 1000, label: 'Dataset Medio (1,000 sinistri)', description: 'Per analisi base e testing' },
    { count: 5000, label: 'Dataset Grande (5,000 sinistri)', description: 'Per analisi statistiche significative' },
    { count: 10000, label: 'Dataset Completo (10,000 sinistri)', description: 'Per analisi completa e ML training' },
  ];

  const dataQualityMetrics = [
    { metric: 'Completezza', value: '100%', status: 'optimal', icon: CheckCircle },
    { metric: 'Consistenza', value: '99.8%', status: 'optimal', icon: CheckCircle },
    { metric: 'Validità', value: '99.5%', status: 'good', icon: CheckCircle },
    { metric: 'Unicità', value: '100%', status: 'optimal', icon: CheckCircle },
  ];

  const dataFeatures = [
    {
      title: 'Dati Anagrafici',
      description: 'Informazioni complete sui richiedenti con codici fiscali validi',
      icon: Database,
      features: ['Nome, cognome, email, telefono', 'Codice fiscale generato', 'Dati demografici realistici']
    },
    {
      title: 'Dati Veicoli',
      description: 'Informazioni dettagliate sui veicoli coinvolti',
      icon: BarChart3,
      features: ['Marche e modelli reali', 'Targa e VIN generati', 'Anno di immatricolazione']
    },
    {
      title: 'Dati Incidenti',
      description: 'Informazioni precise sugli incidenti',
      icon: AlertTriangle,
      features: ['Data e ora realistici', 'Località italiane reali', 'Tipologie di sinistro varie']
    },
    {
      title: 'Pattern di Frode',
      description: 'Indicatori di rischio e pattern fraudolenti',
      icon: Clock,
      features: ['Risk scoring automatico', 'Indicatori di frode', 'Pattern temporali e geografici']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-600">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Generatore Dati Sintetici</h1>
                <p className="text-sm text-gray-600">Sistema di generazione dati per test anti-frode</p>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Impostazioni
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Data Quality Metrics */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Qualità dei Dati Generati</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataQualityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <metric.icon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{metric.metric}</p>
                  <p className="text-sm text-gray-600">{metric.value}</p>
                </div>
                <Badge variant={metric.status === 'optimal' ? 'default' : 'secondary'}>
                  {metric.status === 'optimal' ? 'Ottimale' : 'Buono'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Data Generation */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Genera Dataset</h2>
            <div className="space-y-4">
              {dataGenerationOptions.map((option, index) => (
                <div key={index} className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{option.label}</h3>
                    <Badge variant="outline">{option.count} record</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  <Button 
                    onClick={() => handleGenerateData(option.count)}
                    disabled={isGenerating}
                    className="w-full"
                    variant={index === dataGenerationOptions.length - 1 ? "default" : "outline"}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generazione...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Genera
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {generationStatus && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{generationStatus}</p>
                {generatedCount > 0 && (
                  <p className="text-sm text-blue-600 mt-1">
                    Totale sinistri generati: {generatedCount.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Data Features */}
          <div className="space-y-6">
            {dataFeatures.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <feature.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.features.map((feat, featIndex) => (
                        <li key={featIndex} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Opzioni di Esportazione</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <Download className="h-5 w-5 mr-2 mb-2" />
              <div className="text-left">
                <p className="font-medium">Esporta CSV</p>
                <p className="text-sm text-gray-600">Formato compatibile Excel</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <Download className="h-5 w-5 mr-2 mb-2" />
              <div className="text-left">
                <p className="font-medium">Esporta JSON</p>
                <p className="text-sm text-gray-600">Formato strutturato</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <Download className="h-5 w-5 mr-2 mb-2" />
              <div className="text-left">
                <p className="font-medium">Esporta Parquet</p>
                <p className="text-sm text-gray-600">Formato ottimizzato</p>
              </div>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}