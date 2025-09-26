import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql } from 'drizzle-orm';

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  total: number;
  categories: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    // Get all claims with risk scores
    const claims = await db
      .select({
        riskScore: sql<number>`CASE 
          WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
          WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
          WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
          WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
          ELSE 50
        END`,
      })
      .from(insuranceClaim);

    // Calculate risk distribution
    const low = claims.filter(claim => claim.riskScore <= 30).length;
    const medium = claims.filter(claim => claim.riskScore > 30 && claim.riskScore <= 70).length;
    const high = claims.filter(claim => claim.riskScore > 70).length;
    const total = claims.length;

    // Calculate percentages
    const lowPercentage = total > 0 ? (low / total) * 100 : 0;
    const mediumPercentage = total > 0 ? (medium / total) * 100 : 0;
    const highPercentage = total > 0 ? (high / total) * 100 : 0;

    const riskDistribution: RiskDistribution = {
      low,
      medium,
      high,
      total,
      categories: [
        {
          name: 'Basso Rischio',
          value: low,
          percentage: lowPercentage,
          color: '#10B981' // green-500
        },
        {
          name: 'Medio Rischio',
          value: medium,
          percentage: mediumPercentage,
          color: '#F59E0B' // yellow-500
        },
        {
          name: 'Alto Rischio',
          value: high,
          percentage: highPercentage,
          color: '#EF4444' // red-500
        }
      ]
    };

    return NextResponse.json({ 
      success: true, 
      data: riskDistribution,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating risk distribution:', error);
    return NextResponse.json(
      { error: 'Failed to generate risk distribution data' },
      { status: 500 }
    );
  }
}