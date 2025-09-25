"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  RefreshCw,
  Eye,
  User,
  Calendar,
  MapPin,
  TrendingUp
} from "lucide-react";

interface Investigation {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimType: string;
  incidentDate: string;
  incidentLocation: string;
  riskScore: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  estimatedAmount: number;
  fraudIndicators: string[];
  lastUpdated: string;
}

interface InvestigationStats {
  totalInvestigations: number;
  openCases: number;
  inProgress: number;
  completedThisMonth: number;
  averageResolutionTime: number;
  successRate: number;
}

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [stats, setStats] = useState<InvestigationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  useEffect(() => {
    loadInvestigationsData();
  }, []);

  const loadInvestigationsData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockInvestigations: Investigation[] = [
      {
        id: "1",
        claimNumber: "CLM-2024-0892",
        claimantName: "Mario Rossi",
        claimType: "THEFT",
        incidentDate: "2024-09-15",
        incidentLocation: "Roma, RM",
        riskScore: 85,
        status: "IN_PROGRESS",
        priority: "HIGH",
        assignedTo: "Agent. Bianchi",
        estimatedAmount: 25000,
        fraudIndicators: ["Orario notturno", "Area ad alto rischio", "Veicolo di lusso"],
        lastUpdated: "2 ore fa"
      },
      {
        id: "2",
        claimNumber: "CLM-2024-0891",
        claimantName: "Laura Bianchi",
        claimType: "COLLISION",
        incidentDate: "2024-09-14",
        incidentLocation: "Milano, MI",
        riskScore: 92,
        status: "OPEN",
        priority: "URGENT",
        estimatedAmount: 35000,
        fraudIndicators: ["Importo elevato", "Testimoni contraddittori", "Danni sospetti"],
        lastUpdated: "1 ora fa"
      },
      {
        id: "3",
        claimNumber: "CLM-2024-0889",
        claimantName: "Giuseppe Verdi",
        claimType: "VANDALISM",
        incidentDate: "2024-09-12",
        incidentLocation: "Napoli, NA",
        riskScore: 78,
        status: "UNDER_REVIEW",
        priority: "MEDIUM",
        assignedTo: "Agent. Russo",
        estimatedAmount: 8500,
        fraudIndicators: ["Storico frodi", "Multiple rivendicazioni"],
        lastUpdated: "5 ore fa"
      },
      {
        id: "4",
        claimNumber: "CLM-2024-0890",
        claimantName: "Anna Neri",
        claimType: "COLLISION",
        incidentDate: "2024-09-10",
        incidentLocation: "Torino, TO",
        riskScore: 45,
        status: "COMPLETED",
        priority: "LOW",
        assignedTo: "Agent. Ferrari",
        estimatedAmount: 3500,
        fraudIndicators: ["Danni minori"],
        lastUpdated: "1 giorno fa"
      },
      {
        id: "5",
        claimNumber: "CLM-2024-0888",
        claimantName: "Carlo Mancini",
        claimType: "THEFT",
        incidentDate: "2024-09-08",
        incidentLocation: "Palermo, PA",
        riskScore: 88,
        status: "CLOSED",
        priority: "HIGH",
        assignedTo: "Agent. Esposito",
        estimatedAmount: 42000,
        fraudIndicators: ["Frode confermata", "Documenti falsi"],
        lastUpdated: "3 giorni fa"
      }
    ];

    const mockStats: InvestigationStats = {
      totalInvestigations: 156,
      openCases: 23,
      inProgress: 45,
      completedThisMonth: 18,
      averageResolutionTime: 7.2,
      successRate: 87.5
    };

    setInvestigations(mockInvestigations);
    setStats(mockStats);
    setLoading(false);
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
    if (score <= 30) return "text-green-600";
    if (score <= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredInvestigations = investigations.filter(inv => {
    const statusMatch = selectedStatus === 'ALL' || inv.status === selectedStatus;
    const priorityMatch = selectedPriority === 'ALL' || inv.priority === selectedPriority;
    return statusMatch && priorityMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-600">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestione Indagini</h1>
                <p className="text-sm text-gray-600">Monitoraggio e gestione delle indagini anti-frode</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtri Avanzati
              </Button>
              <Button variant="outline" size="sm" onClick={loadInvestigationsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aggiorna
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totali Indagini</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalInvestigations}</p>
                <p className="text-sm text-gray-600">Ultimi 30 giorni</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Casi Aperti</p>
                <p className="text-2xl font-bold text-red-600">{stats?.openCases}</p>
                <p className="text-sm text-red-600">Richiedono attenzione</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Corso</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.inProgress}</p>
                <p className="text-sm text-gray-600">Attive</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completati</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedThisMonth}</p>
                <p className="text-sm text-green-600">Questo mese</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasso Successo</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.successRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Risoluzione positiva</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Stato:</span>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="ALL">Tutti</option>
                <option value="OPEN">Aperti</option>
                <option value="IN_PROGRESS">In Corso</option>
                <option value="UNDER_REVIEW">In Revisione</option>
                <option value="COMPLETED">Completati</option>
                <option value="CLOSED">Chiusi</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Priorità:</span>
              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="ALL">Tutte</option>
                <option value="URGENT">Urgente</option>
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Media</option>
                <option value="LOW">Bassa</option>
              </select>
            </div>
            
            <div className="ml-auto text-sm text-gray-600">
              Mostrando {filteredInvestigations.length} di {investigations.length} indagini
            </div>
          </div>
        </Card>

        {/* Investigations List */}
        <div className="space-y-4">
          {filteredInvestigations.map((investigation) => (
            <Card key={investigation.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{investigation.claimNumber}</h3>
                    {getStatusBadge(investigation.status)}
                    {getPriorityBadge(investigation.priority)}
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        investigation.riskScore <= 30 ? 'bg-green-500' :
                        investigation.riskScore <= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${getRiskColor(investigation.riskScore)}`}>
                        Rischio: {investigation.riskScore}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{investigation.claimantName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{investigation.incidentDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{investigation.incidentLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        €{investigation.estimatedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {investigation.assignedTo && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Assegnato a: </span>
                      <span className="text-sm font-medium text-gray-900">{investigation.assignedTo}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {investigation.fraudIndicators.map((indicator, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className="text-xs text-gray-500">{investigation.lastUpdated}</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Dettagli
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}