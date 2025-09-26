import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql, and, gte, lte, desc, eq, or } from 'drizzle-orm';

interface DashboardStats {
  totalClaims: number;
  highRiskClaims: number;
  pendingInvestigations: number;
  fraudDetected: number;
  avgRiskScore: number;
  totalProcessed: number;
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

export async function GET(request: NextRequest) {
  try {
    // Get all claims for statistics
    const claims = await db
      .select({
        id: insuranceClaim.id,
        priorityLevel: insuranceClaim.priorityLevel,
        claimStatus: insuranceClaim.claimStatus,
        claimedAmount: insuranceClaim.claimedAmount,
        riskScore: sql<number>`CASE 
          WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
          WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
          WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
          WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
          ELSE 50
        END`,
        fraudScore: sql<number>`CASE 
          WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 75
          WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 90
          WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 45
          WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 15
          ELSE 30
        END`,
      })
      .from(insuranceClaim)
      .orderBy(desc(insuranceClaim.incidentDate));

    // Calculate total claims
    const totalClaims = claims.length;

    // Calculate high risk claims (HIGH or URGENT priority)
    const highRiskClaims = claims.filter(claim => 
      claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT'
    ).length;

    // Calculate pending investigations (claims with UNDER_INVESTIGATION status or high priority that need attention)
    const pendingInvestigations = claims.filter(claim => 
      claim.claimStatus === 'UNDER_INVESTIGATION' ||
      claim.priorityLevel === 'HIGH' ||
      claim.priorityLevel === 'URGENT'
    ).length;

    // Calculate fraud detected (claims with high fraud score or high risk)
    const fraudDetected = claims.filter(claim => 
      (claim.fraudScore > 70) || 
      (claim.riskScore > 70) ||
      (claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT')
    ).length;

    // Calculate average risk score
    const avgRiskScore = totalClaims > 0 
      ? claims.reduce((sum, claim) => sum + claim.riskScore, 0) / totalClaims 
      : 0;

    // Calculate total processed (claims that are not in pending status)
    const totalProcessed = claims.filter(claim => 
      claim.claimStatus !== 'PENDING' && claim.claimStatus !== null
    ).length;

    const dashboardStats: DashboardStats = {
      totalClaims,
      highRiskClaims,
      pendingInvestigations,
      fraudDetected,
      avgRiskScore: Math.round(avgRiskScore * 10) / 10,
      totalProcessed
    };

    return NextResponse.json({ 
      success: true, 
      data: dashboardStats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to generate dashboard statistics' },
      { status: 500 }
    );
  }
}