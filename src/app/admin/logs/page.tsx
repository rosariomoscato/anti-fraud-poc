"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Activity, User, Calendar, Search, Filter, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin_email: string;
  admin_name?: string;
}

interface LogsResponse {
  success: boolean;
  logs: LogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function LogsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const loadLogs = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/admin/logs?${params}`);
      const data: LogsResponse = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
      } else {
        console.error('Error loading logs:', 'Failed to load logs');
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }, [pagination.limit]);

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
          
          // Load logs
          await loadLogs();
          setLoading(false);
        } catch (error) {
          console.error('Error checking admin access:', error);
          router.push('/');
        }
      }
    };

    checkAdminAccess();
  }, [session, isPending, router, loadLogs]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'assign_role': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'update_role': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'update_setting': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'login': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'assign_role':
      case 'update_role': return <User className="h-4 w-4" />;
      case 'update_setting': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatAction = (action: string) => {
    switch (action) {
      case 'assign_role': return 'Assegnazione Ruolo';
      case 'update_role': return 'Aggiornamento Ruolo';
      case 'update_setting': return 'Aggiornamento Impostazioni';
      case 'login': return 'Accesso';
      default: return action;
    }
  };

  const formatEntityType = (entityType: string) => {
    switch (entityType) {
      case 'user_role': return 'Ruolo Utente';
      case 'admin_settings': return 'Impostazioni Admin';
      case 'user': return 'Utente';
      default: return entityType;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.admin_name && log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === "all" || actionFilter === "" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/admin')}
                className="mr-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Log di Sistema</h1>
                <p className="text-xs text-muted-foreground">Attività amministrative recenti</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {pagination.total} Log Totali
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Log delle Attività Amministrative
          </h2>
          <p className="text-muted-foreground">
            Visualizza tutte le azioni eseguite dagli amministratori del sistema
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cerca</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per admin, azione..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo Azione</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutte le azioni" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le azioni</SelectItem>
                    <SelectItem value="assign_role">Assegnazione Ruolo</SelectItem>
                    <SelectItem value="update_role">Aggiornamento Ruolo</SelectItem>
                    <SelectItem value="update_setting">Aggiornamento Impostazioni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Risultati</label>
                <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
                  <span className="text-sm text-muted-foreground">
                    {filteredLogs.length} di {logs.length} log
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Log delle Attività
            </CardTitle>
            <CardDescription>
              Cronologia delle azioni amministrative più recenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nessun log trovato
                </h3>
                <p className="text-muted-foreground">
                  Non ci sono attività amministrative da mostrare.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data e Ora</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Azione</TableHead>
                      <TableHead>Entità</TableHead>
                      <TableHead>Dettagli</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm">
                                {new Date(log.created_at).toLocaleDateString('it-IT')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleTimeString('it-IT')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {log.admin_name || 'Admin'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.admin_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getActionBadgeColor(log.action)}
                          >
                            <div className="flex items-center space-x-1">
                              {getActionIcon(log.action)}
                              <span>
                                {formatAction(log.action)}
                              </span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatEntityType(log.entity_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate">
                            {log.details ? (
                              <div className="space-y-1">
                                {typeof log.details === 'object' ? (
                                  Object.entries(log.details).map(([key, value]) => (
                                    <div key={key} className="text-xs">
                                      <span className="font-medium">{key}:</span> {String(value)}
                                    </div>
                                  ))
                                ) : (
                                  String(log.details)
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {log.ip_address || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Pagina {pagination.page} di {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Precedente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Successiva
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}