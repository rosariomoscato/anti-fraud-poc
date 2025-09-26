"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  ArrowLeft, 
  Save,
  AlertTriangle,
  CheckCircle,
  Car,
  MapPin,
  User,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ClaimFormData {
  // Richiedente
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  
  // Sinistro
  policyNumber: string;
  claimType: string;
  claimDescription: string;
  claimedAmount: string;
  estimatedDamage: string;
  
  // Incidente
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  incidentCity: string;
  incidentProvince: string;
  incidentPostalCode: string;
  
  // Veicolo
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleLicensePlate: string;
  vehicleVin: string;
  
  // Priorità
  priorityLevel: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function NewClaimPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ClaimFormData>({
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    policyNumber: '',
    claimType: '',
    claimDescription: '',
    claimedAmount: '',
    estimatedDamage: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentCity: '',
    incidentProvince: '',
    incidentPostalCode: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleLicensePlate: '',
    vehicleVin: '',
    priorityLevel: 'MEDIUM'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Reindirizza alla landing page se non autenticato
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/landing');
    }
  }, [session, isPending, router]);

  const handleInputChange = (field: keyof ClaimFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Campi obbligatori
    if (!formData.claimantName.trim()) newErrors.claimantName = 'Il nome è obbligatorio';
    if (!formData.claimantEmail.trim()) {
      newErrors.claimantEmail = 'L\'email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.claimantEmail)) {
      newErrors.claimantEmail = 'Email non valida';
    }
    if (!formData.policyNumber.trim()) newErrors.policyNumber = 'Il numero di polizza è obbligatorio';
    if (!formData.claimType) newErrors.claimType = 'Seleziona il tipo di sinistro';
    if (!formData.incidentDate) newErrors.incidentDate = 'La data è obbligatoria';
    if (!formData.incidentLocation.trim()) newErrors.incidentLocation = 'La località è obbligatoria';
    if (!formData.incidentCity.trim()) newErrors.incidentCity = 'La città è obbligatoria';
    if (!formData.incidentProvince.trim()) newErrors.incidentProvince = 'La provincia è obbligatoria';
    if (!formData.incidentPostalCode.trim()) newErrors.incidentPostalCode = 'Il CAP è obbligatorio';
    if (!formData.vehicleMake.trim()) newErrors.vehicleMake = 'La marca è obbligatoria';
    if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Il modello è obbligatorio';
    if (!formData.vehicleLicensePlate.trim()) newErrors.vehicleLicensePlate = 'La targa è obbligatoria';
    
    // Validazione importi
    if (!formData.claimedAmount) {
      newErrors.claimedAmount = 'L\'importo richiesto è obbligatorio';
    } else if (isNaN(parseFloat(formData.claimedAmount)) || parseFloat(formData.claimedAmount) <= 0) {
      newErrors.claimedAmount = 'Importo non valido';
    }
    
    if (formData.estimatedDamage && (isNaN(parseFloat(formData.estimatedDamage)) || parseFloat(formData.estimatedDamage) < 0)) {
      newErrors.estimatedDamage = 'Importo danni non valido';
    }
    
    // Validazione anno veicolo
    if (formData.vehicleYear) {
      const year = parseInt(formData.vehicleYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        newErrors.vehicleYear = 'Anno non valido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus('success');
        setSubmitMessage('Sinistro creato con successo! Numero sinistro: ' + data.claimNumber);
        
        // Reset form
        setFormData({
          claimantName: '',
          claimantEmail: '',
          claimantPhone: '',
          policyNumber: '',
          claimType: '',
          claimDescription: '',
          claimedAmount: '',
          estimatedDamage: '',
          incidentDate: '',
          incidentTime: '',
          incidentLocation: '',
          incidentCity: '',
          incidentProvince: '',
          incidentPostalCode: '',
          vehicleMake: '',
          vehicleModel: '',
          vehicleYear: '',
          vehicleLicensePlate: '',
          vehicleVin: '',
          priorityLevel: 'MEDIUM'
        });
        
        // Redirect alla dashboard dopo 2 secondi
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.message || 'Errore durante la creazione del sinistro');
      }
    } catch (error: unknown) {
      setSubmitStatus('error');
      setSubmitMessage('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna alla Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Nuovo Sinistro</h1>
                  <p className="text-sm text-muted-foreground">Inserisci una nuova richiesta di sinistro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {submitStatus === 'success' && (
            <Card className="p-6 mb-6 border-green-200 bg-green-50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Successo!</h3>
                  <p className="text-green-700">{submitMessage}</p>
                </div>
              </div>
            </Card>
          )}

          {submitStatus === 'error' && (
            <Card className="p-6 mb-6 border-red-200 bg-red-50">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Errore</h3>
                  <p className="text-red-700">{submitMessage}</p>
                </div>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dati Richiedente */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Dati Richiedente</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="claimantName" className="text-sm font-medium text-foreground">
                    Nome Completo *
                  </Label>
                  <Input
                    id="claimantName"
                    value={formData.claimantName}
                    onChange={(e) => handleInputChange('claimantName', e.target.value)}
                    placeholder="Mario Rossi"
                    className={errors.claimantName ? 'border-red-500' : ''}
                  />
                  {errors.claimantName && (
                    <p className="text-sm text-red-600">{errors.claimantName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="claimantEmail" className="text-sm font-medium text-foreground">
                    Email *
                  </Label>
                  <Input
                    id="claimantEmail"
                    type="email"
                    value={formData.claimantEmail}
                    onChange={(e) => handleInputChange('claimantEmail', e.target.value)}
                    placeholder="mario.rossi@email.com"
                    className={errors.claimantEmail ? 'border-red-500' : ''}
                  />
                  {errors.claimantEmail && (
                    <p className="text-sm text-red-600">{errors.claimantEmail}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="claimantPhone" className="text-sm font-medium text-foreground">
                    Telefono
                  </Label>
                  <Input
                    id="claimantPhone"
                    value={formData.claimantPhone}
                    onChange={(e) => handleInputChange('claimantPhone', e.target.value)}
                    placeholder="+39 333 1234567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="policyNumber" className="text-sm font-medium text-foreground">
                    Numero Polizza *
                  </Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                    placeholder="POL-2024-12345"
                    className={errors.policyNumber ? 'border-red-500' : ''}
                  />
                  {errors.policyNumber && (
                    <p className="text-sm text-red-600">{errors.policyNumber}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Dati Incidente */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Dati Incidente</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="incidentDate" className="text-sm font-medium text-foreground">
                    Data Incidente *
                  </Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                    className={errors.incidentDate ? 'border-red-500' : ''}
                  />
                  {errors.incidentDate && (
                    <p className="text-sm text-red-600">{errors.incidentDate}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incidentTime" className="text-sm font-medium text-foreground">
                    Orario Incidente
                  </Label>
                  <Input
                    id="incidentTime"
                    type="time"
                    value={formData.incidentTime}
                    onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="claimType" className="text-sm font-medium text-foreground">
                    Tipo Sinistro *
                  </Label>
                  <Select 
                    value={formData.claimType} 
                    onValueChange={(value) => handleInputChange('claimType', value)}
                  >
                    <SelectTrigger className={errors.claimType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleziona tipo sinistro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COLLISION">Collisione</SelectItem>
                      <SelectItem value="THEFT">Furto</SelectItem>
                      <SelectItem value="VANDALISM">Vandalismo</SelectItem>
                      <SelectItem value="NATURAL_DISASTER">Disastro Naturale</SelectItem>
                      <SelectItem value="OTHER">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.claimType && (
                    <p className="text-sm text-red-600">{errors.claimType}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incidentLocation" className="text-sm font-medium text-foreground">
                    Luogo Incidente *
                  </Label>
                  <Input
                    id="incidentLocation"
                    value={formData.incidentLocation}
                    onChange={(e) => handleInputChange('incidentLocation', e.target.value)}
                    placeholder="Via Roma 123"
                    className={errors.incidentLocation ? 'border-red-500' : ''}
                  />
                  {errors.incidentLocation && (
                    <p className="text-sm text-red-600">{errors.incidentLocation}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incidentCity" className="text-sm font-medium text-foreground">
                    Città *
                  </Label>
                  <Input
                    id="incidentCity"
                    value={formData.incidentCity}
                    onChange={(e) => handleInputChange('incidentCity', e.target.value)}
                    placeholder="Milano"
                    className={errors.incidentCity ? 'border-red-500' : ''}
                  />
                  {errors.incidentCity && (
                    <p className="text-sm text-red-600">{errors.incidentCity}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incidentProvince" className="text-sm font-medium text-foreground">
                    Provincia *
                  </Label>
                  <Input
                    id="incidentProvince"
                    value={formData.incidentProvince}
                    onChange={(e) => handleInputChange('incidentProvince', e.target.value)}
                    placeholder="MI"
                    className={errors.incidentProvince ? 'border-red-500' : ''}
                  />
                  {errors.incidentProvince && (
                    <p className="text-sm text-red-600">{errors.incidentProvince}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incidentPostalCode" className="text-sm font-medium text-foreground">
                    CAP *
                  </Label>
                  <Input
                    id="incidentPostalCode"
                    value={formData.incidentPostalCode}
                    onChange={(e) => handleInputChange('incidentPostalCode', e.target.value)}
                    placeholder="20121"
                    className={errors.incidentPostalCode ? 'border-red-500' : ''}
                  />
                  {errors.incidentPostalCode && (
                    <p className="text-sm text-red-600">{errors.incidentPostalCode}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Dati Veicolo */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Car className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Dati Veicolo</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake" className="text-sm font-medium text-foreground">
                    Marca *
                  </Label>
                  <Input
                    id="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                    placeholder="Fiat"
                    className={errors.vehicleMake ? 'border-red-500' : ''}
                  />
                  {errors.vehicleMake && (
                    <p className="text-sm text-red-600">{errors.vehicleMake}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel" className="text-sm font-medium text-foreground">
                    Modello *
                  </Label>
                  <Input
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    placeholder="Panda"
                    className={errors.vehicleModel ? 'border-red-500' : ''}
                  />
                  {errors.vehicleModel && (
                    <p className="text-sm text-red-600">{errors.vehicleModel}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear" className="text-sm font-medium text-foreground">
                    Anno
                  </Label>
                  <Input
                    id="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                    placeholder="2020"
                    className={errors.vehicleYear ? 'border-red-500' : ''}
                  />
                  {errors.vehicleYear && (
                    <p className="text-sm text-red-600">{errors.vehicleYear}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleLicensePlate" className="text-sm font-medium text-foreground">
                    Targa *
                  </Label>
                  <Input
                    id="vehicleLicensePlate"
                    value={formData.vehicleLicensePlate}
                    onChange={(e) => handleInputChange('vehicleLicensePlate', e.target.value)}
                    placeholder="AB123CD"
                    className={errors.vehicleLicensePlate ? 'border-red-500' : ''}
                  />
                  {errors.vehicleLicensePlate && (
                    <p className="text-sm text-red-600">{errors.vehicleLicensePlate}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleVin" className="text-sm font-medium text-foreground">
                    VIN
                  </Label>
                  <Input
                    id="vehicleVin"
                    value={formData.vehicleVin}
                    onChange={(e) => handleInputChange('vehicleVin', e.target.value)}
                    placeholder="1HGCM82633A123456"
                  />
                </div>
              </div>
            </Card>

            {/* Dettagli Sinistro */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Dettagli Sinistro</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="claimedAmount" className="text-sm font-medium text-foreground">
                    Importo Richiesto (€) *
                  </Label>
                  <Input
                    id="claimedAmount"
                    type="number"
                    step="0.01"
                    value={formData.claimedAmount}
                    onChange={(e) => handleInputChange('claimedAmount', e.target.value)}
                    placeholder="1500.00"
                    className={errors.claimedAmount ? 'border-red-500' : ''}
                  />
                  {errors.claimedAmount && (
                    <p className="text-sm text-red-600">{errors.claimedAmount}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedDamage" className="text-sm font-medium text-foreground">
                    Danni Stimati (€)
                  </Label>
                  <Input
                    id="estimatedDamage"
                    type="number"
                    step="0.01"
                    value={formData.estimatedDamage}
                    onChange={(e) => handleInputChange('estimatedDamage', e.target.value)}
                    placeholder="1200.00"
                    className={errors.estimatedDamage ? 'border-red-500' : ''}
                  />
                  {errors.estimatedDamage && (
                    <p className="text-sm text-red-600">{errors.estimatedDamage}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priorityLevel" className="text-sm font-medium text-foreground">
                    Livello Priorità
                  </Label>
                  <Select 
                    value={formData.priorityLevel} 
                    onValueChange={(value) => handleInputChange('priorityLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Bassa</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <Label htmlFor="claimDescription" className="text-sm font-medium text-foreground">
                  Descrizione Sinistro
                </Label>
                <Textarea
                  id="claimDescription"
                  value={formData.claimDescription}
                  onChange={(e) => handleInputChange('claimDescription', e.target.value)}
                  placeholder="Descrivi in dettaglio l'accaduto..."
                  rows={4}
                />
              </div>
            </Card>

            {/* Pulsanti Azione */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/">Annulla</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvataggio...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Crea Sinistro</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}