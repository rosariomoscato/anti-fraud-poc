import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { and, gte, lte, desc, sql, eq } from 'drizzle-orm';

interface CityDetails {
  totalClaims: number;
  fraudRate: number;
  avgRiskScore: number;
  totalAmount: number;
  claimsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  riskByCategory: Array<{
    category: string;
    count: number;
    avgScore: number;
  }>;
  recentClaims: Array<{
    id: string;
    claimType: string;
    incidentDate: Date;
    claimedAmount: string;
    priorityLevel: string;
  }>;
}

function getTimeFilter(timeframe: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now);
  // eslint-disable-next-line prefer-const
  let startDate = new Date(now);

  switch (timeframe) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      // Go back 2 years to include all synthetic data
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  // Set time to start of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const timeFilter = getTimeFilter(timeframe);

    // Get all claims for the specific city within time period
    const claims = await db
      .select({
        id: insuranceClaim.id,
        claimType: insuranceClaim.claimType,
        incidentDate: insuranceClaim.incidentDate,
        claimedAmount: insuranceClaim.claimedAmount,
        priorityLevel: insuranceClaim.priorityLevel,
        estimatedDamage: insuranceClaim.estimatedDamage,
      })
      .from(insuranceClaim)
      .where(and(
        eq(insuranceClaim.incidentCity, city),
        timeframe === 'all' ? sql`1=1` : and(
          gte(insuranceClaim.incidentDate, timeFilter.startDate),
          lte(insuranceClaim.incidentDate, timeFilter.endDate)
        )
      ))
      .orderBy(desc(insuranceClaim.incidentDate));

    // Calculate basic statistics
    const totalClaims = claims.length;
    
    // Calculate fraud rate (claims with high priority or risk)
    const fraudClaims = claims.filter(claim => 
      claim.priorityLevel === 'HIGH' || 
      claim.priorityLevel === 'URGENT'
    );
    const fraudRate = totalClaims > 0 ? (fraudClaims.length / totalClaims) * 100 : 0;

    // Calculate average risk score
    const avgRiskScore = totalClaims > 0 
      ? claims.reduce((sum, claim) => sum + calculateRiskScore(claim.priorityLevel), 0) / totalClaims 
      : 0;

    // Calculate total amount
    const totalAmount = claims.reduce((sum, claim) => 
      sum + parseFloat(claim.claimedAmount.toString()), 0
    );

    // Calculate claims by type
    const claimsByTypeMap = new Map<string, number>();
    claims.forEach(claim => {
      const type = claim.claimType || 'OTHER';
      claimsByTypeMap.set(type, (claimsByTypeMap.get(type) || 0) + 1);
    });

    const claimsByType = Array.from(claimsByTypeMap.entries())
      .map(([type, count]) => ({
        type: getTypeLabel(type),
        count,
        percentage: totalClaims > 0 ? count / totalClaims : 0
      }));

    // Calculate risk distribution by category
    const riskByCategoryMap = new Map<string, { total: number; sum: number }>();
    claims.forEach(claim => {
      const riskScore = calculateRiskScore(claim.priorityLevel);
      const category = getRiskCategory(riskScore);
      
      if (!riskByCategoryMap.has(category)) {
        riskByCategoryMap.set(category, { total: 0, sum: 0 });
      }
      const data = riskByCategoryMap.get(category)!;
      data.total += 1;
      data.sum += riskScore;
    });

    const riskByCategory = Array.from(riskByCategoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.total,
        avgScore: data.total > 0 ? data.sum / data.total : 0
      }));

    // Get recent claims (last 5)
    const recentClaims = claims.slice(0, 5).map(claim => ({
      id: claim.id,
      claimType: getTypeLabel(claim.claimType),
      incidentDate: claim.incidentDate,
      claimedAmount: claim.claimedAmount,
      priorityLevel: claim.priorityLevel || 'UNKNOWN'
    }));

    const cityDetails: CityDetails = {
      totalClaims,
      fraudRate: Math.round(fraudRate * 10) / 10,
      avgRiskScore: Math.round(avgRiskScore * 10) / 10,
      totalAmount: Math.round(totalAmount),
      claimsByType,
      riskByCategory,
      recentClaims
    };

    return NextResponse.json({ 
      success: true, 
      data: cityDetails,
      city,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating city details:', error);
    return NextResponse.json(
      { error: 'Failed to generate city details' },
      { status: 500 }
    );
  }
}

function getTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    'COLLISION': 'Collisione',
    'THEFT': 'Furto',
    'VANDALISM': 'Vandalismo',
    'NATURAL_DISASTER': 'Evento Naturale',
    'OTHER': 'Altro'
  };
  return typeLabels[type] || type;
}