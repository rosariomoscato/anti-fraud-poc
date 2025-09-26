"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Users,
  BarChart3,
  Eye,
  Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DashboardStats {
  totalClaims: number;
  highRiskClaims: number;
  pendingInvestigations: number;
  fraudDetected: number;
  avgRiskScore: number;
  totalProcessed: number;
}

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

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  total: number;
  categories: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
}

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    highRiskClaims: 0,
    pendingInvestigations: 0,
    fraudDetected: 0,
    avgRiskScore: 0,
    totalProcessed: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [loading, setLoading] = useState(true);

  // Reindirizza alla landing page se non autenticato
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    // Load dashboard data only if authenticated
    if (session) {
      const loadDashboardData = async () => {
        try {
          // Fetch dashboard statistics
          const statsResponse = await fetch('/api/dashboard/stats');
          const statsData = await statsResponse.json();
          
          if (statsData.success) {
            setStats(statsData.data);
          }

          // Fetch recent activity
          const activityResponse = await fetch('/api/dashboard/activity');
          const activityData = await activityResponse.json();
          
          if (activityData.success) {
            setRecentActivity(activityData.data);
          }

          // Fetch risk distribution
          const riskResponse = await fetch('/api/dashboard/risk-distribution');
          const riskData = await riskResponse.json();
          
          if (riskData.success) {
            setRiskDistribution(riskData.data);
          }

        } catch (error) {
          console.error('Error loading dashboard data:', error);
          // Fallback to mock data if API fails
          setStats({
            totalClaims: 0,
            highRiskClaims: 0,
            pendingInvestigations: 0,
            fraudDetected: 0,
            avgRiskScore: 0,
            totalProcessed: 0
          });
          setRecentActivity([]);
          setRiskDistribution(null);
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    }
  }, [session]);

  const getRiskColor = (score: number) => {
    if (score <= 30) return "bg-green-500 border-green-500 text-green-600";
    if (score <= 70) return "bg-yellow-500 border-yellow-500 text-yellow-600";
    return "bg-red-500 border-red-500 text-red-600";
  };

  const getRiskBgColor = (score: number) => {
    if (score <= 30) return "bg-green-50 border-green-500";
    if (score <= 70) return "bg-yellow-50 border-yellow-500";
    return "bg-red-50 border-red-500";
  };

  const getRiskTextColor = (score: number) => {
    if (score <= 30) return "text-green-600";
    if (score <= 70) return "text-yellow-600";
    return "text-red-600";
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
    const iconConfig = {
      new_claim: { icon: BarChart3, color: "blue" },
      fraud_detection: { icon: AlertTriangle, color: "red" },
      investigation_started: { icon: Search, color: "orange" },
      status_change: { icon: TrendingUp, color: "purple" },
      high_priority_alert: { icon: Shield, color: "red" }
    };

    const config = iconConfig[type as keyof typeof iconConfig] || { icon: Clock, color: "gray" };
    const colorClasses = {
      blue: "bg-blue-50 border-blue-500 text-blue-600",
      red: "bg-red-50 border-red-500 text-red-600",
      orange: "bg-orange-50 border-orange-500 text-orange-600",
      purple: "bg-purple-50 border-purple-500 text-purple-600",
      gray: "bg-gray-50 border-gray-500 text-gray-600"
    };

    const Icon = config.icon;
    return (
      <div className={`p-2 rounded-lg border-2 ${colorClasses[config.color as keyof typeof colorClasses]}`}>
        <Icon className="h-4 w-4" />
      </div>
    );
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
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Panoramica del sistema anti-frode</p>
              </div>
            </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Sinistri Totali</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalClaims.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs mese scorso
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Alto Rischio</p>
                <p className="text-3xl font-bold text-destructive mt-1">{stats.highRiskClaims}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {((stats.highRiskClaims / stats.totalClaims) * 100).toFixed(1)}% del totale
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Indagini in Corso</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingInvestigations}</p>
                <p className="text-sm text-muted-foreground mt-2">Include sinistri appena inviati, sotto indagine e in attesa di elaborazione</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-500">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Frodi Rilevate</p>
                <p className="text-3xl font-bold text-destructive mt-1">{stats.fraudDetected}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                  {((stats.fraudDetected / stats.totalProcessed) * 100).toFixed(1)}% detection rate
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </Card>
        </div>

        {/* Risk Distribution Chart */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Distribuzione del Rischio</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Basso (1-30)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Medio (31-70)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Alto (71-100)</span>
              </div>
            </div>
          </div>
          
          {riskDistribution ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${(percentage as number).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, 'Numero Sinistri']}
                      labelFormatter={(label) => label}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Stats */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{riskDistribution.total}</p>
                  <p className="text-sm text-muted-foreground">Totale Sinistri Analizzati</p>
                </div>
                
                <div className="space-y-3">
                  {riskDistribution.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm font-medium text-foreground">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{category.value}</p>
                        <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary">
                    <span className="font-medium">Analisi Rischio:</span> {riskDistribution.low} basso rischio, 
                    {riskDistribution.medium} medio rischio, {riskDistribution.high} alto rischio
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Caricamento dati distribuzione rischio...</p>
                <p className="text-sm text-muted-foreground">In attesa di dati dal sistema</p>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Attività Recenti</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/activity">
                  <Eye className="h-4 w-4 mr-2" />
                  Vedi Tutti
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-3 bg-muted rounded-lg">
                  {getActivityIcon(activity.type, activity.significance)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground truncate">{activity.claimNumber}</p>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getRiskColor(activity.riskScore).split(' ')[0]}`}></div>
                          <span className={`text-sm font-medium ${getRiskTextColor(activity.riskScore)}`}>{activity.riskScore}</span>
                        </div>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{activity.claimant}</p>
                      <p className="text-xs text-muted-foreground flex-shrink-0">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/claims/new" className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Nuovo Sinistro</p>
                    <p className="text-sm text-muted-foreground">Inserisci una nuova richiesta</p>
                  </div>
                </Link>
              </Button>

              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/analytics" className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg border-2 border-green-500">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Analytics Dashboard</p>
                    <p className="text-sm text-muted-foreground">Visualizza analisi e report</p>
                  </div>
                </Link>
              </Button>

              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/investigations" className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg border-2 border-orange-500">
                    <Search className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Gestione Indagini</p>
                    <p className="text-sm text-muted-foreground">Traccia le indagini in corso</p>
                  </div>
                </Link>
              </Button>

              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/data/import" className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg border-2 border-purple-500">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Importa Dati</p>
                    <p className="text-sm text-muted-foreground">Carica dati da CSV/JSON</p>
                  </div>
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        </main>
    </div>
  );
}