import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql, and, gte, lte, desc } from 'drizzle-orm';

interface TimeFilter {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsStats {
  kpis: {
    totalClaims: number;
    fraudDetectionRate: number;
    avgRiskScore: number;
    investigationEfficiency: number;
    costSavings: number;
  };
  trends: {
    claimsByMonth: Array<{ month: string; claims: number; fraud: number }>;
    riskDistribution: Array<{ category: string; count: number; percentage: number }>;
    topFraudPatterns: Array<{ pattern: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  };
  geographical: Array<{
    city: string;
    claims: number;
    fraudRate: number;
    riskScore: number;
  }>;
}

function getTimeFilter(timeframe: string): TimeFilter {
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
    case 'all': // Add option for all data
      // Go back 2 years to include all synthetic data
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      // Set to beginning of day to include all possible synthetic data
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

function getMonthName(date: Date): string {
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return months[date.getMonth()];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';

    const timeFilter = getTimeFilter(timeframe);

    // Get all claims within time period
    const claims = await db
      .select({
        id: insuranceClaim.id,
        incidentDate: insuranceClaim.incidentDate,
        claimedAmount: insuranceClaim.claimedAmount,
        claimType: insuranceClaim.claimType,
        claimStatus: insuranceClaim.claimStatus,
        priorityLevel: insuranceClaim.priorityLevel,
        incidentCity: insuranceClaim.incidentCity,
        incidentProvince: insuranceClaim.incidentProvince,
        // Use riskScore from claim if available, otherwise calculate based on priority
        riskScore: sql<number>`CASE 
          WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
          WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
          WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
          WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
          ELSE 50
        END`,
        // Calculate fraud score based on claim characteristics
        fraudScore: sql<number>`CASE 
          WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 75
          WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 90
          WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 45
          WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 15
          ELSE 30
        END`,
      })
      .from(insuranceClaim)
      .where(timeframe === 'all' ? sql`1=1` : and(
        gte(insuranceClaim.incidentDate, timeFilter.startDate),
        lte(insuranceClaim.incidentDate, timeFilter.endDate)
      ))
      .orderBy(desc(insuranceClaim.incidentDate));

    // Calculate basic statistics
    const totalClaims = claims.length;
    
    // Calculate fraud detection rate (claims with fraudScore > 70 or high risk)
    const fraudClaims = claims.filter(claim => 
      (claim.fraudScore > 70) || 
      (claim.riskScore > 70) ||
      (claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT')
    );
    const fraudDetectionRate = totalClaims > 0 ? (fraudClaims.length / totalClaims) * 100 : 0;

    // Calculate average risk score
    const avgRiskScore = totalClaims > 0 
      ? claims.reduce((sum, claim) => sum + claim.riskScore, 0) / totalClaims 
      : 0;

    // Calculate year-over-year comparison (last 12 months vs previous 12 months)
    let yearOverYearChange = 0;
    let yearOverYearPeriod = "";
    let fraudYearOverYearChange = 0;
    let efficiencyYearOverYearChange = 0;
    let costSavingsYearOverYearChange = 0;
    
    if (timeframe === '1y' || timeframe === 'all') {
      const now = new Date();
      
      // Get claims for last 12 months
      const last12MonthsClaims = await db
        .select({
          id: insuranceClaim.id,
          priorityLevel: insuranceClaim.priorityLevel,
          claimedAmount: insuranceClaim.claimedAmount,
          fraudScore: sql<number>`CASE 
            WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 75
            WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 90
            WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 45
            WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 15
            ELSE 30
          END`,
          riskScore: sql<number>`CASE 
            WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
            WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
            WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
            WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
            ELSE 50
          END`
        })
        .from(insuranceClaim)
        .where(gte(insuranceClaim.incidentDate, new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())));
      
      // Get claims for previous 12 months
      const previous12MonthsClaims = await db
        .select({
          id: insuranceClaim.id,
          priorityLevel: insuranceClaim.priorityLevel,
          claimedAmount: insuranceClaim.claimedAmount,
          fraudScore: sql<number>`CASE 
            WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 75
            WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 90
            WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 45
            WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 15
            ELSE 30
          END`,
          riskScore: sql<number>`CASE 
            WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
            WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
            WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
            WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
            ELSE 50
          END`
        })
        .from(insuranceClaim)
        .where(and(
          gte(insuranceClaim.incidentDate, new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())),
          lte(insuranceClaim.incidentDate, new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() - 1))
        ));
      
      // Calculate total claims year-over-year
      const currentCount = last12MonthsClaims.length;
      const previousCount = previous12MonthsClaims.length;
      
      if (previousCount > 0) {
        yearOverYearChange = ((currentCount - previousCount) / previousCount) * 100;
        yearOverYearPeriod = "ultimi 12 mesi";
      } else if (currentCount > 0) {
        yearOverYearChange = 100; // First year with data
        yearOverYearPeriod = "ultimi 12 mesi";
      }
      
      // Calculate fraud detection rate year-over-year
      const currentFraudClaims = last12MonthsClaims.filter(claim => 
        (claim.fraudScore > 70) || 
        (claim.riskScore > 70) ||
        (claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT')
      );
      
      const previousFraudClaims = previous12MonthsClaims.filter(claim => 
        (claim.fraudScore > 70) || 
        (claim.riskScore > 70) ||
        (claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT')
      );
      
      const currentFraudRate = currentCount > 0 ? (currentFraudClaims.length / currentCount) * 100 : 0;
      const previousFraudRate = previousCount > 0 ? (previousFraudClaims.length / previousCount) * 100 : 0;
      
      if (previousFraudRate > 0) {
        fraudYearOverYearChange = ((currentFraudRate - previousFraudRate) / previousFraudRate) * 100;
      } else if (currentFraudRate > 0) {
        fraudYearOverYearChange = 100; // First year with fraud data
      }
      
      // Calculate investigation efficiency year-over-year (mock data with realistic variation)
      const currentEfficiency = 85 + (Math.random() * 10 - 5); // 80-90% range
      const previousEfficiency = 82 + (Math.random() * 10 - 5); // 77-87% range (slightly lower baseline)
      
      if (previousEfficiency > 0) {
        efficiencyYearOverYearChange = ((currentEfficiency - previousEfficiency) / previousEfficiency) * 100;
      } else if (currentEfficiency > 0) {
        efficiencyYearOverYearChange = 100; // First year with efficiency data
      }
      
      // Calculate cost savings year-over-year based on fraudulent claims
      const currentFraudulentAmount = currentFraudClaims.reduce((sum, claim) => {
        return sum + parseFloat(claim.claimedAmount?.toString() || '0');
      }, 0);
      const currentCostSavings = currentFraudulentAmount * 0.2; // 20% savings rate
      
      const previousFraudulentAmount = previousFraudClaims.reduce((sum, claim) => {
        return sum + parseFloat(claim.claimedAmount?.toString() || '0');
      }, 0);
      const previousCostSavings = previousFraudulentAmount * 0.2; // 20% savings rate
      
      if (previousCostSavings > 0) {
        costSavingsYearOverYearChange = ((currentCostSavings - previousCostSavings) / previousCostSavings) * 100;
      } else if (currentCostSavings > 0) {
        costSavingsYearOverYearChange = 100; // First year with cost savings data
      }
    }

    // Calculate investigation efficiency (mock - assumes 85% base efficiency)
    const investigationEfficiency = 85 + (Math.random() * 10 - 5); // 80-90% range

    // Calculate cost savings (estimated 15-25% of total fraudulent claim amounts)
    const fraudulentAmount = fraudClaims.reduce((sum, claim) => sum + parseFloat(claim.claimedAmount.toString()), 0);
    const costSavings = fraudulentAmount * 0.2; // 20% savings rate

    // Determine how many months to show based on timeframe
    let monthsToShow = 7; // default
    switch (timeframe) {
      case '7d':
        monthsToShow = 1; // Show current month only for 7 days
        break;
      case '30d':
        monthsToShow = 2; // Show 2 months for 30 days
        break;
      case '90d':
        monthsToShow = 4; // Show 4 months for 90 days
        break;
      case '1y':
        monthsToShow = 12; // Show 12 months for 1 year
        break;
      case 'all':
        monthsToShow = 24; // Show 24 months (2 years) for all data
        break;
    }

    // Generate monthly trends with guaranteed month count
    const monthlyData = new Map<string, { claims: number; fraud: number }>();
    
    // First, collect all actual claims data with year-month key
    claims.forEach(claim => {
      const claimDate = new Date(claim.incidentDate);
      const monthKey = `${claimDate.getFullYear()}-${getMonthName(claimDate)}`;
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { claims: 0, fraud: 0 });
      }
      const data = monthlyData.get(monthKey)!;
      data.claims++;
      if (fraudClaims.includes(claim)) {
        data.fraud++;
      }
    });

    // Generate month names for the required period
    const now = new Date();
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const claimsByMonth = [];

    // Generate the last N months in chronological order
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const monthKey = `${year}-${monthName}`;
      const existingData = monthlyData.get(monthKey);
      
      // Include year in month label but keep it short for better display
      const monthLabel = timeframe === 'all' ? `${monthName}${year.toString().slice(-2)}` : monthName;
      
      claimsByMonth.push({
        month: monthLabel,
        claims: existingData?.claims || 0,
        fraud: existingData?.fraud || 0
      });
    }

    // Calculate risk distribution
    const riskDistribution = new Map<string, number>();
    claims.forEach(claim => {
      const category = getRiskCategory(claim.riskScore);
      riskDistribution.set(category, (riskDistribution.get(category) || 0) + 1);
    });

    const riskDistributionArray = Array.from(riskDistribution.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalClaims > 0 ? (count / totalClaims) * 100 : 0
      }));

    // Generate fraud patterns (mock data based on claim characteristics)
    const patterns = new Map<string, number>();
    claims.forEach(claim => {
      // Night time incidents (22:00 - 06:00)
      if (claim.incidentDate.getHours() >= 22 || claim.incidentDate.getHours() <= 6) {
        patterns.set('Orari notturni', (patterns.get('Orari notturni') || 0) + 1);
      }
      
      // High value claims
      if (parseFloat(claim.claimedAmount.toString()) > 10000) {
        patterns.set('Importi elevati', (patterns.get('Importi elevati') || 0) + 1);
      }
      
      // Theft claims
      if (claim.claimType === 'THEFT') {
        patterns.set('Furto veicolo', (patterns.get('Furto veicolo') || 0) + 1);
      }
      
      // High risk cities
      const highRiskCities = ['Napoli', 'Palermo', 'Catania', 'Bari'];
      if (highRiskCities.includes(claim.incidentCity)) {
        patterns.set('Aree ad alto rischio', (patterns.get('Aree ad alto rischio') || 0) + 1);
      }
    });

    const topFraudPatterns = Array.from(patterns.entries())
      .map(([pattern, count]) => ({
        pattern,
        count,
        trend: (Math.random() > 0.5 ? 'up' : Math.random() > 0.25 ? 'stable' : 'down') as 'up' | 'down' | 'stable'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate geographical distribution
    const geoData = new Map<string, { claims: number; totalRisk: number; fraudCount: number }>();
    claims.forEach(claim => {
      const city = claim.incidentCity;
      if (!geoData.has(city)) {
        geoData.set(city, { claims: 0, totalRisk: 0, fraudCount: 0 });
      }
      const data = geoData.get(city)!;
      data.claims++;
      data.totalRisk += claim.riskScore;
      if (fraudClaims.includes(claim)) {
        data.fraudCount++;
      }
    });

    const geographical = Array.from(geoData.entries())
      .map(([city, data]) => ({
        city,
        claims: data.claims,
        fraudRate: data.claims > 0 ? (data.fraudCount / data.claims) * 100 : 0,
        riskScore: data.claims > 0 ? data.totalRisk / data.claims : 0
      }))
      .sort((a, b) => b.claims - a.claims)
      .slice(0, 10);

    const analyticsData: AnalyticsStats = {
      kpis: {
        totalClaims,
        fraudDetectionRate: Math.round(fraudDetectionRate * 10) / 10,
        avgRiskScore: Math.round(avgRiskScore * 10) / 10,
        investigationEfficiency: Math.round(investigationEfficiency * 10) / 10,
        costSavings: Math.round(costSavings)
      },
      trends: {
        claimsByMonth,
        riskDistribution: riskDistributionArray,
        topFraudPatterns
      },
      geographical
    };

    return NextResponse.json({ 
      success: true, 
      data: analyticsData,
      timeframe,
      totalClaims,
      yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
      yearOverYearPeriod,
      fraudYearOverYearChange: Math.round(fraudYearOverYearChange * 10) / 10,
      efficiencyYearOverYearChange: Math.round(efficiencyYearOverYearChange * 10) / 10,
      costSavingsYearOverYearChange: Math.round(costSavingsYearOverYearChange * 10) / 10,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating analytics stats:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics statistics' },
      { status: 500 }
    );
  }
}