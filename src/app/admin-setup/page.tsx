"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminSetupPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'checking' | 'needs_setup' | 'already_admin' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/');
      return;
    }

    if (!isPending && session) {
      checkSetupStatus();
    }
  }, [session, isPending, router]);

  const checkSetupStatus = async () => {
    try {
      console.log('Checking admin setup status...');
      const response = await fetch('/api/admin/check-setup', {
        method: 'POST',
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.isAdmin) {
        setStatus('already_admin');
        setMessage('Sei già un amministratore! Vai alla dashboard admin.');
      } else if (data.canSetupAdmin) {
        setStatus('needs_setup');
        setMessage('Il sistema è pronto per la configurazione admin.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Errore durante la verifica dello stato.');
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      setStatus('error');
      setMessage('Errore durante la connessione al server.');
    }
  };

  const setupAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: session?.user?.email || 'rosariomoscatolab@gmail.com' 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('already_admin');
        setMessage('✅ Ruolo admin assegnato con successo! Ricarica la pagina per vedere il menu admin.');
        // Ricarica dopo 2 secondi
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Errore durante l&apos;assegnazione del ruolo admin.');
      }
    } catch {
      setStatus('error');
      setMessage('Errore durante la connessione al server.');
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accesso Negato</h1>
          <p className="text-gray-600">Devi essere autenticato per accedere a questa pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configurazione Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Imposta i permessi di amministratore per il tuo account
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Stato Utente
            </CardTitle>
            <CardDescription>
              Informazioni sull&apos;account corrente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{session.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium">{session.user.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stato Setup:</span>
                <Badge variant={
                  status === 'already_admin' ? 'default' :
                  status === 'needs_setup' ? 'secondary' :
                  status === 'checking' ? 'outline' : 'destructive'
                }>
                  {status === 'checking' ? 'Verifica...' :
                   status === 'needs_setup' ? 'Da Configurare' :
                   status === 'already_admin' ? 'Configurato' : 'Errore'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Azioni</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'needs_setup' && (
              <Button 
                onClick={setupAdmin} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Configurazione in corso...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Assegna Ruolo Admin
                  </>
                )}
              </Button>
            )}
            
            {status === 'already_admin' && (
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <a href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Vai alla Dashboard Admin
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Ricarica Pagina
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={checkSetupStatus}
                  className="w-full"
                >
                  Riprova
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}