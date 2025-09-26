"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ImportStatus {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
}

interface CsvPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export default function DataImportPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'append'>('append');
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setImportStatus({
          success: false,
          message: 'Per favore seleziona un file CSV'
        });
        return;
      }
      
      setSelectedFile(file);
      setImportStatus(null);
      previewCsvFile(file);
    }
  };

  const previewCsvFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setImportStatus({
          success: false,
          message: 'Il file CSV deve contenere almeno una riga di intestazione e una di dati'
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const previewRows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvPreview({
        headers,
        rows: previewRows,
        totalRows: lines.length - 1
      });
    } catch (error) {
      setImportStatus({
        success: false,
        message: 'Errore durante la lettura del file CSV'
      });
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const response = await fetch('/api/data/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'template_sinistri.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        setImportStatus({
          success: false,
          message: `Errore durante il download: ${error.error}`
        });
      }
    } catch (error) {
      setImportStatus({
        success: false,
        message: 'Errore di connessione al server'
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportStatus({
        success: false,
        message: 'Per favore seleziona un file CSV'
      });
      return;
    }

    setIsUploading(true);
    setImportStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', importMode);

      const response = await fetch('/api/data/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportStatus({
          success: true,
          message: result.message,
          importedCount: result.importedCount
        });
        setSelectedFile(null);
        setCsvPreview(null);
      } else {
        setImportStatus({
          success: false,
          message: result.error || 'Errore durante l\'importazione',
          errors: result.errors
        });
      }
    } catch (error) {
      setImportStatus({
        success: false,
        message: 'Errore di connessione al server'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCsvPreview(null);
    setImportStatus(null);
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Importa Dati</h1>
                <p className="text-sm text-gray-600">Carica dati sinistri da file CSV</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              Indietro
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Instructions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Istruzioni per l'Importazione</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">1. Scarica il template</p>
                <p className="text-sm text-gray-600">Utilizza il template fornito per garantire il formato corretto dei dati</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">2. Compila il file CSV</p>
                <p className="text-sm text-gray-600">Inserisci i dati seguendo la struttura del template</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">3. Carica il file</p>
                <p className="text-sm text-gray-600">Seleziona il file compilato e avvia l'importazione</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Download Template */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Template CSV</h3>
                <p className="text-sm text-gray-600">Scarica il template per l'importazione dei dati</p>
              </div>
            </div>
            <Button 
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="flex items-center space-x-2"
            >
              {isDownloadingTemplate ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Download...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Scarica Template
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Carica File CSV</h3>
          
          <div className="space-y-6">
            {/* File Selection */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {selectedFile ? selectedFile.name : 'Seleziona un file CSV'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {selectedFile 
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'Trascina qui il file o clicca per selezionare'
                }
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Seleziona File</span>
                </Button>
              </label>
            </div>

            {/* Import Mode */}
            {selectedFile && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Modalità di Importazione
                  </label>
                  <div className="flex space-x-4">
                    <Button
                      variant={importMode === 'append' ? 'default' : 'outline'}
                      onClick={() => setImportMode('append')}
                    >
                      Aggiungi al database
                    </Button>
                    <Button
                      variant={importMode === 'overwrite' ? 'default' : 'outline'}
                      onClick={() => setImportMode('overwrite')}
                    >
                      Sovrascrivi dati esistenti
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {importMode === 'append' 
                      ? 'I nuovi dati verranno aggiunti a quelli esistenti'
                      : 'I dati esistenti verranno cancellati prima dell&apos;importazione'
                    }
                  </p>
                </div>

                {/* Preview */}
                {csvPreview && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Anteprima Dati</h4>
                      <Badge variant="outline">
                        {csvPreview.totalRows} righe totali
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {csvPreview.headers.map((header, index) => (
                              <th key={index} className="text-left py-2 px-2 font-medium text-gray-700">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b">
                              {csvPreview.headers.map((header, colIndex) => (
                                <td key={colIndex} className="py-2 px-2 text-gray-600">
                                  {String(row[header] || '').substring(0, 30)}
                                  {String(row[header] || '').length > 30 && '...'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={handleImport}
                    disabled={isUploading || !selectedFile}
                    className="flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Importazione...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Importa Dati
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isUploading}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Import Status */}
        {importStatus && (
          <Card className={`p-6 ${importStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-start space-x-3">
              {importStatus.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium ${importStatus.success ? 'text-green-900' : 'text-red-900'}`}>
                  {importStatus.success ? 'Importazione Completata' : 'Errore di Importazione'}
                </h4>
                <p className={`text-sm ${importStatus.success ? 'text-green-700' : 'text-red-700'} mt-1`}>
                  {importStatus.message.replace(/'/g, '&apos;')}
                </p>
                
                {importStatus.importedCount && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      {importStatus.importedCount} sinistri importati con successo
                    </p>
                  </div>
                )}
                
                {importStatus.errors && importStatus.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-800 mb-2">Dettagli errori:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importStatus.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importStatus.errors.length > 5 && (
                        <li>... e altri {importStatus.errors.length - 5} errori</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}