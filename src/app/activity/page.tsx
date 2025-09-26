"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  Search,
  ArrowLeft,
  Filter,
  FileText,
  X,
  User,
  MapPin,
  Car
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RecentActivity {
  id: string;
  claimId: string;
  type: 'new_claim' | 'fraud_detection' | 'investigation_started' | 'status_change' | 'high_priority_alert';
  claimNumber: string;
  claimant: string;
  riskScore: number;
  status: string;
  timestamp: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

interface CaseDetails {
  id: string;
  claimNumber: string;
  policyNumber: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  incidentDate: Date;
  incidentTime: string;
  incidentLocation: string;
  incidentCity: string;
  incidentProvince: string;
  incidentPostalCode: string;
  incidentCountry: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleLicensePlate: string;
  vehicleVin: string;
  claimType: string;
  claimDescription: string;
  estimatedDamage: number;
  claimedAmount: number;
  claimStatus: string;
  priorityLevel: string;
  createdAt: Date;
  updatedAt: Date;
  riskScore: number;
  riskCategory: string;
  fraudIndicators: Array<{
    type: string;
    description: string;
    riskImpact: number;
  }>;
}

interface ActivityFilters {
  type: string;
  significance: string;
  search: string;
}

export default function ActivityPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({
    type: 'all',
    significance: 'all',
    search: ''
  });

  // Reindirizza alla landing page se non autenticato
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      const loadActivities = async () => {
        try {
          const response = await fetch('/api/dashboard/activity');
          const data = await response.json();
          
          if (data.success) {
            setActivities(data.data);
            setFilteredActivities(data.data);
          }
        } catch (error) {
          console.error('Error loading activities:', error);
          setActivities([]);
          setFilteredActivities([]);
        } finally {
          setLoading(false);
        }
      };

      loadActivities();
    }
  }, [session]);

  const loadCaseDetails = async (claimId: string) => {
    setCaseLoading(true);
    try {
      const response = await fetch(`/api/analytics/case-details?id=${encodeURIComponent(claimId)}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedCase(data.data);
      }
    } catch (error) {
      console.error('Error loading case details:', error);
    } finally {
      setCaseLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let filtered = activities;

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    // Filter by significance
    if (filters.significance !== 'all') {
      filtered = filtered.filter(activity => activity.significance === filters.significance);
    }

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(activity => 
        activity.claimNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.claimant.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [activities, filters]);

  const getRiskColor = (score: number) => {
    if (score <= 30) return "bg-green-500";
    if (score <= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      "HIGH_RISK": { variant: "destructive", label: "Alto Rischio" },
      "FRAUD_DETECTED": { variant: "destructive", label: "Frode Rilevata" },
      "UNDER_INVESTIGATION": { variant: "default", label: "In Indagine" },
      "APPROVED": { variant: "secondary", label: "Approvato" },
      "REJECTED": { variant: "destructive", label: "Rifiutato" },
      "PENDING": { variant: "outline", label: "In Attesa" }
    };

    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActivityIcon = (type: string, significance: string = 'medium') => {
    const getSignificanceBorder = () => {
      switch (significance) {
        case 'critical': return 'border-2 border-red-500';
        case 'high': return 'border-2 border-orange-500';
        case 'medium': return 'border-2 border-yellow-500';
        case 'low': return 'border-2 border-green-500';
        default: return '';
      }
    };

    switch (type) {
      case "new_claim":
        return <div className={`p-2 bg-blue-100 rounded-lg ${getSignificanceBorder()}`}>
          <BarChart3 className="h-4 w-4 text-blue-600" />
        </div>;
      case "fraud_detection":
        return <div className={`p-2 bg-red-100 rounded-lg ${getSignificanceBorder()}`}>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>;
      case "investigation_started":
        return <div className={`p-2 bg-orange-100 rounded-lg ${getSignificanceBorder()}`}>
          <Search className="h-4 w-4 text-orange-600" />
        </div>;
      case "status_change":
        return <div className={`p-2 bg-purple-100 rounded-lg ${getSignificanceBorder()}`}>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </div>;
      case "high_priority_alert":
        return <div className={`p-2 bg-red-100 rounded-lg ${getSignificanceBorder()}`}>
          <Shield className="h-4 w-4 text-red-600" />
        </div>;
      default:
        return <div className="p-2 bg-gray-100 rounded-lg">
          <Clock className="h-4 w-4 text-gray-400" />
        </div>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "new_claim": "Nuovo Sinistro",
      "fraud_detection": "Rilevamento Frode",
      "investigation_started": "Indagine Avviata",
      "status_change": "Cambio Stato",
      "high_priority_alert": "Allerta Priorità"
    };
    return labels[type] || type;
  };

  const getSignificanceBadge = (significance: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      "critical": { variant: "destructive", label: "Critico" },
      "high": { variant: "destructive", label: "Alto" },
      "medium": { variant: "default", label: "Medio" },
      "low": { variant: "secondary", label: "Basso" }
    };

    const config = variants[significance] || { variant: "outline", label: significance };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Torna alla Dashboard</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tutte le Attività</h1>
                <p className="text-sm text-muted-foreground">Eventi significativi del sistema anti-frode (ultimi 30 giorni)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filtri</h2>
              <p className="text-sm text-muted-foreground">Dati degli ultimi 30 giorni dal {new Date().toLocaleDateString('it-IT')}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilters({ type: 'all', significance: 'all', search: '' })}
            >
              <Filter className="h-4 w-4 mr-2" />
              Resetta Filtri
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo Evento</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tutti i tipi</option>
                <option value="new_claim">Nuovo Sinistro</option>
                <option value="fraud_detection">Rilevamento Frode</option>
                <option value="investigation_started">Indagine Avviata</option>
                <option value="status_change">Cambio Stato</option>
                <option value="high_priority_alert">Allerta Priorità</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Significanza</label>
              <select 
                value={filters.significance}
                onChange={(e) => setFilters({...filters, significance: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tutte le significanze</option>
                <option value="critical">Critico</option>
                <option value="high">Alto</option>
                <option value="medium">Medio</option>
                <option value="low">Basso</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cerca</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cerca per numero, nome, descrizione..."
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredActivities.length} attività trovate su {activities.length} totali
            </span>
          </div>
        </Card>

        {/* Activities List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Elenco Attività</h2>
          </div>
          
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna attività trovata</h3>
              <p className="text-gray-600 mb-4">Prova a modificare i criteri di filtro per vedere più risultati.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => loadCaseDetails(activity.claimId)}
                >
                  {getActivityIcon(activity.type, activity.significance)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <p className="font-medium text-gray-900">{activity.claimNumber}</p>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(activity.type)}
                        </Badge>
                        {getSignificanceBadge(activity.significance)}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getRiskColor(activity.riskScore)}`}></div>
                          <span className="text-sm font-medium">{activity.riskScore}</span>
                        </div>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{activity.claimant}</p>
                      <p className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      {/* Case Details Modal */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Dettaglio Sinistro</DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCase(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {caseLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selectedCase ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Informazioni Generali
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Numero Sinistro:</span>
                      <span className="font-medium">{selectedCase.claimNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Numero Polizza:</span>
                      <span className="font-medium">{selectedCase.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipo Sinistro:</span>
                      <span className="font-medium">{selectedCase.claimType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stato:</span>
                      <span className="font-medium">{selectedCase.claimStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priorità:</span>
                      <span className="font-medium">{selectedCase.priorityLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Importo Richiesto:</span>
                      <span className="font-medium">€{parseFloat(selectedCase.claimedAmount?.toString() || '0').toLocaleString('it-IT')}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dati Richiedente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nome:</span>
                      <span className="font-medium">{selectedCase.claimantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium break-all">{selectedCase.claimantEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Telefono:</span>
                      <span className="font-medium">{selectedCase.claimantPhone}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Incident and Vehicle */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dettagli Incidente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data:</span>
                      <span className="font-medium">{new Date(selectedCase.incidentDate).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ora:</span>
                      <span className="font-medium">{selectedCase.incidentTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Luogo:</span>
                      <span className="font-medium">{selectedCase.incidentLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Città:</span>
                      <span className="font-medium">{selectedCase.incidentCity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Provincia:</span>
                      <span className="font-medium">{selectedCase.incidentProvince}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CAP:</span>
                      <span className="font-medium">{selectedCase.incidentPostalCode}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Dati Veicolo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Marca:</span>
                      <span className="font-medium">{selectedCase.vehicleMake}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Modello:</span>
                      <span className="font-medium">{selectedCase.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Anno:</span>
                      <span className="font-medium">{selectedCase.vehicleYear || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Targa:</span>
                      <span className="font-medium">{selectedCase.vehicleLicensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">VIN:</span>
                      <span className="font-medium">{selectedCase.vehicleVin}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Bottom Section - Risk Assessment and Description */}
              <div className="md:col-span-2 space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Valutazione Rischio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedCase.riskScore}</div>
                      <div className="text-sm text-gray-600">Punteggio Rischio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedCase.riskCategory}</div>
                      <div className="text-sm text-gray-600">Categoria Rischio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedCase.fraudIndicators?.length || 0}</div>
                      <div className="text-sm text-gray-600">Indicatori Frode</div>
                    </div>
                  </div>
                </Card>

                {selectedCase.fraudIndicators && selectedCase.fraudIndicators.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Indicatori di Frode Rilevati
                    </h3>
                    <div className="space-y-2">
                      {selectedCase.fraudIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm font-medium">{indicator.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">{indicator.description}</span>
                            <Badge variant="destructive" className="text-xs">
                              {indicator.riskImpact}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrizione Sinistro
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCase.claimDescription}</p>
                </Card>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}