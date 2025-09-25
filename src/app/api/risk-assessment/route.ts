import { NextRequest, NextResponse } from 'next/server';
import { RiskScoringEngine } from '@/lib/risk-scoring-engine';

export async function POST(request: NextRequest) {
  try {
    const { claimIds } = await request.json();
    
    if (!Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json(
        { error: 'claimIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (claimIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 claimIds per request' },
        { status: 400 }
      );
    }

    const engine = RiskScoringEngine.getInstance();
    const results = await engine.batchRiskAssessment(claimIds);
    
    return NextResponse.json({ 
      success: true, 
      assessments: Object.fromEntries(results),
      modelMetrics: engine.getModelMetrics()
    });
  } catch (error) {
    console.error('Error in risk assessment:', error);
    return NextResponse.json(
      { error: 'Failed to perform risk assessment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const engine = RiskScoringEngine.getInstance();
    const metrics = engine.getModelMetrics();
    
    return NextResponse.json({ 
      success: true, 
      modelMetrics: metrics,
      endpoint: '/api/risk-assessment',
      description: 'Risk Scoring Engine for fraud detection'
    });
  } catch (error) {
    console.error('Error getting model metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get model metrics' },
      { status: 500 }
    );
  }
}