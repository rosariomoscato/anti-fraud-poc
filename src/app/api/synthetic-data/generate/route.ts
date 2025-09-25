import { NextRequest, NextResponse } from 'next/server';
import { generateAndInsertClaims, countExistingClaims } from '@/lib/synthetic-data-generator';

export async function POST(request: NextRequest) {
  try {
    const { count = 100, fraudPercentage = 15, clearExisting = true } = await request.json();
    
    if (typeof count !== 'number' || count < 1 || count > 10000) {
      return NextResponse.json(
        { error: 'Count must be a number between 1 and 10000' },
        { status: 400 }
      );
    }
    
    if (typeof fraudPercentage !== 'number' || fraudPercentage < 0 || fraudPercentage > 100) {
      return NextResponse.json(
        { error: 'Fraud percentage must be a number between 0 and 100' },
        { status: 400 }
      );
    }
    
    if (typeof clearExisting !== 'boolean') {
      return NextResponse.json(
        { error: 'Clear existing must be a boolean' },
        { status: 400 }
      );
    }

    // Check existing data before generation
    const existingCount = await countExistingClaims();
    
    const result = await generateAndInsertClaims(count, fraudPercentage, clearExisting);
    
    const expectedFraudCount = Math.round(count * fraudPercentage / 100);
    
    // Build response message based on what happened
    let message = `Generati con successo ${count} sinistri sintetici con ${fraudPercentage}% di frode`;
    
    if (clearExisting && result.deletedClaims && result.deletedClaims > 0) {
      message += ` (cancellati ${result.deletedClaims} sinistri esistenti, ${result.deletedAssessments} valutazioni, ${result.deletedDetections} rilevamenti)`;
    } else if (existingCount > 0 && !clearExisting) {
      message += ` (mantenuti ${existingCount} sinistri esistenti)`;
    }
    
    return NextResponse.json({ 
      success: true, 
      message,
      count: result.generatedClaims,
      fraudPercentage,
      expectedFraudCount,
      existingCount,
      deletedClaims: result.deletedClaims,
      deletedAssessments: result.deletedAssessments,
      deletedDetections: result.deletedDetections,
      clearExisting
    });
  } catch (error) {
    console.error('Error generating synthetic claims:', error);
    return NextResponse.json(
      { error: 'Failed to generate synthetic claims' },
      { status: 500 }
    );
  }
}