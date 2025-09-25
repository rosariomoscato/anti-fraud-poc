import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql, and, gte, lte, desc, or, ilike, eq } from 'drizzle-orm';

interface CaseItem {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimType: string;
  claimedAmount: number;
  incidentDate: Date;
  incidentCity: string;
  claimStatus: string | null;
  priorityLevel: string | null;
  riskScore: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const risk = searchParams.get('risk') || 'all';
    const sort = searchParams.get('sort') || 'incidentDate';
    const order = searchParams.get('order') || 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    // Search condition
    if (search) {
      conditions.push(
        or(
          ilike(insuranceClaim.claimantName, `%${search}%`),
          ilike(insuranceClaim.claimNumber, `%${search}%`),
          ilike(insuranceClaim.vehicleLicensePlate, `%${search}%`),
          ilike(insuranceClaim.incidentCity, `%${search}%`)
        )
      );
    }

    // Status filter
    if (status !== 'all') {
      conditions.push(eq(insuranceClaim.claimStatus, status));
    }

    // Type filter
    if (type !== 'all') {
      conditions.push(eq(insuranceClaim.claimType, type));
    }

    // Risk filter
    if (risk !== 'all') {
      switch (risk) {
        case 'HIGH':
          conditions.push(
            or(
              eq(insuranceClaim.priorityLevel, 'HIGH'),
              eq(insuranceClaim.priorityLevel, 'URGENT')
            )
          );
          break;
        case 'MEDIUM':
          conditions.push(eq(insuranceClaim.priorityLevel, 'MEDIUM'));
          break;
        case 'LOW':
          conditions.push(eq(insuranceClaim.priorityLevel, 'LOW'));
          break;
        case 'URGENT':
          conditions.push(eq(insuranceClaim.priorityLevel, 'URGENT'));
          break;
      }
    }

    // Build the query
    const whereCondition = conditions.length > 0 ? and(...conditions) : sql`1=1`;

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(insuranceClaim)
      .where(whereCondition);

    const total = countResult[0]?.count || 0;

    // Get cases with sorting
    const cases = await db
      .select({
        id: insuranceClaim.id,
        claimNumber: insuranceClaim.claimNumber,
        claimantName: insuranceClaim.claimantName,
        claimType: insuranceClaim.claimType,
        claimedAmount: insuranceClaim.claimedAmount,
        incidentDate: insuranceClaim.incidentDate,
        incidentCity: insuranceClaim.incidentCity,
        claimStatus: insuranceClaim.claimStatus,
        priorityLevel: insuranceClaim.priorityLevel,
        riskScore: sql<number>`CASE 
          WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
          WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
          WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
          WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
          ELSE 50
        END`
      })
      .from(insuranceClaim)
      .where(whereCondition)
      .orderBy(
        order === 'asc' 
          ? sort === 'incidentDate' ? asc(insuranceClaim.incidentDate)
            : sort === 'claimedAmount' ? asc(insuranceClaim.claimedAmount)
            : sort === 'riskScore' ? asc(sql`CASE 
                WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
                WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
                WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
                WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
                ELSE 50
              END`)
            : asc(insuranceClaim.incidentDate)
          : sort === 'incidentDate' ? desc(insuranceClaim.incidentDate)
            : sort === 'claimedAmount' ? desc(insuranceClaim.claimedAmount)
            : sort === 'riskScore' ? desc(sql`CASE 
                WHEN ${insuranceClaim.priorityLevel} = 'URGENT' THEN 95
                WHEN ${insuranceClaim.priorityLevel} = 'HIGH' THEN 85
                WHEN ${insuranceClaim.priorityLevel} = 'MEDIUM' THEN 55
                WHEN ${insuranceClaim.priorityLevel} = 'LOW' THEN 25
                ELSE 50
              END`)
            : desc(insuranceClaim.incidentDate)
      )
      .limit(limit)
      .offset(offset);

    // Transform the data for the frontend
    const transformedCases: CaseItem[] = cases.map(item => ({
      ...item,
      claimedAmount: parseFloat(item.claimedAmount.toString()),
      riskScore: Math.round(item.riskScore)
    }));

    return NextResponse.json({
      success: true,
      data: {
        cases: transformedCases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

// Helper function for ascending sort
function asc(column: any) {
  return column;
}