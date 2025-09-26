import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql, desc, or, and, gte } from 'drizzle-orm';

interface RecentActivity {
  id: string;
  type: 'claim' | 'detection' | 'investigation';
  claimNumber: string;
  claimant: string;
  riskScore: number;
  status: string;
  timestamp: string;
}

function getActivityType(claim: any): 'claim' | 'detection' | 'investigation' {
  const riskScore = claim.riskScore || 50;
  const isHighRisk = claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT';
  const isFraudDetected = riskScore > 70 || (claim.fraudScore > 70);
  const isInvestigation = claim.claimStatus === 'UNDER_INVESTIGATION';

  if (isFraudDetected) return 'detection';
  if (isInvestigation || isHighRisk) return 'investigation';
  return 'claim';
}

function getStatusFromClaim(claim: any): string {
  const riskScore = claim.riskScore || 50;
  const isHighRisk = claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT';
  const isFraudDetected = riskScore > 70 || (claim.fraudScore > 70);

  if (isFraudDetected) return 'FRAUD_DETECTED';
  if (claim.claimStatus === 'UNDER_INVESTIGATION') return 'UNDER_INVESTIGATION';
  if (isHighRisk) return 'HIGH_RISK';
  if (claim.claimStatus === 'APPROVED') return 'APPROVED';
  return 'PENDING';
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get recent claims (last 10) for activity feed
    const recentClaims = await db
      .select({
        id: insuranceClaim.id,
        claimNumber: insuranceClaim.claimNumber,
        claimantName: insuranceClaim.claimantName,
        priorityLevel: insuranceClaim.priorityLevel,
        claimStatus: insuranceClaim.claimStatus,
        incidentDate: insuranceClaim.incidentDate,
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
      .orderBy(desc(insuranceClaim.incidentDate))
      .limit(10);

    // Transform claims into activity items
    const recentActivity: RecentActivity[] = recentClaims
      .filter(claim => claim.claimNumber && claim.claimantName) // Filter out incomplete records
      .map(claim => ({
        id: claim.id,
        type: getActivityType(claim),
        claimNumber: claim.claimNumber || 'UNKNOWN',
        claimant: claim.claimantName || 'Unknown',
        riskScore: claim.riskScore || 50,
        status: getStatusFromClaim(claim),
        timestamp: getTimeAgo(new Date(claim.incidentDate))
      }));

    return NextResponse.json({ 
      success: true, 
      data: recentActivity,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to generate recent activity' },
      { status: 500 }
    );
  }
}