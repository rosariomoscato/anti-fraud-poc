import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim, riskAssessment, type NewInsuranceClaim, type NewRiskAssessment } from '@/lib/schema';
import { desc, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { calculateRiskScore } from '@/lib/risk-calculator';

interface ClaimData {
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  policyNumber: string;
  claimType: string;
  claimDescription: string;
  claimedAmount: string;
  estimatedDamage: string;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  incidentCity: string;
  incidentProvince: string;
  incidentPostalCode: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleLicensePlate: string;
  vehicleVin: string;
  priorityLevel: string;
}

// Funzione per generare un numero di sinistro univoco
function generateClaimNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const year = new Date().getFullYear().toString();
  return `SIN-${year}-${timestamp.slice(-6)}${random}`;
}

// Funzione per validare i dati del sinistro
function validateClaimData(data: ClaimData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validazione campi obbligatori
  if (!data.claimantName || data.claimantName.trim().length < 2) {
    errors.push('Il nome del richiedente è obbligatorio e deve essere di almeno 2 caratteri');
  }

  if (!data.claimantEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.claimantEmail)) {
    errors.push('L\'email del richiedente è obbligatoria e deve essere valida');
  }

  if (!data.policyNumber || data.policyNumber.trim().length < 3) {
    errors.push('Il numero di polizza è obbligatorio');
  }

  if (!data.claimType || !['COLLISION', 'THEFT', 'VANDALISM', 'NATURAL_DISASTER', 'OTHER'].includes(data.claimType)) {
    errors.push('Il tipo di sinistro è obbligatorio e deve essere valido');
  }

  if (!data.incidentDate) {
    errors.push('La data dell\'incidente è obbligatoria');
  } else {
    const incidentDate = new Date(data.incidentDate);
    const today = new Date();
    if (incidentDate > today) {
      errors.push('La data dell\'incidente non può essere nel futuro');
    }
  }

  if (!data.incidentLocation || data.incidentLocation.trim().length < 5) {
    errors.push('La località dell\'incidente è obbligatoria');
  }

  if (!data.incidentCity || data.incidentCity.trim().length < 2) {
    errors.push('La città è obbligatoria');
  }

  if (!data.incidentProvince || data.incidentProvince.trim().length !== 2) {
    errors.push('La provincia è obbligatoria e deve essere di 2 caratteri');
  }

  if (!data.incidentPostalCode || !/^\d{5}$/.test(data.incidentPostalCode)) {
    errors.push('Il CAP è obbligatorio e deve essere di 5 cifre');
  }

  if (!data.vehicleMake || data.vehicleMake.trim().length < 2) {
    errors.push('La marca del veicolo è obbligatoria');
  }

  if (!data.vehicleModel || data.vehicleModel.trim().length < 2) {
    errors.push('Il modello del veicolo è obbligatorio');
  }

  if (!data.vehicleLicensePlate || data.vehicleLicensePlate.trim().length < 5) {
    errors.push('La targa del veicolo è obbligatoria');
  }

  // Validazione importi
  const claimedAmount = parseFloat(data.claimedAmount);
  if (!data.claimedAmount || isNaN(claimedAmount) || claimedAmount <= 0) {
    errors.push('L\'importo richiesto è obbligatorio e deve essere maggiore di 0');
  }

  if (data.estimatedDamage) {
    const estimatedDamage = parseFloat(data.estimatedDamage);
    if (isNaN(estimatedDamage) || estimatedDamage < 0) {
      errors.push('L\'importo dei danni stimati deve essere un numero valido');
    }
  }

  // Validazione anno veicolo
  if (data.vehicleYear) {
    const year = parseInt(data.vehicleYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      errors.push('L\'anno del veicolo deve essere tra 1900 e ' + (currentYear + 1));
    }
  }

  // Validazione livello priorità
  if (!data.priorityLevel || !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(data.priorityLevel)) {
    errors.push('Il livello di priorità non è valido');
  }

  return { isValid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Utente non autenticato' },
        { status: 401 }
      );
    }

    // Parse e validazione dei dati
    const body = await request.json();
    
    const validation = validateClaimData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dati non validi',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Genera ID e numero sinistro
    const claimId = generateId();
    const claimNumber = generateClaimNumber();

    // Prepara i dati per l'inserimento
    const claimData: NewInsuranceClaim = {
      id: claimId,
      claimNumber: claimNumber,
      policyNumber: body.policyNumber,
      claimantId: generateId(), // Genera un ID per il richiedente
      claimantName: body.claimantName,
      claimantEmail: body.claimantEmail,
      claimantPhone: body.claimantPhone || null,
      
      // Dati incidente
      incidentDate: new Date(body.incidentDate),
      incidentTime: body.incidentTime || null,
      incidentLocation: body.incidentLocation,
      incidentCity: body.incidentCity,
      incidentProvince: body.incidentProvince,
      incidentPostalCode: body.incidentPostalCode,
      incidentCountry: 'IT',
      
      // Dati veicolo
      vehicleMake: body.vehicleMake,
      vehicleModel: body.vehicleModel,
      vehicleYear: body.vehicleYear ? parseInt(body.vehicleYear) : null,
      vehicleLicensePlate: body.vehicleLicensePlate,
      vehicleVin: body.vehicleVin || null,
      
      // Dati sinistro
      claimType: body.claimType,
      claimDescription: body.claimDescription || null,
      estimatedDamage: body.estimatedDamage ? parseFloat(body.estimatedDamage).toString() : null,
      claimedAmount: parseFloat(body.claimedAmount).toString(),
      
      // Status
      claimStatus: 'SUBMITTED',
      priorityLevel: body.priorityLevel,
      
      // Metadata
      submittedBy: session.user.id
    };

    // Inserisci il sinistro nel database
    const [newClaim] = await db.insert(insuranceClaim).values(claimData).returning();

    // Calcola il punteggio di rischio automaticamente
    try {
      const riskResult = calculateRiskScore({
        incidentDate: claimData.incidentDate,
        incidentTime: claimData.incidentTime || '',
        claimedAmount: parseFloat(claimData.claimedAmount),
        estimatedDamage: claimData.estimatedDamage ? parseFloat(claimData.estimatedDamage) : 0,
        incidentCity: claimData.incidentCity,
        incidentProvince: claimData.incidentProvince,
        vehicleMake: claimData.vehicleMake,
        vehicleModel: claimData.vehicleModel,
        vehicleYear: claimData.vehicleYear || new Date().getFullYear(),
        claimantId: claimData.claimantId,
        claimType: claimData.claimType
      });
      
      // Crea la valutazione del rischio
      const riskAssessmentData: NewRiskAssessment = {
        id: generateId(),
        claimId: claimId,
        overallRiskScore: riskResult.overallScore,
        riskCategory: riskResult.category,
        locationRiskScore: riskResult.locationScore,
        timeRiskScore: riskResult.timeScore,
        amountRiskScore: riskResult.amountScore,
        historyRiskScore: riskResult.historyScore,
        behaviorRiskScore: riskResult.behaviorScore,
        featureImportance: riskResult.featureImportance,
        modelPrediction: riskResult.modelPrediction,
        modelConfidence: riskResult.confidence,
        explanation: riskResult.explanation,
        assessmentStatus: 'COMPLETED',
        reviewLevel: 1,
        assessedBy: session.user.id
      };

      await db.insert(riskAssessment).values(riskAssessmentData);
    } catch (riskError) {
      console.error('Errore durante il calcolo del rischio:', riskError);
      // Non bloccare la creazione del sinistro se il calcolo del rischio fallisce
    }

    return NextResponse.json({
      success: true,
      message: 'Sinistro creato con successo',
      claimNumber: claimNumber,
      claimId: claimId,
      claim: {
        id: claimId,
        claimNumber: claimNumber,
        claimantName: claimData.claimantName,
        claimType: claimData.claimType,
        claimStatus: claimData.claimStatus,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Errore durante la creazione del sinistro:', error);
    
    // Gestione specifica degli errori del database
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return NextResponse.json(
          { success: false, message: 'Numero di polizza o targa già esistenti' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Errore interno del server durante la creazione del sinistro' },
      { status: 500 }
    );
  }
}

// GET endpoint per recuperare la lista dei sinistri (opzionale, per futuro utilizzo)
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Utente non autenticato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Recupera i sinistri dal database
    const claims = await db
      .select({
        id: insuranceClaim.id,
        claimNumber: insuranceClaim.claimNumber,
        claimantName: insuranceClaim.claimantName,
        claimType: insuranceClaim.claimType,
        claimStatus: insuranceClaim.claimStatus,
        priorityLevel: insuranceClaim.priorityLevel,
        claimedAmount: insuranceClaim.claimedAmount,
        incidentDate: insuranceClaim.incidentDate,
        createdAt: insuranceClaim.createdAt
      })
      .from(insuranceClaim)
      .orderBy(desc(insuranceClaim.createdAt))
      .limit(limit)
      .offset(offset);

    // Conta il totale per la paginazione
    const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(insuranceClaim);
    const total = totalCount ? totalCount.count : 0;

    return NextResponse.json({
      success: true,
      data: claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Errore durante il recupero dei sinistri:', error);
    return NextResponse.json(
      { success: false, message: 'Errore interno del server' },
      { status: 500 }
    );
  }
}