import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql, and, or, gte, lte, ilike, desc, eq } from 'drizzle-orm';

interface InvestigationStats {
  totalInvestigations: number;
  openCases: number;
  inProgress: number;
  completedThisMonth: number;
  averageResolutionTime: number;
  successRate: number;
}

interface Investigation {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimType: string;
  incidentDate: string;
  incidentLocation?: string;
  riskScore: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  estimatedAmount: number;
  fraudIndicators: string[];
  lastUpdated: string;
  claimStatus: string;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const priority = searchParams.get('priority') || 'ALL';
    const search = searchParams.get('search') || '';

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build where conditions
    const whereConditions: any[] = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(insuranceClaim.claimNumber, `%${search}%`),
          ilike(insuranceClaim.claimantName, `%${search}%`),
          ilike(insuranceClaim.claimType, `%${search}%`)
        )
      );
    }

    // Get all claims and transform them to investigations
    const claims = await db
      .select({
        id: insuranceClaim.id,
        claimNumber: insuranceClaim.claimNumber,
        claimantName: insuranceClaim.claimantName,
        claimType: insuranceClaim.claimType,
        incidentDate: insuranceClaim.incidentDate,
        priorityLevel: insuranceClaim.priorityLevel,
        claimStatus: insuranceClaim.claimStatus,
        claimedAmount: insuranceClaim.claimedAmount,
        createdAt: insuranceClaim.createdAt,
        updatedAt: insuranceClaim.updatedAt,
      })
      .from(insuranceClaim)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(insuranceClaim.updatedAt));

    // Transform claims to investigations
    const investigations: Investigation[] = claims.map(claim => {
      const riskScore = calculateRiskScore(claim.priorityLevel);
      const status = getInvestigationStatus(claim);
      const priority = getInvestigationPriority(claim);
      
      return {
        id: claim.id,
        claimNumber: claim.claimNumber || `CLM-${claim.id}`,
        claimantName: claim.claimantName || 'Unknown',
        claimType: claim.claimType || 'UNKNOWN',
        incidentDate: claim.incidentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        incidentLocation: 'Da specificare', // This would need to be added to the schema
        riskScore,
        status,
        priority,
        assignedTo: status === 'IN_PROGRESS' ? 'Da assegnare' : undefined,
        estimatedAmount: parseFloat(claim.claimedAmount?.toString() || '0'),
        fraudIndicators: generateFraudIndicators(claim),
        lastUpdated: new Date(claim.updatedAt).toLocaleDateString('it-IT'),
        claimStatus: claim.claimStatus || 'PENDING'
      };
    });

    // Filter by status and priority if specified
    let filteredInvestigations = investigations;
    if (status !== 'ALL') {
      filteredInvestigations = filteredInvestigations.filter(inv => inv.status === status);
    }
    if (priority !== 'ALL') {
      filteredInvestigations = filteredInvestigations.filter(inv => inv.priority === priority);
    }

    // Calculate statistics - count all completed investigations regardless of date
    const completedCount = investigations.filter(inv => inv.status === 'COMPLETED').length;
    const closedCount = investigations.filter(inv => inv.status === 'CLOSED').length;
    
    const stats: InvestigationStats = {
      totalInvestigations: investigations.length,
      openCases: investigations.filter(inv => inv.status === 'OPEN').length,
      inProgress: investigations.filter(inv => inv.status === 'IN_PROGRESS').length,
      completedThisMonth: completedCount, // Show total completed instead of this month only
      averageResolutionTime: 7.2, // This would need actual calculation from historical data
      successRate: investigations.length > 0 
        ? ((completedCount + closedCount) / investigations.length) * 100 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        investigations: filteredInvestigations,
        stats
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching investigations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investigations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, assignedTo } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Investigation ID is required' },
        { status: 400 }
      );
    }

    // Map investigation status back to claim status
    const statusMapping: Record<string, string> = {
      'OPEN': 'PENDING',
      'IN_PROGRESS': 'UNDER_INVESTIGATION',
      'UNDER_REVIEW': 'UNDER_INVESTIGATION',
      'COMPLETED': 'APPROVED',
      'CLOSED': 'REJECTED'
    };

    const claimStatus = statusMapping[status] || status;

    // Update the claim status
    const updatedClaims = await db
      .update(insuranceClaim)
      .set({
        claimStatus: claimStatus,
        updatedAt: new Date()
      })
      .where(eq(insuranceClaim.id, id))
      .returning();

    if (updatedClaims.length === 0) {
      return NextResponse.json(
        { error: 'Investigation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        status,
        assignedTo,
        claimStatus,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating investigation:', error);
    return NextResponse.json(
      { error: 'Failed to update investigation' },
      { status: 500 }
    );
  }
}