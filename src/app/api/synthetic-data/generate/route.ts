import { NextRequest, NextResponse } from 'next/server';
import { generateAndInsertClaims } from '@/lib/synthetic-data-generator';

export async function POST(request: NextRequest) {
  try {
    const { count = 100 } = await request.json();
    
    if (typeof count !== 'number' || count < 1 || count > 10000) {
      return NextResponse.json(
        { error: 'Count must be a number between 1 and 10000' },
        { status: 400 }
      );
    }

    await generateAndInsertClaims(count);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully generated and inserted ${count} synthetic claims`,
      count 
    });
  } catch (error) {
    console.error('Error generating synthetic claims:', error);
    return NextResponse.json(
      { error: 'Failed to generate synthetic claims' },
      { status: 500 }
    );
  }
}