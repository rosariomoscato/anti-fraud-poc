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
  type: 'claim' | 'detection' | 'investigation';
  claimNumber: string;
  claimant: string;
  riskScore: number;
  status: string;
  timestamp: string;
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
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    }
  }, [session]);

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
      "PENDING": { variant: "outline", label: "In Attesa" }
    };

    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "claim":
        return <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="h-4 w-4 text-blue-600" />
        </div>;
      case "detection":
        return <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>;
      case "investigation":
        return <div className="p-2 bg-orange-100 rounded-lg">
          <Search className="h-4 w-4 text-orange-600" />
        </div>;
      default:
        return <div className="p-2 bg-gray-100 rounded-lg">
          <Clock className="h-4 w-4 text-gray-600" />
        </div>;
    }
  };

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
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Panoramica del sistema anti-frode</p>
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
              <div>
                <p className="text-sm font-medium text-gray-600">Sinistri Totali</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClaims.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs mese scorso
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
                <p className="text-sm font-medium text-gray-600">Alto Rischio</p>
                <p className="text-3xl font-bold text-red-600">{stats.highRiskClaims}</p>
                <p className="text-sm text-gray-600">
                  {((stats.highRiskClaims / stats.totalClaims) * 100).toFixed(1)}% del totale
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Indagini in Corso</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingInvestigations}</p>
                <p className="text-sm text-gray-600">Include: UNDER_INVESTIGATION, HIGH, URGENT</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Frodi Rilevate</p>
                <p className="text-3xl font-bold text-red-600">{stats.fraudDetected}</p>
                <p className="text-sm text-green-600">
                  {((stats.fraudDetected / stats.totalProcessed) * 100).toFixed(1)}% detection rate
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Attività Recenti</h2>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Vedi Tutti
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.claimNumber}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getRiskColor(activity.riskScore)}`}></div>
                          <span className="text-sm font-medium">{activity.riskScore}</span>
                        </div>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600">{activity.claimant}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/claims/new" className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Nuovo Sinistro</p>
                    <p className="text-sm text-gray-600">Inserisci una nuova richiesta</p>
                  </div>
                </Link>
              </Button>

              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/analytics" className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Analytics Dashboard</p>
                    <p className="text-sm text-gray-600">Visualizza analisi e report</p>
                  </div>
                </Link>
              </Button>

              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/investigations" className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Search className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Gestione Indagini</p>
                    <p className="text-sm text-gray-600">Traccia le indagini in corso</p>
                  </div>
                </Link>
              </Button>

              <Button asChild className="justify-start h-auto p-4" variant="outline">
                <Link href="/data/import" className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Importa Dati</p>
                    <p className="text-sm text-gray-600">Carica dati da CSV/JSON</p>
                  </div>
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Risk Distribution Chart Placeholder */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Distribuzione del Rischio</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Basso (1-30)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Medio (31-70)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Alto (71-100)</span>
              </div>
            </div>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Grafico Distribuzione Rischio</p>
              <p className="text-sm text-gray-400">Visualizzazione interattiva in arrivo</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}