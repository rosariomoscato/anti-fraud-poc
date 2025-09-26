import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql, desc, or, and, gte } from 'drizzle-orm';

interface RecentActivity {
  id: string;
  claimId: string;
  type: 'new_claim' | 'fraud_detection' | 'investigation_started' | 'status_change' | 'high_priority_alert';
  claimNumber: string;
  claimant: string;
  riskScore: number;
  status: string;
  timestamp: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

interface ActivityEvent {
  claim: any;
  eventType: 'new_claim' | 'fraud_detection' | 'investigation_started' | 'status_change' | 'high_priority_alert';
  eventDate: Date;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
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

function getActivityDescription(eventType: string, claim: any): string {
  switch (eventType) {
    case 'new_claim':
      return `Nuovo sinistro ${claim.claimType?.toLowerCase() || 'registrato'}`;
    case 'fraud_detection':
      return `Rilevato potenziale frode con punteggio rischio ${calculateRiskScore(claim.priorityLevel)}`;
    case 'investigation_started':
      return `Indagine avviata per sinistro ad alto rischio`;
    case 'status_change':
      return `Stato aggiornato a ${claim.claimStatus?.replace('_', ' ') || 'unknown'}`;
    case 'high_priority_alert':
      return `Allerta: sinistro con priorità ${claim.priorityLevel}`;
    default:
      return 'Evento non specificato';
  }
}

function getStatusFromClaim(claim: any): string {
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const isHighRisk = claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT';
  const isFraudDetected = riskScore > 70;

  if (isFraudDetected) return 'FRAUD_DETECTED';
  if (claim.claimStatus === 'UNDER_INVESTIGATION') return 'UNDER_INVESTIGATION';
  if (isHighRisk) return 'HIGH_RISK';
  if (claim.claimStatus === 'APPROVED') return 'APPROVED';
  if (claim.claimStatus === 'REJECTED') return 'REJECTED';
  return 'PENDING';
}

export async function GET(request: NextRequest) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get claims from the last 30 days
    const recentClaims = await db
      .select({
        id: insuranceClaim.id,
        claimNumber: insuranceClaim.claimNumber,
        claimantName: insuranceClaim.claimantName,
        claimType: insuranceClaim.claimType,
        priorityLevel: insuranceClaim.priorityLevel,
        claimStatus: insuranceClaim.claimStatus,
        incidentDate: insuranceClaim.incidentDate,
        createdAt: insuranceClaim.createdAt,
        updatedAt: insuranceClaim.updatedAt,
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
      .where(gte(insuranceClaim.createdAt, thirtyDaysAgo))
      .orderBy(desc(insuranceClaim.updatedAt))
      .limit(50);

    // Generate significant events from claims
    const events: ActivityEvent[] = [];

    recentClaims.forEach(claim => {
      const riskScore = calculateRiskScore(claim.priorityLevel);
      const isHighRisk = claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT';
      const isFraudDetected = riskScore > 70 || claim.fraudScore > 70;
      const isRecent = new Date(claim.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours
      const isHighValue = parseFloat(claim.claimedAmount?.toString() || '0') > 15000;

      // New high-value claim
      if (isRecent && isHighValue) {
        events.push({
          claim,
          eventType: 'new_claim',
          eventDate: new Date(claim.createdAt),
          description: getActivityDescription('new_claim', claim),
          significance: 'high'
        });
      }

      // Fraud detection events
      if (isFraudDetected) {
        events.push({
          claim,
          eventType: 'fraud_detection',
          eventDate: new Date(claim.updatedAt),
          description: getActivityDescription('fraud_detection', claim),
          significance: 'critical'
        });
      }

      // Investigation started
      if (claim.claimStatus === 'UNDER_INVESTIGATION' && isHighRisk) {
        events.push({
          claim,
          eventType: 'investigation_started',
          eventDate: new Date(claim.updatedAt),
          description: getActivityDescription('investigation_started', claim),
          significance: 'high'
        });
      }

      // High priority alerts
      if (claim.priorityLevel === 'URGENT') {
        events.push({
          claim,
          eventType: 'high_priority_alert',
          eventDate: new Date(claim.updatedAt),
          description: getActivityDescription('high_priority_alert', claim),
          significance: 'critical'
        });
      }

      // Status changes to approved/rejected
      if (claim.claimStatus === 'APPROVED' || claim.claimStatus === 'REJECTED') {
        events.push({
          claim,
          eventType: 'status_change',
          eventDate: new Date(claim.updatedAt),
          description: getActivityDescription('status_change', claim),
          significance: claim.claimStatus === 'APPROVED' ? 'medium' : 'high'
        });
      }
    });

    // Sort events by significance and date, then take the most recent 10
    const significantEvents = events
      .sort((a, b) => {
        // First by significance (critical > high > medium > low)
        const significanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const sigDiff = significanceOrder[b.significance] - significanceOrder[a.significance];
        if (sigDiff !== 0) return sigDiff;
        
        // Then by date (most recent first)
        return b.eventDate.getTime() - a.eventDate.getTime();
      })
      .slice(0, 5);

    // Transform to activity format
    const recentActivity: RecentActivity[] = significantEvents.map(event => ({
      id: `${event.claim.id}_${event.eventType}`,
      claimId: event.claim.id,
      type: event.eventType,
      claimNumber: event.claim.claimNumber || 'UNKNOWN',
      claimant: event.claim.claimantName || 'Unknown',
      riskScore: event.claim.riskScore || 50,
      status: getStatusFromClaim(event.claim),
      timestamp: getTimeAgo(event.eventDate),
      description: event.description,
      significance: event.significance
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