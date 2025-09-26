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
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  X,
  FileSpreadsheet,
  FileText,
  File
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Case Explorer state
  const [cases, setCases] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [caseDetailsLoading, setCaseDetailsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [casesLimit] = useState(10);
  const [yearOverYearChange, setYearOverYearChange] = useState(0);
  const [yearOverYearPeriod, setYearOverYearPeriod] = useState('');
  const [fraudYearOverYearChange, setFraudYearOverYearChange] = useState(0);
  const [efficiencyYearOverYearChange, setEfficiencyYearOverYearChange] = useState(0);
  const [costSavingsYearOverYearChange, setCostSavingsYearOverYearChange] = useState(0);
  
  // Pattern Analysis Filters
  const [showPatternFilter, setShowPatternFilter] = useState(false);
  const [patternFilters, setPatternFilters] = useState({
    trend: 'all', // 'all', 'up', 'down', 'stable'
    minCount: 0,
    selectedPatterns: [] as string[]
  });
  const [filteredPatterns, setFilteredPatterns] = useState<Array<{
  pattern: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}>>([]);

  // Reindirizza alla landing page se non autenticato e carica dati se autenticato
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    } else if (session) {
      loadAnalyticsData();
    }
  }, [session, isPending, router, selectedTimeframe]);

  // Reset pagination when filters change
  useEffect(() => {
    if (session && activeTab === 'cases') {
      resetPagination();
    }
  }, [searchTerm, filterStatus, filterType, filterRisk, selectedTimeframe]);

  // Load cases when cases tab is active, filters change, or page changes
  useEffect(() => {
    if (session && activeTab === 'cases') {
      loadCases();
    }
  }, [session, activeTab, selectedTimeframe, searchTerm, filterStatus, filterType, filterRisk, currentPage]);

  // Apply filters to fraud patterns
  const applyPatternFilters = (patterns: Array<{
    pattern: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>) => {
    return patterns.filter(pattern => {
      // Filter by trend
      if (patternFilters.trend !== 'all' && pattern.trend !== patternFilters.trend) {
        return false;
      }
      
      // Filter by minimum count
      if (pattern.count < patternFilters.minCount) {
        return false;
      }
      
      // Filter by selected patterns
      if (patternFilters.selectedPatterns.length > 0 && 
          !patternFilters.selectedPatterns.includes(pattern.pattern)) {
        return false;
      }
      
      return true;
    });
  };

  // Update filtered patterns when analytics data or filters change
  useEffect(() => {
    if (analyticsData?.trends?.topFraudPatterns) {
      const filtered = applyPatternFilters(analyticsData.trends.topFraudPatterns);
      setFilteredPatterns(filtered);
    }
  }, [analyticsData, patternFilters]);

  // Reset pattern filters
  const resetPatternFilters = () => {
    setPatternFilters({
      trend: 'all',
      minCount: 0,
      selectedPatterns: []
    });
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const loadCases = async () => {
    setCasesLoading(true);
    try {
      const params = new URLSearchParams({
        timeframe: selectedTimeframe,
        search: searchTerm,
        status: filterStatus,
        type: filterType,
        risk: filterRisk,
        page: currentPage.toString(),
        limit: casesLimit.toString()
      });
      
      const response = await fetch(`/api/analytics/cases?${params}`);
      if (response.ok) {
        const result = await response.json();
        setCases(result.data?.cases || []);
        setTotalCases(result.data?.pagination?.total || 0);
        setTotalPages(result.data?.pagination?.totalPages || 0);
      } else {
        console.error('Error loading cases:', await response.text());
        setCases([]);
        setTotalCases(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
      setCases([]);
      setTotalCases(0);
      setTotalPages(0);
    } finally {
      setCasesLoading(false);
    }
  };

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

  const loadCaseDetails = async (caseId: string) => {
    setCaseDetailsLoading(true);
    try {
      const response = await fetch(`/api/analytics/case-details?id=${encodeURIComponent(caseId)}`);
      if (response.ok) {
        const result = await response.json();
        setCaseDetails(result.data);
        setSelectedCase(caseId);
      } else {
        console.error('Error loading case details:', await response.text());
        setCaseDetails(null);
      }
    } catch (error) {
      console.error('Error loading case details:', error);
      setCaseDetails(null);
    } finally {
      setCaseDetailsLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      // Build export context based on current state
      const exportContext = {
        tab: activeTab,
        timeframe: selectedTimeframe,
        filters: {
          search: searchTerm,
          riskLevel: filterRisk,
          pattern: filterType,
          fraudType: filterStatus,
          startDate: '',
          endDate: ''
        },
        patternAnalysis: {
          selectedPatterns: patternFilters
        }
      };

      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          context: exportContext
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Generate filename based on current context
        const timestamp = new Date().toISOString().split('T')[0];
        const tabName = activeTab === 'overview' ? 'panoramica' : 
                       activeTab === 'cases' ? 'case-explorer' : 
                       activeTab === 'patterns' ? 'pattern-analysis' : 'geographic';
        
        let filename, fileExtension;
        if (format === 'pdf') {
          filename = `anti-fraud-${tabName}-${timestamp}.html`;
          fileExtension = 'html';
        } else {
          filename = `anti-fraud-${tabName}-${timestamp}.${format}`;
          fileExtension = format;
        }
        
        // Download directly for all formats
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // For PDF, show additional instructions
        if (format === 'pdf') {
          setTimeout(() => {
            alert('Report HTML scaricato come "' + filename + '"!\n\nPer convertirlo in PDF:\n1. Apri il file .html scaricato\n2. Premi Ctrl+P (o Cmd+P su Mac)\n3. Seleziona "Salva come PDF" come destinazione\n4. Clicca "Salva"\n\nIl file HTML può anche essere aperto direttamente nel browser per visualizzare il report.');
          }, 500);
        }
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error exporting data:', await response.text());
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setShowExportMenu(false);
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
        setYearOverYearChange(result.yearOverYearChange || 0);
        setYearOverYearPeriod(result.yearOverYearPeriod || '');
        setFraudYearOverYearChange(result.fraudYearOverYearChange || 0);
        setEfficiencyYearOverYearChange(result.efficiencyYearOverYearChange || 0);
        setCostSavingsYearOverYearChange(result.costSavingsYearOverYearChange || 0);
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

  // Helper functions for Case Explorer
  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case '7d': return 'Ultimi 7 giorni';
      case '30d': return 'Ultimi 30 giorni';
      case '90d': return 'Ultimi 90 giorni';
      case '1y': return 'Ultimo anno';
      case 'all': return 'Tutti i dati';
      default: return timeframe;
    }
  };

  const getTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'COLLISION': 'Collisione',
      'THEFT': 'Furto',
      'VANDALISM': 'Vandalismo',
      'NATURAL_DISASTER': 'Evento Naturale',
      'OTHER': 'Altro'
    };
    return typeLabels[type] || type;
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'SUBMITTED': 'Inviato',
      'UNDER_REVIEW': 'In Revisione',
      'APPROVED': 'Approvato',
      'REJECTED': 'Respinto',
      'UNDER_INVESTIGATION': 'Sotto Indagine'
    };
    return statusLabels[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'SUBMITTED': return 'default';
      case 'UNDER_REVIEW': return 'outline';
      case 'APPROVED': return 'secondary';
      case 'REJECTED': return 'destructive';
      case 'UNDER_INVESTIGATION': return 'destructive';
      default: return 'default';
    }
  };

  const getRiskScore = (priorityLevel: string): number => {
    switch (priorityLevel) {
      case 'URGENT': return 95;
      case 'HIGH': return 85;
      case 'MEDIUM': return 55;
      case 'LOW': return 25;
      default: return 50;
    }
  };

  const getRiskVariant = (priorityLevel: string): "default" | "secondary" | "destructive" | "outline" => {
    const score = getRiskScore(priorityLevel);
    if (score > 70) return 'destructive';
    if (score > 40) return 'outline';
    return 'secondary';
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
    if (score <= 40) return 'text-green-600 bg-green-50 border-green-500';
    if (score <= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-500';
    return 'text-red-600 bg-red-50 border-red-500';
  };

  const getRiskTextColor = (score: number) => {
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
      <div className="min-h-screen bg-background">
        {/* Header - same as before */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Advanced Analytics</h1>
                  <p className="text-sm text-muted-foreground">Analisi avanzata del sistema anti-frode</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex bg-muted rounded-lg p-1">
                  {(['7d', '30d', '90d', '1y', 'all'] as const).map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedTimeframe === timeframe
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
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
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nessun Dato Disponibile</h2>
            <p className="text-muted-foreground mb-6">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Advanced Analytics</h1>
                <p className="text-sm text-muted-foreground">Analisi avanzata del sistema anti-frode</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-muted rounded-lg p-1">
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
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Esporta
                </Button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => exportData('csv')}
                      >
                        <FileSpreadsheet className="h-4 w-4 inline mr-2" />
                        Esporta come CSV
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => exportData('json')}
                      >
                        <FileText className="h-4 w-4 inline mr-2" />
                        Esporta come JSON
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => exportData('pdf')}
                      >
                        <File className="h-4 w-4 inline mr-2" />
                        Esporta Report (HTML→PDF)
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                <p className={`text-sm flex items-center gap-1 ${yearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {yearOverYearChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {yearOverYearChange >= 0 ? '+' : ''}{yearOverYearChange}% vs {yearOverYearPeriod || 'periodo precedente'}
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
                <p className={`text-sm flex items-center gap-1 ${fraudYearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {fraudYearOverYearChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {fraudYearOverYearChange >= 0 ? '+' : ''}{fraudYearOverYearChange}% vs {yearOverYearPeriod || 'periodo precedente'}
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
                <p className={`text-sm flex items-center gap-1 ${efficiencyYearOverYearChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {efficiencyYearOverYearChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {efficiencyYearOverYearChange >= 0 ? '+' : ''}{efficiencyYearOverYearChange}% vs {yearOverYearPeriod || 'periodo precedente'}
                </p>
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
                <p className={`text-sm flex items-center gap-1 ${costSavingsYearOverYearChange >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {costSavingsYearOverYearChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {costSavingsYearOverYearChange >= 0 ? '+' : ''}{costSavingsYearOverYearChange}% vs {yearOverYearPeriod || 'periodo precedente'}
                </p>
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
            </Card>

            {/* Risk Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Distribuzione Rischio</h3>
                <Badge variant="outline">Aggregato</Badge>
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
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowPatternFilter(!showPatternFilter)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtra
                </Button>
                {(patternFilters.trend !== 'all' || patternFilters.minCount > 0 || patternFilters.selectedPatterns.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={resetPatternFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showPatternFilter && (
              <Card className="p-4 mb-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trend</label>
                    <select 
                      value={patternFilters.trend}
                      onChange={(e) => setPatternFilters({...patternFilters, trend: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tutti i trend</option>
                      <option value="up">In aumento</option>
                      <option value="down">In diminuzione</option>
                      <option value="stable">Stabile</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numero minimo casi</label>
                    <input 
                      type="number"
                      min="0"
                      value={patternFilters.minCount}
                      onChange={(e) => setPatternFilters({...patternFilters, minCount: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimo casi"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona pattern</label>
                    <div className="space-y-2">
                      {['Orari notturni', 'Importi elevati', 'Furto veicolo', 'Aree ad alto rischio'].map((pattern) => (
                        <label key={pattern} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={patternFilters.selectedPatterns.includes(pattern)}
                            onChange={(e) => {
                              const selected = e.target.checked
                                ? [...patternFilters.selectedPatterns, pattern]
                                : patternFilters.selectedPatterns.filter(p => p !== pattern);
                              setPatternFilters({...patternFilters, selectedPatterns: selected});
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{pattern}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {filteredPatterns.length} pattern trovati
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowPatternFilter(false)}>
                    Chiudi
                  </Button>
                </div>
              </Card>
            )}
            {filteredPatterns.length === 0 && (patternFilters.trend !== 'all' || patternFilters.minCount > 0 || patternFilters.selectedPatterns.length > 0) ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun pattern trovato</h3>
                <p className="text-gray-600 mb-4">Prova a modificare i criteri di filtro per vedere più risultati.</p>
                <Button variant="outline" onClick={resetPatternFilters}>
                  Resetta filtri
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(filteredPatterns.length > 0 ? filteredPatterns : analyticsData.trends.topFraudPatterns).map((pattern, index) => (
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
            )}
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
                <Button variant="outline" size="sm" onClick={loadCases}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aggiorna
                </Button>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cerca per città, tipo sinistro, ID claim..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tutti gli stati</option>
                    <option value="SUBMITTED">Inviato</option>
                    <option value="UNDER_REVIEW">In Revisione</option>
                    <option value="APPROVED">Approvato</option>
                    <option value="REJECTED">Respinto</option>
                    <option value="UNDER_INVESTIGATION">Sotto Indagine</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Sinistro</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Tutti i tipi</option>
                    <option value="COLLISION">Collisione</option>
                    <option value="THEFT">Furto</option>
                    <option value="VANDALISM">Vandalismo</option>
                    <option value="NATURAL_DISASTER">Evento Naturale</option>
                    <option value="OTHER">Altro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Livello Rischio</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                  >
                    <option value="all">Tutti i livelli</option>
                    <option value="LOW">Basso Rischio</option>
                    <option value="MEDIUM">Medio Rischio</option>
                    <option value="HIGH">Alto Rischio</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Trovati {totalCases} sinistri
                {selectedTimeframe !== 'all' && ` • Periodo: ${getTimeframeLabel(selectedTimeframe)}`}
              </div>
              {(searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterRisk !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                    setFilterRisk('all');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Cancella Filtri
                </Button>
              )}
            </div>
            
            {/* Cases Table */}
            {casesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Caricamento sinistri...</span>
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nessun sinistro trovato</p>
                <p className="text-sm text-gray-400">Prova a modificare i filtri o il periodo di ricerca</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Città</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rischio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cases.map((case_item, index) => (
                        <tr key={case_item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {case_item.claimNumber || case_item.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(case_item.incidentDate).toLocaleDateString('it-IT')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {case_item.incidentCity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTypeLabel(case_item.claimType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{parseFloat(case_item.claimedAmount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusVariant(case_item.claimStatus)}>
                              {getStatusLabel(case_item.claimStatus)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getRiskVariant(case_item.priorityLevel)}>
                              {getRiskScore(case_item.priorityLevel)}/100
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                loadCaseDetails(case_item.id);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Dettagli
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {totalCases > casesLimit && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Pagina {currentPage} di {totalPages}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
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

        {/* Case Details Modal */}
        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Dettagli Sinistro {caseDetails?.claimNumber}
              </DialogTitle>
              <DialogDescription>
                Informazioni dettagliate sul sinistro selezionato
              </DialogDescription>
            </DialogHeader>
            
            {caseDetailsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : caseDetails ? (
              <div className="space-y-6">
                {/* Informazioni Principali */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Informazioni Sinistro</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Numero Sinistro:</span>
                        <span className="font-medium">{caseDetails.claimNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Numero Polizza:</span>
                        <span className="font-medium">{caseDetails.policyNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo Sinistro:</span>
                        <span className="font-medium">{getTypeLabel(caseDetails.claimType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stato:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          caseDetails.claimStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          caseDetails.claimStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          caseDetails.claimStatus === 'UNDER_INVESTIGATION' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {caseDetails.claimStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priorità:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          caseDetails.priorityLevel === 'URGENT' ? 'bg-red-100 text-red-800' :
                          caseDetails.priorityLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          caseDetails.priorityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {caseDetails.priorityLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Incidente:</span>
                        <span className="font-medium">
                          {new Date(caseDetails.incidentDate).toLocaleDateString('it-IT')} {caseDetails.incidentTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Luogo:</span>
                        <span className="font-medium">{caseDetails.incidentLocation}, {caseDetails.incidentCity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Informazioni Richiedente</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nome:</span>
                        <span className="font-medium">{caseDetails.claimantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Codice Fiscale:</span>
                        <span className="font-medium break-all">{caseDetails.claimantId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium break-all">{caseDetails.claimantEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telefono:</span>
                        <span className="font-medium">{caseDetails.claimantPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informazioni Veicolo */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Informazioni Veicolo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{caseDetails.vehicleMake}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modello:</span>
                      <span className="font-medium">{caseDetails.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Anno:</span>
                      <span className="font-medium">{caseDetails.vehicleYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Targa:</span>
                      <span className="font-medium">{caseDetails.vehicleLicensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telaio:</span>
                      <span className="font-medium">{caseDetails.vehicleVin}</span>
                    </div>
                  </div>
                </div>

                {/* Informazioni Finanziarie */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Informazioni Finanziarie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Importo Richiesto:</span>
                      <span className="font-medium">€{caseDetails.claimedAmount.toLocaleString('it-IT')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Danno Stimato:</span>
                      <span className="font-medium">€{caseDetails.estimatedDamage.toLocaleString('it-IT')}</span>
                    </div>
                  </div>
                </div>

                {/* Analisi Rischio */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Analisi Rischio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Punteggio Rischio:</span>
                        <span className={`font-bold ${
                          caseDetails.riskScore >= 70 ? 'text-red-600' :
                          caseDetails.riskScore >= 40 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {caseDetails.riskScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoria:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          caseDetails.riskCategory === 'Alto Rischio' ? 'bg-red-100 text-red-800' :
                          caseDetails.riskCategory === 'Medio Rischio' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {caseDetails.riskCategory}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Indicatori Rilevati:</h4>
                      <div className="space-y-1">
                        {caseDetails.fraudIndicators.map((indicator: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                            <span className="text-gray-600">{indicator.description}</span>
                            <span className="text-red-600 font-medium">+{indicator.riskImpact}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descrizione */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Descrizione Incidente</h3>
                  <p className="text-sm text-gray-600">{caseDetails.claimDescription}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nessun dettaglio disponibile</p>
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