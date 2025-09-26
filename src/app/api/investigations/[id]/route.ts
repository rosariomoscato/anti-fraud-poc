import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface InvestigationDetail {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimantEmail?: string;
  claimantPhone?: string;
  claimType: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDescription: string;
  riskScore: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  estimatedAmount: number;
  fraudIndicators: string[];
  lastUpdated: string;
  claimStatus: string;
  createdAt: string;
  investigationNotes?: string[];
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

function getInvestigationStatus(claim: any): 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CLOSED' {
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const isHighRisk = claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT';
  
  if (claim.claimStatus === 'APPROVED') return 'COMPLETED';
  if (claim.claimStatus === 'REJECTED') return 'CLOSED';
  if (claim.claimStatus === 'UNDER_INVESTIGATION') return 'IN_PROGRESS';
  if (riskScore > 70) return 'OPEN';
  if (isHighRisk) return 'UNDER_REVIEW';
  return 'OPEN';
}

function getInvestigationPriority(claim: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  if (claim.priorityLevel === 'URGENT') return 'URGENT';
  if (claim.priorityLevel === 'HIGH') return 'HIGH';
  if (claim.priorityLevel === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

function generateFraudIndicators(claim: any): string[] {
  const indicators: string[] = [];
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const amount = parseFloat(claim.claimedAmount?.toString() || '0');
  
  if (riskScore > 80) indicators.push('Alto rischio frode');
  if (amount > 15000) indicators.push('Importo elevato');
  if (claim.priorityLevel === 'URGENT') indicators.push('Tempestività sospetta');
  if (claim.claimType === 'THEFT') indicators.push('Furto - area ad alto rischio');
  if (claim.claimStatus === 'UNDER_INVESTIGATION') indicators.push('Sotto indagine');
  
  return indicators;
}

function generateInvestigationNotes(claim: any): string[] {
  const notes: string[] = [];
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const status = getInvestigationStatus(claim);
  
  notes.push(`Valutazione rischio iniziale: ${riskScore}/100`);
  
  if (riskScore > 70) {
    notes.push('Richiesta verifica documenti aggiuntivi');
    notes.push('Analisi approfondita raccomandata');
  }
  
  if (status === 'IN_PROGRESS') {
    notes.push('Indagine in corso - attendere aggiornamenti');
  }
  
  if (claim.priorityLevel === 'URGENT') {
    notes.push('Caso urgente - priorità alta');
  }
  
  return notes;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Fetch the specific claim by ID
    const claim = await db
      .select()
      .from(insuranceClaim)
      .where(eq(insuranceClaim.id, id))
      .limit(1);

    if (claim.length === 0) {
      return NextResponse.json(
        { error: 'Investigation not found' },
        { status: 404 }
      );
    }

    const claimData = claim[0];
    const riskScore = calculateRiskScore(claimData.priorityLevel);
    const status = getInvestigationStatus(claimData);
    const priority = getInvestigationPriority(claimData);

    // Transform claim to investigation detail
    const investigation: InvestigationDetail = {
      id: claimData.id,
      claimNumber: claimData.claimNumber || `CLM-${claimData.id}`,
      claimantName: claimData.claimantName || 'Unknown',
      claimantEmail: claimData.claimantEmail || undefined,
      claimantPhone: claimData.claimantPhone || undefined,
      claimType: claimData.claimType || 'UNKNOWN',
      incidentDate: claimData.incidentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      incidentLocation: claimData.incidentLocation || 'Da specificare',
      incidentDescription: claimData.claimDescription || 'Descrizione non disponibile',
      riskScore,
      status,
      priority,
      assignedTo: status === 'IN_PROGRESS' ? 'Da assegnare' : undefined,
      estimatedAmount: parseFloat(claimData.claimedAmount?.toString() || '0'),
      fraudIndicators: generateFraudIndicators(claimData),
      lastUpdated: new Date(claimData.updatedAt).toLocaleDateString('it-IT'),
      claimStatus: claimData.claimStatus || 'PENDING',
      createdAt: new Date(claimData.createdAt).toLocaleDateString('it-IT'),
      investigationNotes: generateInvestigationNotes(claimData)
    };

    return NextResponse.json({
      success: true,
      data: investigation,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching investigation detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investigation detail' },
      { status: 500 }
    );
  }
}