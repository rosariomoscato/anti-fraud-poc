import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim, riskAssessment, fraudDetection, type NewInsuranceClaim, type NewRiskAssessment, type NewFraudDetection } from '@/lib/schema';
import { generateId } from '@/lib/utils';
import { auth } from '@/lib/auth';

interface CsvRow {
  [key: string]: string;
}

interface ValidatedClaim {
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  incidentDate: Date;
  incidentTime: string;
  incidentLocation: string;
  incidentCity: string;
  incidentProvince: string;
  incidentPostalCode: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleLicensePlate: string;
  vehicleVin: string;
  claimType: string;
  claimDescription: string;
  estimatedDamage: number;
  claimedAmount: number;
  claimStatus: string;
  priorityLevel: string;
}

// Validation functions
function validateRequired(value: string, fieldName: string): string {
  if (!value || value.trim() === '') {
    throw new Error(`Il campo ${fieldName} è obbligatorio`);
  }
  return value.trim();
}

function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Formato email non valido');
  }
  return email;
}

function validateDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Formato data non valido. Usa YYYY-MM-DD');
  }
  return date;
}

function validateTime(timeString: string): string {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString)) {
    throw new Error('Formato orario non valido. Usa HH:MM');
  }
  return timeString;
}

function validateYear(yearString: string): number {
  const year = parseInt(yearString);
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear + 1) {
    throw new Error('Anno veicolo non valido');
  }
  return year;
}

function validateAmount(amountString: string): number {
  const amount = parseFloat(amountString);
  if (isNaN(amount) || amount < 0) {
    throw new Error('Importo non valido');
  }
  return amount;
}

function validateClaimType(claimType: string): string {
  const validTypes = ['COLLISION', 'THEFT', 'VANDALISM', 'NATURAL_DISASTER', 'OTHER'];
  if (!validTypes.includes(claimType)) {
    throw new Error(`Tipo sinistro non valido. Valori consentiti: ${validTypes.join(', ')}`);
  }
  return claimType;
}

function validateClaimStatus(status: string): string {
  const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'UNDER_INVESTIGATION'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Stato sinistro non valido. Valori consentiti: ${validStatuses.join(', ')}`);
  }
  return status;
}

function validatePriorityLevel(priority: string): string {
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  if (!validPriorities.includes(priority)) {
    throw new Error(`Priorità non valida. Valori consentiti: ${validPriorities.join(', ')}`);
  }
  return priority;
}

async function validateCsvRow(row: CsvRow, rowIndex: number): Promise<ValidatedClaim> {
  try {
    return {
      claimNumber: validateRequired(row.claimNumber, 'Numero Sinistro'),
      policyNumber: validateRequired(row.policyNumber, 'Numero Polizza'),
      claimantName: validateRequired(row.claimantName, 'Nome Richiedente'),
      claimantEmail: validateEmail(validateRequired(row.claimantEmail, 'Email Richiedente')),
      claimantPhone: validateRequired(row.claimantPhone, 'Telefono Richiedente'),
      incidentDate: validateDate(validateRequired(row.incidentDate, 'Data Incidente')),
      incidentTime: validateTime(validateRequired(row.incidentTime, 'Ora Incidente')),
      incidentLocation: validateRequired(row.incidentLocation, 'Location Incidente'),
      incidentCity: validateRequired(row.incidentCity, 'Città Incidente'),
      incidentProvince: validateRequired(row.incidentProvince, 'Provincia Incidente'),
      incidentPostalCode: validateRequired(row.incidentPostalCode, 'CAP Incidente'),
      vehicleMake: validateRequired(row.vehicleMake, 'Marca Veicolo'),
      vehicleModel: validateRequired(row.vehicleModel, 'Modello Veicolo'),
      vehicleYear: validateYear(validateRequired(row.vehicleYear, 'Anno Veicolo')),
      vehicleLicensePlate: validateRequired(row.vehicleLicensePlate, 'Targa Veicolo'),
      vehicleVin: validateRequired(row.vehicleVin, 'VIN Veicolo'),
      claimType: validateClaimType(validateRequired(row.claimType, 'Tipo Sinistro')),
      claimDescription: validateRequired(row.claimDescription, 'Descrizione Sinistro'),
      estimatedDamage: validateAmount(validateRequired(row.estimatedDamage, 'Danni Stimati')),
      claimedAmount: validateAmount(validateRequired(row.claimedAmount, 'Importo Richiesto')),
      claimStatus: validateClaimStatus(row.claimStatus || 'SUBMITTED'),
      priorityLevel: validatePriorityLevel(row.priorityLevel || 'MEDIUM')
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Riga ${rowIndex + 1}: ${error.message}`);
    }
    throw error;
  }
}

// Risk scoring function for imported claims
function calculateRiskScore(claim: ValidatedClaim): number {
  let riskScore = 30; // Base risk score
  
  // Increase risk based on amount
  if (claim.claimedAmount > 10000) riskScore += 15;
  if (claim.claimedAmount > 25000) riskScore += 15;
  
  // Increase risk based on time
  const incidentHour = parseInt(claim.incidentTime.split(':')[0]);
  if (incidentHour >= 22 || incidentHour <= 6) riskScore += 10;
  
  // Increase risk based on claim type
  if (claim.claimType === 'THEFT') riskScore += 20;
  if (claim.claimType === 'VANDALISM') riskScore += 10;
  
  // Increase risk based on vehicle age
  const vehicleAge = new Date().getFullYear() - claim.vehicleYear;
  if (vehicleAge > 10) riskScore += 10;
  if (vehicleAge > 15) riskScore += 10;
  
  return Math.min(100, Math.max(1, riskScore));
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as 'overwrite' | 'append' || 'append';

    if (!file) {
      return NextResponse.json({ error: "Nessun file fornito" }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: "Il file deve essere in formato CSV" }, { status: 400 });
    }

    const content = await file.text();
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    if (lines.length < 2) {
      return NextResponse.json({ 
        error: "Il file CSV deve contenere almeno una riga di intestazione e una di dati" 
      }, { status: 400 });
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: CsvRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    // Clear existing data if in overwrite mode
    if (mode === 'overwrite') {
      try {
        await db.delete(insuranceClaim);
        console.log('Cleared existing claims in overwrite mode');
      } catch (error) {
        console.error('Error clearing existing claims:', error);
      }
    }

    // Process and validate rows
    const validClaims: ValidatedClaim[] = [];
    const errors: string[] = [];
    let importedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      try {
        const validatedClaim = await validateCsvRow(rows[i], i);
        validClaims.push(validatedClaim);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        }
      }
    }

    if (validClaims.length === 0) {
      return NextResponse.json({ 
        error: "Nessun dato valido trovato nel file",
        errors 
      }, { status: 400 });
    }

    // Insert valid claims into database
    for (const claim of validClaims) {
      try {
        const riskScore = calculateRiskScore(claim);
        const claimId = generateId();

        // Insert claim
        const claimData: NewInsuranceClaim = {
          id: claimId,
          claimNumber: claim.claimNumber,
          policyNumber: claim.policyNumber,
          claimantId: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          claimantName: claim.claimantName,
          claimantEmail: claim.claimantEmail,
          claimantPhone: claim.claimantPhone,
          incidentDate: claim.incidentDate,
          incidentTime: claim.incidentTime,
          incidentLocation: claim.incidentLocation,
          incidentCity: claim.incidentCity,
          incidentProvince: claim.incidentProvince,
          incidentPostalCode: claim.incidentPostalCode,
          vehicleMake: claim.vehicleMake,
          vehicleModel: claim.vehicleModel,
          vehicleYear: claim.vehicleYear,
          vehicleLicensePlate: claim.vehicleLicensePlate,
          vehicleVin: claim.vehicleVin,
          claimType: claim.claimType,
          claimDescription: claim.claimDescription,
          estimatedDamage: claim.estimatedDamage.toString(),
          claimedAmount: claim.claimedAmount.toString(),
          claimStatus: claim.claimStatus,
          priorityLevel: claim.priorityLevel,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.insert(insuranceClaim).values(claimData);

        // Generate risk assessment
        const riskAssessmentData: NewRiskAssessment = {
          id: generateId(),
          claimId: claimId,
          overallRiskScore: riskScore,
          riskCategory: riskScore <= 30 ? 'LOW' : riskScore <= 70 ? 'MEDIUM' : 'HIGH',
          modelConfidence: 0.85,
          featureImportance: {
            amount: claim.claimedAmount > 10000,
            time: claim.incidentTime.startsWith('22') || claim.incidentTime.startsWith('23') || 
                   claim.incidentTime.startsWith('00') || claim.incidentTime.startsWith('01') ||
                   claim.incidentTime.startsWith('02') || claim.incidentTime.startsWith('03') ||
                   claim.incidentTime.startsWith('04') || claim.incidentTime.startsWith('05') ||
                   claim.incidentTime.startsWith('06'),
            claimType: claim.claimType === 'THEFT',
            vehicleAge: (new Date().getFullYear() - claim.vehicleYear) > 10
          },
          assessmentStatus: 'COMPLETED',
          assessedAt: new Date()
        };
        
        await db.insert(riskAssessment).values(riskAssessmentData);

        // Generate fraud detection if high risk
        if (riskScore > 60) {
          const fraudDetectionData: NewFraudDetection = {
            id: generateId(),
            claimId: claimId,
            detectionType: riskScore > 80 ? 'ML_BASED' : 'RULE_BASED',
            confidenceScore: Math.min(0.95, riskScore / 100),
            evidence: riskScore > 80 ? 
              ['High claim amount', 'Unusual incident time', 'Suspicious pattern detected'] :
              ['Elevated risk score', 'Additional verification recommended'],
            detectionStatus: 'DETECTED',
            detectedAt: new Date()
          };
          
          await db.insert(fraudDetection).values(fraudDetectionData);
        }

        importedCount++;
      } catch (error) {
        console.error(`Error inserting claim ${claim.claimNumber}:`, error);
        errors.push(`Errore nell'inserimento del sinistro ${claim.claimNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const message = mode === 'overwrite' 
      ? `Importazione completata: ${importedCount} sinistri importati (dati esistenti cancellati)`
      : `Importazione completata: ${importedCount} sinistri importati (aggiunti ai dati esistenti)`;

    return NextResponse.json({ 
      success: true, 
      message,
      importedCount,
      totalRows: rows.length,
      validRows: validClaims.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error importing CSV data:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}