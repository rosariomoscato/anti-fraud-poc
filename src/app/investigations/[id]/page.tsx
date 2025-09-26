"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Eye,
  Edit,
  Save,
  RefreshCw
} from "lucide-react";

interface InvestigationDetail {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimantEmail?: string;
  claimantPhone?: string;
  claimType: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDescription: string;
  riskScore: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  estimatedAmount: number;
  fraudIndicators: string[];
  lastUpdated: string;
  claimStatus: string;
  createdAt: string;
  investigationNotes?: string[];
}

interface InvestigationHistory {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export default function InvestigationDetailPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [investigation, setInvestigation] = useState<InvestigationDetail | null>(null);
  const [history, setHistory] = useState<InvestigationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    } else if (session && id) {
      loadInvestigationDetail();
    }
  }, [session, isPending, id, router]);

  const loadInvestigationDetail = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for investigation details
      const mockInvestigation: InvestigationDetail = {
        id: id,
        claimNumber: "CLM-2024-0892",
        claimantName: "Mario Rossi",
        claimantEmail: "mario.rossi@email.com",
        claimantPhone: "+39 333 1234567",
        claimType: "THEFT",
        incidentDate: "2024-09-15",
        incidentLocation: "Roma, RM - Via Roma 123",
        incidentDescription: "Veicolo rubato durante la notte, parcheggiato in area non sorvegliata. Il proprietario ha denunciato il furto alle 8:00 del mattino successivo.",
        riskScore: 85,
        status: "IN_PROGRESS",
        priority: "HIGH",
        assignedTo: "Agent. Bianchi",
        estimatedAmount: 25000,
        fraudIndicators: ["Orario notturno", "Area ad alto rischio", "Veicolo di lusso", "Assenza di testimoni"],
        lastUpdated: "2 ore fa",
        claimStatus: "UNDER_INVESTIGATION",
        createdAt: "2024-09-15",
        investigationNotes: [
          "Iniziale valutazione del rischio: alto (85/100)",
          "Richiesta documentazione aggiuntiva al richiedente",
          "Contattato testimoni potenziali - nessuna risposta",
          "Verifica telecamere di sicurezza in corso"
        ]
      };

      const mockHistory: InvestigationHistory[] = [
        {
          id: "1",
          timestamp: "2024-09-15 14:30",
          action: "Creazione Indagine",
          user: "Sistema",
          details: "Indagine creata automaticamente per alto rischio (85/100)"
        },
        {
          id: "2",
          timestamp: "2024-09-15 15:45",
          action: "Assegnazione",
          user: "Supervisore",
          details: "Assegnato a Agent. Bianchi"
        },
        {
          id: "3",
          timestamp: "2024-09-16 09:15",
          action: "Aggiornamento Stato",
          user: "Agent. Bianchi",
          details: "Stato aggiornato a IN_PROGRESS"
        },
        {
          id: "4",
          timestamp: "2024-09-16 10:30",
          action: "Nota Aggiunta",
          user: "Agent. Bianchi",
          details: "Richiesta documentazione aggiuntiva al richiedente"
        }
      ];

      setInvestigation(mockInvestigation);
      setHistory(mockHistory);
      setNotes(mockInvestigation.investigationNotes?.join('\n\n') || '');
    } catch (error) {
      console.error('Error loading investigation detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      "OPEN": { 
        variant: "destructive", 
        label: "Aperto", 
        icon: <AlertTriangle className="h-3 w-3" /> 
      },
      "IN_PROGRESS": { 
        variant: "default", 
        label: "In Corso", 
        icon: <Clock className="h-3 w-3" /> 
      },
      "UNDER_REVIEW": { 
        variant: "outline", 
        label: "In Revisione", 
        icon: <Eye className="h-3 w-3" /> 
      },
      "COMPLETED": { 
        variant: "secondary", 
        label: "Completato", 
        icon: <CheckCircle className="h-3 w-3" /> 
      },
      "CLOSED": { 
        variant: "outline", 
        label: "Chiuso", 
        icon: <XCircle className="h-3 w-3" /> 
      }
    };

    const config = variants[status] || { variant: "outline", label: status, icon: <Clock className="h-3 w-3" /> };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      "LOW": { variant: "secondary", label: "Bassa" },
      "MEDIUM": { variant: "outline", label: "Media" },
      "HIGH": { variant: "default", label: "Alta" },
      "URGENT": { variant: "destructive", label: "Urgente" }
    };

    const config = variants[priority] || { variant: "outline", label: priority };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-green-600 bg-green-50 border-green-200";
    if (score <= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const saveNotes = async () => {
    if (!investigation) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInvestigation({
        ...investigation,
        investigationNotes: notes.split('\n\n').filter(note => note.trim())
      });
      setEditing(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !investigation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Indagine non trovata</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/investigations')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Indagini
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/investigations')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{investigation.claimNumber}</h1>
                <p className="text-sm text-gray-600">Dettagli Indagine</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(investigation.status)}
              {getPriorityBadge(investigation.priority)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Investigation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informazioni di Base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Richiedente</p>
                      <p className="font-medium text-gray-900">{investigation.claimantName}</p>
                      {investigation.claimantEmail && (
                        <p className="text-sm text-gray-600">{investigation.claimantEmail}</p>
                      )}
                      {investigation.claimantPhone && (
                        <p className="text-sm text-gray-600">{investigation.claimantPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Data Incidente</p>
                      <p className="font-medium text-gray-900">{investigation.incidentDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Luogo Incidente</p>
                      <p className="font-medium text-gray-900">{investigation.incidentLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tipo Sinistro</p>
                      <p className="font-medium text-gray-900">{investigation.claimType}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Descrizione Incidente</p>
                <p className="text-gray-900">{investigation.incidentDescription}</p>
              </div>
            </Card>

            {/* Risk Assessment */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Valutazione del Rischio</h2>
              <div className="flex items-center justify-between mb-4">
                <div className={`px-4 py-2 rounded-lg border-2 ${getRiskColor(investigation.riskScore)}`}>
                  <p className="text-sm font-medium">Punteggio Rischio</p>
                  <p className="text-2xl font-bold">{investigation.riskScore}/100</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Importo Stimato</p>
                  <p className="text-xl font-bold text-gray-900">€{investigation.estimatedAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Indicatore di Frode</p>
                <div className="flex flex-wrap gap-2">
                  {investigation.fraudIndicators.map((indicator, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Investigation Notes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Note Investigative</h2>
                <div className="flex space-x-2">
                  {editing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                        Annulla
                      </Button>
                      <Button size="sm" onClick={saveNotes}>
                        <Save className="h-4 w-4 mr-2" />
                        Salva
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                  )}
                </div>
              </div>
              
              {editing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                  placeholder="Aggiungi note investigative..."
                />
              ) : (
                <div className="space-y-3">
                  {investigation.investigationNotes?.map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">{note}</p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">Nessuna nota investigativa disponibile</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Actions and History */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aggiorna Stato
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                    Assegna Investigatore
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Genera Report
                </Button>
              </div>
            </Card>

            {/* Investigation History */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cronologia</h2>
              <div className="space-y-4">
                {history.map((event) => (
                  <div key={event.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{event.action}</p>
                      <p className="text-xs text-gray-500">{event.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-600">Da: {event.user}</p>
                    <p className="text-sm text-gray-700">{event.details}</p>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">Nessuna cronologia disponibile</p>
                )}
              </div>
            </Card>

            {/* Assignment Info */}
            {investigation.assignedTo && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Assegnazione</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Assegnato a</p>
                    <p className="font-medium text-gray-900">{investigation.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data Assegnazione</p>
                    <p className="font-medium text-gray-900">{investigation.createdAt}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}