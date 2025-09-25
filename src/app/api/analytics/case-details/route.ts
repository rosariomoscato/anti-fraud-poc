import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface CaseDetails {
  id: string;
  claimNumber: string;
  policyNumber: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  incidentDate: Date;
  incidentTime: string;
  incidentLocation: string;
  incidentCity: string;
  incidentProvince: string;
  incidentPostalCode: string;
  incidentCountry: string;
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
  createdAt: Date;
  updatedAt: Date;
  riskScore: number;
  riskCategory: string;
  fraudIndicators: Array<{
    type: string;
    description: string;
    riskImpact: number;
  }>;
}

function getRiskCategory(score: number): string {
  if (score <= 30) return 'Basso Rischio';
  if (score <= 60) return 'Medio Rischio';
  return 'Alto Rischio';
}

function calculateRiskScore(priorityLevel: string | null): number {
  switch (priorityLevel) {
    case 'HIGH': return 85;
    case 'URGENT': return 95;
    case 'MEDIUM': return 55;
    case 'LOW': return 25;
    default: return 50;
  }
}

function generateFraudIndicators(claim: any): Array<{
  type: string;
  description: string;
  riskImpact: number;
}> {
  const indicators = [];
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const claimedAmount = parseFloat(claim.claimedAmount.toString());
  const incidentDate = new Date(claim.incidentDate);
  const incidentHour = incidentDate.getHours();
  
  // Night time incidents (22:00 - 06:00)
  if (incidentHour >= 22 || incidentHour <= 6) {
    indicators.push({
      type: 'TEMPORAL',
      description: 'Incidente durante ore notturne',
      riskImpact: 15
    });
  }
  
  // High value claims
  if (claimedAmount > 15000) {
    indicators.push({
      type: 'FINANCIAL',
      description: 'Importo elevato richiesto',
      riskImpact: 20
    });
  }
  
  // Theft claims
  if (claim.claimType === 'THEFT') {
    indicators.push({
      type: 'CLAIM_TYPE',
      description: 'Tipologia di sinistro ad alto rischio',
      riskImpact: 25
    });
  }
  
  // High risk cities
  const highRiskCities = ['Napoli', 'Palermo', 'Catania', 'Bari'];
  if (highRiskCities.includes(claim.incidentCity)) {
    indicators.push({
      type: 'GEOGRAPHICAL',
      description: 'Area geografica ad alto rischio',
      riskImpact: 15
    });
  }
  
  // Old vehicle
  if (claim.vehicleYear < 2010) {
    indicators.push({
      type: 'VEHICLE',
      description: 'Veicolo datato',
      riskImpact: 10
    });
  }
  
  // Urgent priority
  if (claim.priorityLevel === 'URGENT') {
    indicators.push({
      type: 'PRIORITY',
      description: 'Priorità urgente',
      riskImpact: 30
    });
  }
  
  return indicators;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID parameter is required' },
        { status: 400 }
      );
    }

    // Get the specific claim
    const claim = await db
      .select()
      .from(insuranceClaim)
      .where(eq(insuranceClaim.id, id))
      .limit(1);

    if (claim.length === 0) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    const claimData = claim[0];
    const riskScore = calculateRiskScore(claimData.priorityLevel);
    const fraudIndicators = generateFraudIndicators(claimData);

    const caseDetails: CaseDetails = {
      id: claimData.id,
      claimNumber: claimData.claimNumber || '',
      policyNumber: claimData.policyNumber || '',
      claimantId: claimData.claimantId || '',
      claimantName: claimData.claimantName || '',
      claimantEmail: claimData.claimantEmail || '',
      claimantPhone: claimData.claimantPhone || '',
      incidentDate: claimData.incidentDate,
      incidentTime: claimData.incidentTime || '',
      incidentLocation: claimData.incidentLocation || '',
      incidentCity: claimData.incidentCity || '',
      incidentProvince: claimData.incidentProvince || '',
      incidentPostalCode: claimData.incidentPostalCode || '',
      incidentCountry: claimData.incidentCountry || '',
      vehicleMake: claimData.vehicleMake || '',
      vehicleModel: claimData.vehicleModel || '',
      vehicleYear: claimData.vehicleYear || 0,
      vehicleLicensePlate: claimData.vehicleLicensePlate || '',
      vehicleVin: claimData.vehicleVin || '',
      claimType: claimData.claimType || '',
      claimDescription: claimData.claimDescription || '',
      estimatedDamage: claimData.estimatedDamage ? parseFloat(claimData.estimatedDamage.toString()) : 0,
      claimedAmount: parseFloat(claimData.claimedAmount.toString()),
      claimStatus: claimData.claimStatus || 'UNKNOWN',
      priorityLevel: claimData.priorityLevel || 'UNKNOWN',
      createdAt: claimData.createdAt,
      updatedAt: claimData.updatedAt,
      riskScore,
      riskCategory: getRiskCategory(riskScore),
      fraudIndicators
    };

    return NextResponse.json({ 
      success: true, 
      data: caseDetails,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching case details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    );
  }
}