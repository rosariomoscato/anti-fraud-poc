"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Users, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Admin functions are called via API routes

interface AdminStats {
  totalUsers: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    systemHealth: 'healthy'
  });

  // Reindirizza se non autenticato o non admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isPending && !session) {
        router.push('/');
        return;
      }

      if (!isPending && session) {
        try {
          const response = await fetch('/api/auth/is-admin');
          const data = await response.json();
          
          if (!data.isAdmin) {
            router.push('/');
            return;
          }
          
          // Load admin stats
          await loadAdminStats();
          setLoading(false);
        } catch (error) {
          console.error('Error checking admin access:', error);
          router.push('/');
        }
      }
    };

    checkAdminAccess();
  }, [session, isPending, router]);

  const loadAdminStats = async () => {
    try {
      // Carica il numero reale di utenti dal database
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setStats({
          totalUsers: data.users.length,
          systemHealth: 'healthy'
        });
      } else {
        console.error('Error loading user count:', data.error);
        setStats({
          totalUsers: 0,
          systemHealth: 'healthy'
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setStats({
        totalUsers: 0,
        systemHealth: 'healthy'
      });
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const getHealthColor = (health: 'healthy' | 'warning' | 'error') => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Pannello di Amministrazione</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className={getHealthColor(stats.systemHealth)}>
                {stats.systemHealth === 'healthy' ? 'Saluto' : stats.systemHealth === 'warning' ? 'Attenzione' : 'Errore'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Admin Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Benvenuto, {session?.user?.name || 'Admin'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestisci il sistema di rilevamento frodi e monitora le attività
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Utenti registrati nel sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestione Utenti
              </CardTitle>
              <CardDescription>
                Gestisci gli utenti e i loro permessi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/users')}
              >
                <Users className="mr-2 h-4 w-4" />
                Visualizza Utenti
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Visualizza tutti gli utenti registrati</p>
                <p>• Modifica i ruoli e i permessi</p>
                <p>• Gestisci le attività utente</p>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Impostazioni Sistema
              </CardTitle>
              <CardDescription>
                Configura le impostazioni del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/logs')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Log di Sistema
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Visualizza log attività admin</p>
                <p>• Monitora performance sistema</p>
                <p>• Analizza attività utente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}