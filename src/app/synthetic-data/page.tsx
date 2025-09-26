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
  Settings,
  Percent,
  TrendingUp,
  Trash2,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SyntheticDataPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [fraudPercentage, setFraudPercentage] = useState(15);
  const [expectedFraudCount, setExpectedFraudCount] = useState(0);
  const [clearExisting, setClearExisting] = useState(true);
  const [existingCount, setExistingCount] = useState(0);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [selectedDatasetSize, setSelectedDatasetSize] = useState(100);

  // Reindirizza alla landing page se non autenticato
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    }
  }, [session, isPending, router]);

  // Check existing data on component mount
  useEffect(() => {
    const checkExistingData = async () => {
      if (session) {
        setIsLoadingExisting(true);
        try {
          const response = await fetch('/api/synthetic-data/count');
          if (response.ok) {
            const data = await response.json();
            setExistingCount(data.count || 0);
          }
        } catch (error) {
          console.error('Error checking existing data:', error);
        } finally {
          setIsLoadingExisting(false);
        }
      }
    };
    
    checkExistingData();
  }, [session]);

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
          <p className="text-muted-foreground">Reindirizzamento...</p>
        </div>
      </div>
    );
  }

  const handleGenerateData = async (count: number) => {
    setIsGenerating(true);
    setSelectedDatasetSize(count);
    const expectedFraud = Math.round(count * fraudPercentage / 100);
    setExpectedFraudCount(expectedFraud);
    
    let statusMessage = `Generazione di ${count} sinistri con ${fraudPercentage}% frode (${expectedFraud} attesi)`;
    if (clearExisting && existingCount > 0) {
      statusMessage += ` e cancellazione di ${existingCount} sinistri esistenti`;
    }
    statusMessage += ' in corso...';
    
    setGenerationStatus(statusMessage);
    
    try {
      const response = await fetch('/api/synthetic-data/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count, fraudPercentage, clearExisting }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedCount(count);
        setExistingCount(clearExisting ? count : existingCount + count);
        setGenerationStatus(`✅ ${result.message}`);
        setExpectedFraudCount(result.expectedFraudCount || expectedFraud);
        // Resetta generatedCount dopo 5 secondi per permettere nuove generazioni con messaggio corretto
        setTimeout(() => {
          setGeneratedCount(0);
        }, 5000);
      } else {
        setGenerationStatus('❌ Errore durante la generazione dei dati');
      }
    } catch {
      setGenerationStatus('❌ Errore di connessione al server');
    } finally {
      setIsGenerating(false);
    }
  };

  // Funzione per calcolare il totale finale
  const calculateFinalTotal = (datasetSize: number) => {
    return existingCount + datasetSize;
  };

  // Funzione per esportare i dati
  const handleExport = async (format: 'csv' | 'json' | 'parquet') => {
    try {
      const response = await fetch('/api/synthetic-data/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });

      if (response.ok) {
        if (format === 'parquet') {
          // For Parquet, show a message since we can't directly download
          const result = await response.json();
          alert(result.message);
        } else {
          // For CSV and JSON, trigger file download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          
          // Get filename from response headers
          const contentDisposition = response.headers.get('Content-Disposition');
          const filename = contentDisposition 
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `sinistri_assicurativi_${new Date().toISOString().split('T')[0]}.${format}`;
          
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        const error = await response.json();
        alert(`Errore durante l'esportazione: ${error.error}`);
      }
    } catch {
      alert('Errore di connessione al server durante l\'esportazione');
    }
  };

  const dataGenerationOptions = [
    { count: 100, label: 'Piccolo Dataset (100 sinistri)', description: 'Per test e sviluppo rapido' },
    { count: 1000, label: 'Dataset Medio (1,000 sinistri)', description: 'Per analisi base e testing' },
    { count: 5000, label: 'Dataset Grande (5,000 sinistri)', description: 'Per analisi statistiche significative' },
    { count: 10000, label: 'Dataset Completo (10,000 sinistri)', description: 'Per analisi completa e ML training' },
  ];

  const fraudPercentagePresets = [
    { percentage: 0, label: '0% - Nessuna frode', description: 'Dataset pulito per test baseline' },
    { percentage: 5, label: '5% - Rischio basso', description: 'Scenario realistico standard' },
    { percentage: 15, label: '15% - Rischio moderato', description: 'Scenario con frode significativa' },
    { percentage: 30, label: '30% - Rischio alto', description: 'Scenario ad alto rischio frodi' },
    { percentage: 50, label: '50% - Rischio molto alto', description: 'Scenario a rischio frodi molto alto' },
    { percentage: 75, label: '75% - Rischio estremo', description: 'Scenario a rischio frodi estremo' },
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Database className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Generatore Dati Sintetici</h1>
                <p className="text-sm text-muted-foreground">Sistema di generazione dati per test anti-frode</p>
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
        {/* Existing Data Status */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Stato Dataset Esistente</h2>
          <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Sinistri presenti nel database</p>
                <p className="text-sm text-muted-foreground">Dataset attualmente caricato</p>
              </div>
            </div>
            <div className="text-right">
              {isLoadingExisting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-primary">{existingCount.toLocaleString()}</p>
                  <p className="text-sm text-primary">record</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Data Quality Metrics */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Qualità dei Dati Generati</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataQualityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <metric.icon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">{metric.metric}</p>
                  <p className="text-sm text-muted-foreground">{metric.value}</p>
                </div>
                <Badge variant={metric.status === 'optimal' ? 'default' : 'secondary'}>
                  {metric.status === 'optimal' ? 'Ottimale' : 'Buono'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-8">
          {/* Fraud Percentage Control */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Percentuale Frodi</h2>
            
            {/* Custom Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Percentuale frodi personalizzata</label>
                <div className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-primary" />
                  <span className="text-lg font-semibold text-primary">{fraudPercentage}%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fraudPercentage}
                onChange={(e) => setFraudPercentage(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground mb-3">Presets rapidi:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {fraudPercentagePresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant={fraudPercentage === preset.percentage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFraudPercentage(preset.percentage)}
                    disabled={isGenerating}
                    className="text-xs h-auto p-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-xs opacity-75">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Data Management Options */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    disabled={isGenerating}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <p className="font-medium text-foreground">Cancella dataset esistente</p>
                    <p className="text-sm text-muted-foreground">
                      {existingCount > 0 
                        ? `Rimuoverà ${existingCount} sinistri esistenti prima della generazione`
                        : 'Nessun dato presente da cancellare'
                      }
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {existingCount > 0 && !clearExisting && generatedCount === 0 && (
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Info className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Attenzione</p>
                  <p className="text-sm text-yellow-700">
                    I nuovi dati verranno aggiunti a quelli esistenti. 
                    Totale finale: {calculateFinalTotal(selectedDatasetSize).toLocaleString()} record
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Expected Fraud Display */}
          {generatedCount > 0 && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Frodi attese:</span>
                </div>
                <span className="text-lg font-semibold text-primary">
                  {expectedFraudCount} / {generatedCount} ({fraudPercentage}%)
                </span>
              </div>
            </div>
          )}
          </Card>

        </div>

          {/* Data Generation */}
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Genera Dataset</h2>
            <div className="space-y-4">
              {dataGenerationOptions.map((option, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  onMouseEnter={() => setSelectedDatasetSize(option.count)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{option.label}</h3>
                    <Badge variant="outline">{option.count} record</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
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
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground">{generationStatus}</p>
                {generatedCount > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Totale sinistri generati: {generatedCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      Frodi attese: {expectedFraudCount.toLocaleString()} ({fraudPercentage}%)
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

        {/* Data Features */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Caratteristiche dei Dati</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {dataFeatures.map((feature, index) => (
              <Card key={index} className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="font-semibold text-foreground text-sm mb-2">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.features.map((feat, featIndex) => (
                        <li key={featIndex} className="text-xs text-muted-foreground flex items-start">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span className="text-left leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Export Options */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Opzioni di Esportazione</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4"
              onClick={() => handleExport('csv')}
              disabled={existingCount === 0}
            >
              <Download className="h-5 w-5 mr-2 mb-2" />
              <div className="text-left">
                <p className="font-medium text-foreground">Esporta CSV</p>
                <p className="text-sm text-muted-foreground">Formato compatibile Excel</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4"
              onClick={() => handleExport('json')}
              disabled={existingCount === 0}
            >
              <Download className="h-5 w-5 mr-2 mb-2" />
              <div className="text-left">
                <p className="font-medium text-foreground">Esporta JSON</p>
                <p className="text-sm text-muted-foreground">Formato strutturato</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4"
              onClick={() => handleExport('parquet')}
              disabled={existingCount === 0}
            >
              <Download className="h-5 w-5 mr-2 mb-2" />
              <div className="text-left">
                <p className="font-medium text-foreground">Esporta Parquet</p>
                <p className="text-sm text-muted-foreground">Formato ottimizzato</p>
              </div>
            </Button>
          </div>
          {existingCount === 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Genera dei dati prima di poter esportare
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}