"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Users,
  Shield
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AnalyticsData {
  kpis: {
    totalClaims: number;
    fraudDetectionRate: number;
    avgRiskScore: number;
    investigationEfficiency: number;
    costSavings: number;
  };
  trends: {
    claimsByMonth: Array<{ month: string; claims: number; fraud: number }>;
    riskDistribution: Array<{ category: string; count: number; percentage: number }>;
    topFraudPatterns: Array<{ pattern: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  };
  geographical: Array<{
    city: string;
    claims: number;
    fraudRate: number;
    riskScore: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'patterns' | 'geographic'>('overview');

  // Reindirizza alla landing page se non autenticato e carica dati se autenticato
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    } else if (session) {
      loadAnalyticsData();
    }
  }, [session, isPending, router, selectedTimeframe]);

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

  const loadAnalyticsData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData: AnalyticsData = {
      kpis: {
        totalClaims: 1247,
        fraudDetectionRate: 12.8,
        avgRiskScore: 42.3,
        investigationEfficiency: 87.5,
        costSavings: 2850000
      },
      trends: {
        claimsByMonth: [
          { month: 'Gen', claims: 145, fraud: 18 },
          { month: 'Feb', claims: 132, fraud: 15 },
          { month: 'Mar', claims: 158, fraud: 22 },
          { month: 'Apr', claims: 167, fraud: 19 },
          { month: 'Mag', claims: 189, fraud: 28 },
          { month: 'Giu', claims: 176, fraud: 21 },
          { month: 'Lug', claims: 198, fraud: 25 }
        ],
        riskDistribution: [
          { category: 'Basso Rischio', count: 756, percentage: 60.6 },
          { category: 'Medio Rischio', count: 321, percentage: 25.7 },
          { category: 'Alto Rischio', count: 170, percentage: 13.7 }
        ],
        topFraudPatterns: [
          { pattern: 'Orari notturni', count: 89, trend: 'up' },
          { pattern: 'Importi elevati', count: 67, trend: 'stable' },
          { pattern: 'Aree ad alto rischio', count: 54, trend: 'up' },
          { pattern: 'Veicoli di lusso', count: 43, trend: 'down' },
          { pattern: 'Storico frodi', count: 38, trend: 'stable' }
        ]
      },
      geographical: [
        { city: 'Roma', claims: 234, fraudRate: 15.2, riskScore: 48.5 },
        { city: 'Milano', claims: 198, fraudRate: 12.1, riskScore: 41.2 },
        { city: 'Napoli', claims: 167, fraudRate: 18.7, riskScore: 56.8 },
        { city: 'Torino', claims: 145, fraudRate: 9.8, riskScore: 35.4 },
        { city: 'Palermo', claims: 134, fraudRate: 22.4, riskScore: 62.1 },
        { city: 'Bologna', claims: 98, fraudRate: 11.2, riskScore: 39.7 }
      ]
    };
    
    setAnalyticsData(mockData);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 40) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading || !analyticsData) {
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
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Analisi avanzata del sistema anti-frode</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedTimeframe === timeframe
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {timeframe === '7d' ? '7 giorni' : 
                     timeframe === '30d' ? '30 giorni' : 
                     timeframe === '90d' ? '90 giorni' : '1 anno'}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Esporta
              </Button>
              <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aggiorna
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Panoramica', icon: BarChart3 },
              { id: 'cases', label: 'Case Explorer', icon: Search },
              { id: 'patterns', label: 'Pattern Analysis', icon: AlertTriangle },
              { id: 'geographic', label: 'Analisi Geografica', icon: MapPin }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'cases' | 'patterns' | 'geographic')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sinistri Totali</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.kpis.totalClaims.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.5% vs periodo precedente
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasso Rilevamento Frodi</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.kpis.fraudDetectionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.3% improvement
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Punteggio Rischio Medio</p>
                <p className={`text-2xl font-bold ${getRiskColor(analyticsData.kpis.avgRiskScore)}`}>
                  {analyticsData.kpis.avgRiskScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Su scala 1-100</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficienza Indagini</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.kpis.investigationEfficiency.toFixed(1)}%
                </p>
                <p className="text-sm text-blue-600">Risoluzione positiva</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risparmi Costi</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analyticsData.kpis.costSavings)}
                </p>
                <p className="text-sm text-purple-600">Frodi evitate</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Claims Trend */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Trend Sinistri</h3>
                <Badge variant="outline">Ultimi 7 mesi</Badge>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Grafico Andamento Temporale</p>
                  <p className="text-sm text-gray-400">Visualizzazione trend sinistri vs frodi</p>
                </div>
              </div>
            </Card>

            {/* Risk Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Distribuzione Rischio</h3>
                <Badge variant="outline">Tempo reale</Badge>
              </div>
              <div className="space-y-4">
                {analyticsData.trends.riskDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.count} ({item.percentage.toFixed(1)}%)</span>
                        <div className={`w-3 h-3 rounded-full ${
                          item.category.includes('Basso') ? 'bg-green-500' :
                          item.category.includes('Medio') ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.category.includes('Basso') ? 'bg-green-500' :
                          item.category.includes('Medio') ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'patterns' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pattern di Frode Principali</h3>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtra
              </Button>
            </div>
            <div className="space-y-4">
              {analyticsData.trends.topFraudPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-semibold text-gray-500">#{index + 1}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{pattern.pattern}</h4>
                      <p className="text-sm text-gray-600">{pattern.count} casi rilevati</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(pattern.trend)}
                    <Badge variant={pattern.trend === 'up' ? 'destructive' : pattern.trend === 'down' ? 'default' : 'secondary'}>
                      {pattern.trend === 'up' ? 'In aumento' : pattern.trend === 'down' ? 'In diminuzione' : 'Stabile'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'geographic' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Analisi Geografica</h3>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Mappa Dettagliata
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.geographical.map((city, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{city.city}</h4>
                    <Badge variant={city.fraudRate > 15 ? 'destructive' : city.fraudRate > 10 ? 'default' : 'secondary'}>
                      {city.fraudRate.toFixed(1)}% frodi
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sinistri:</span>
                      <span className="font-medium">{city.claims}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rischio medio:</span>
                      <span className={`font-medium ${getRiskColor(city.riskScore)}`}>
                        {city.riskScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'cases' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Case Explorer</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtri
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Cerca
                </Button>
              </div>
            </div>
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Case Explorer</p>
              <p className="text-sm text-gray-400">Ricerca avanzata e filtri multi-dimensionali per singoli sinistri</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}