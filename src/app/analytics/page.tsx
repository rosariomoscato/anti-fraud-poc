"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'patterns' | 'geographic'>('overview');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityDetails, setCityDetails] = useState<any>(null);
  const [cityDetailsLoading, setCityDetailsLoading] = useState(false);
  const [showDetailedMap, setShowDetailedMap] = useState(false);

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

  const loadCityDetails = async (cityName: string) => {
    setCityDetailsLoading(true);
    try {
      const response = await fetch(`/api/analytics/city-details?city=${encodeURIComponent(cityName)}&timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const result = await response.json();
        setCityDetails(result.data);
      } else {
        console.error('Error loading city details:', await response.text());
        setCityDetails(null);
      }
    } catch (error) {
      console.error('Error loading city details:', error);
      setCityDetails(null);
    } finally {
      setCityDetailsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      // Add cache busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/analytics/stats?timeframe=${selectedTimeframe}&_t=${timestamp}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Analytics data loaded:', result.data.trends.claimsByMonth.length, 'months');
        setAnalyticsData(result.data);
      } else {
        console.error('Error loading analytics data:', await response.text());
        // Fallback to empty data structure
        setAnalyticsData({
          kpis: {
            totalClaims: 0,
            fraudDetectionRate: 0,
            avgRiskScore: 0,
            investigationEfficiency: 0,
            costSavings: 0
          },
          trends: {
            claimsByMonth: [],
            riskDistribution: [],
            topFraudPatterns: []
          },
          geographical: []
        });
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Fallback to empty data structure
      setAnalyticsData({
        kpis: {
          totalClaims: 0,
          fraudDetectionRate: 0,
          avgRiskScore: 0,
          investigationEfficiency: 0,
          costSavings: 0
        },
        trends: {
          claimsByMonth: [],
          riskDistribution: [],
          topFraudPatterns: []
        },
        geographical: []
      });
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if there's no data
  if (!analyticsData || analyticsData.kpis.totalClaims === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - same as before */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                  <p className="text-sm text-gray-600">Analisi avanzata del sistema anti-frode</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['7d', '30d', '90d', '1y', 'all'] as const).map((timeframe) => (
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
                       timeframe === '90d' ? '90 giorni' : 
                       timeframe === '1y' ? '1 anno' : 'Tutti'}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aggiorna
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* No Data Message */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nessun Dato Disponibile</h2>
            <p className="text-gray-600 mb-6">
              Non ci sono sinistri nel database per il periodo selezionato. 
              Genera alcuni dati sintetici per vedere le analytics.
            </p>
            <Button onClick={() => router.push('/synthetic-data')}>
              Vai a Generatore Dati
            </Button>
          </div>
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
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-sm text-gray-600">Analisi avanzata del sistema anti-frode</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['7d', '30d', '90d', '1y', 'all'] as const).map((timeframe) => (
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
                     timeframe === '90d' ? '90 giorni' : 
                     timeframe === '1y' ? '1 anno' : 'Tutti'}
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
                <Badge variant="outline">
                  {selectedTimeframe === '7d' ? 'Ultimo mese' :
                   selectedTimeframe === '30d' ? 'Ultimi 2 mesi' :
                   selectedTimeframe === '90d' ? 'Ultimi 4 mesi' :
                   selectedTimeframe === '1y' ? 'Ultimo anno' : 'Ultimi 2 anni'}
                </Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.trends.claimsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 9 }}
                      tickLine={false}
                      interval={selectedTimeframe === 'all' ? 1 : 0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="claims" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Sinistri Totali"
                      connectNulls={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fraud" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="Casi Sospetti"
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="text-xs text-gray-500 mt-2">
                  Mostrati {analyticsData.trends.claimsByMonth.length} mesi | 
                  <span className="ml-2">Dati totali: {analyticsData.trends.claimsByMonth.reduce((sum, item) => sum + item.claims, 0)} sinistri</span>
                </div>
              </div>
              
              {/* Debug table - show all raw data */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dati grezzi di debug ({analyticsData.trends.claimsByMonth.length} mesi):</h4>
                <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-1 text-xs">
                  {analyticsData.trends.claimsByMonth.map((item, index) => (
                    <div key={index} className="bg-white p-1 rounded border text-center min-w-[40px]">
                      <div className="font-medium text-xs">{item.month}</div>
                      <div className="text-blue-600 text-xs">{item.claims}</div>
                      <div className="text-red-600 text-xs">{item.fraud}</div>
                    </div>
                  ))}
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
              <Button variant="outline" size="sm" onClick={() => setShowDetailedMap(true)}>
                <MapPin className="h-4 w-4 mr-2" />
                Mappa Dettagliata
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.geographical.map((city, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-green-500"
                  onClick={() => {
                    setSelectedCity(city.city);
                    loadCityDetails(city.city);
                  }}
                >
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
                  <div className="mt-3 text-xs text-green-600 flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    Clicca per dettagli
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
        
        {/* City Details Modal */}
        <Dialog open={!!selectedCity} onOpenChange={(open) => !open && setSelectedCity(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Dettagli per {selectedCity}
              </DialogTitle>
              <DialogDescription>
                Analisi dettagliata dei sinistri e delle frodi per la città di {selectedCity}
              </DialogDescription>
            </DialogHeader>
            
            {cityDetailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Caricamento dettagli...</span>
              </div>
            ) : cityDetails ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{cityDetails.totalClaims}</div>
                    <div className="text-sm text-blue-800">Sinistri Totali</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{cityDetails.fraudRate.toFixed(1)}%</div>
                    <div className="text-sm text-red-800">Tasso Frodi</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{cityDetails.avgRiskScore.toFixed(1)}</div>
                    <div className="text-sm text-yellow-800">Rischio Medio</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">€{cityDetails.totalAmount.toLocaleString()}</div>
                    <div className="text-sm text-green-800">Importo Totale</div>
                  </div>
                </div>

                {/* Claims by Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Sinistri per Tipo</h4>
                    <div className="space-y-3">
                      {cityDetails.claimsByType?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{item.type}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600">{item.count} sinistri</span>
                            <Badge variant="secondary">{(item.percentage * 100).toFixed(1)}%</Badge>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">Nessun dato disponibile</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Rischio per Categoria</h4>
                    <div className="space-y-3">
                      {cityDetails.riskByCategory?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{item.category}</span>
                          <div className="flex items-center space-x-3">
                            <span className={`font-medium ${getRiskColor(item.avgScore)}`}>
                              {item.avgScore.toFixed(1)}
                            </span>
                            <Badge variant={item.avgScore > 70 ? 'destructive' : item.avgScore > 40 ? 'default' : 'secondary'}>
                              {item.count}
                            </Badge>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">Nessun dato disponibile</p>}
                    </div>
                  </div>
                </div>

                {/* Recent Claims */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Sinistri Recenti</h4>
                  <div className="space-y-3">
                    {cityDetails.recentClaims?.slice(0, 5).map((claim: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{claim.claimType}</div>
                          <div className="text-sm text-gray-600">{new Date(claim.incidentDate).toLocaleDateString('it-IT')}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€{parseFloat(claim.claimedAmount).toLocaleString()}</div>
                          <Badge variant={claim.priorityLevel === 'HIGH' ? 'destructive' : claim.priorityLevel === 'MEDIUM' ? 'default' : 'secondary'} className="mt-1">
                            {claim.priorityLevel}
                          </Badge>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">Nessun dato disponibile</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Impossibile caricare i dettagli per questa città</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Detailed Map Modal */}
        <Dialog open={showDetailedMap} onOpenChange={(open) => !open && setShowDetailedMap(false)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Mappa Dettagliata - Analisi Geografica
              </DialogTitle>
              <DialogDescription>
                Visualizzazione interattiva dei dati di frode per città italiana
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Italy SVG Map with City Markers */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Mappa delle Città - Analisi Frodi</h4>
                
                {/* Simplified Italy Map SVG */}
                <div className="relative w-full h-96 bg-white rounded-lg border">
                  <svg viewBox="0 0 800 600" className="w-full h-full">
                    {/* Simplified Italy outline */}
                    <path 
                      d="M400 100 L450 120 L480 150 L490 200 L485 250 L480 300 L470 350 L450 400 L420 450 L380 480 L340 490 L300 485 L280 460 L270 420 L275 380 L290 340 L310 300 L330 260 L350 220 L370 180 L390 140 Z" 
                      fill="#f0f9ff" 
                      stroke="#3b82f6" 
                      strokeWidth="2"
                    />
                    
                    {/* City markers based on actual data */}
                    {analyticsData.geographical.map((city, index) => {
                      // Simplified coordinates for major Italian cities
                      const cityCoords: Record<string, { x: number; y: number }> = {
                        'Roma': { x: 400, y: 350 },
                        'Milano': { x: 300, y: 200 },
                        'Napoli': { x: 420, y: 450 },
                        'Torino': { x: 280, y: 150 },
                        'Palermo': { x: 320, y: 520 },
                        'Genova': { x: 250, y: 280 },
                        'Bologna': { x: 350, y: 280 },
                        'Firenze': { x: 350, y: 320 },
                        'Bari': { x: 480, y: 400 },
                        'Catania': { x: 380, y: 550 },
                        'Venezia': { x: 380, y: 200 },
                        'Verona': { x: 360, y: 220 },
                        'Messina': { x: 420, y: 530 },
                        'Padova': { x: 370, y: 210 },
                        'Trieste': { x: 420, y: 180 },
                        'Taranto': { x: 460, y: 460 },
                        'Brescia': { x: 320, y: 210 },
                        'Parma': { x: 330, y: 260 },
                        'Prato': { x: 340, y: 320 },
                        'Modena': { x: 340, y: 270 }
                      };
                      
                      const coords = cityCoords[city.city] || { x: 350, y: 300 };
                      const riskColor = city.riskScore > 70 ? '#ef4444' : city.riskScore > 40 ? '#f59e0b' : '#10b981';
                      const size = Math.max(8, Math.min(20, city.claims / 2));
                      
                      return (
                        <g key={city.city}>
                          {/* City marker */}
                          <circle 
                            cx={coords.x} 
                            cy={coords.y} 
                            r={size} 
                            fill={riskColor}
                            fillOpacity={0.7}
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSelectedCity(city.city);
                              loadCityDetails(city.city);
                              setShowDetailedMap(false);
                            }}
                          />
                          
                          {/* City label */}
                          <text 
                            x={coords.x} 
                            y={coords.y + size + 15} 
                            textAnchor="middle" 
                            fontSize="10" 
                            fill="#374151"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {city.city}
                          </text>
                          
                          {/* Risk score label */}
                          <text 
                            x={coords.x} 
                            y={coords.y + size + 27} 
                            textAnchor="middle" 
                            fontSize="8" 
                            fill={riskColor}
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {city.riskScore.toFixed(0)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Basso Rischio (0-40)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">Medio Rischio (41-70)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Alto Rischio (71-100)</span>
                  </div>
                </div>
              </div>

              {/* City Statistics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {analyticsData.geographical.filter(c => c.riskScore > 70).length}
                  </div>
                  <div className="text-sm text-red-800">Città ad Alto Rischio</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analyticsData.geographical.filter(c => c.riskScore > 40 && c.riskScore <= 70).length}
                  </div>
                  <div className="text-sm text-yellow-800">Città a Medio Rischio</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.geographical.filter(c => c.riskScore <= 40).length}
                  </div>
                  <div className="text-sm text-green-800">Città a Basso Rischio</div>
                </div>
              </div>

              {/* City Rankings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Top Città per Sinistri</h4>
                  <div className="space-y-2">
                    {analyticsData.geographical
                      .sort((a, b) => b.claims - a.claims)
                      .slice(0, 5)
                      .map((city, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{city.city}</span>
                          <span className="text-blue-600 font-bold">{city.claims}</span>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Top Città per Tasso Frodi</h4>
                  <div className="space-y-2">
                    {analyticsData.geographical
                      .sort((a, b) => b.fraudRate - a.fraudRate)
                      .slice(0, 5)
                      .map((city, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{city.city}</span>
                          <span className="text-red-600 font-bold">{city.fraudRate.toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}