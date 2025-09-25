import { NextResponse } from 'next/server';
import { countExistingClaims } from '@/lib/synthetic-data-generator';

export async function GET() {
  try {
    const count = await countExistingClaims();
    
    return NextResponse.json({ 
      success: true, 
      count 
    });
  } catch (error) {
    console.error('Error counting existing claims:', error);
    return NextResponse.json(
      { error: 'Failed to count existing claims' },
      { status: 500 }
    );
  }
}