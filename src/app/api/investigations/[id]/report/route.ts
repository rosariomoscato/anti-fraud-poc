import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface InvestigationReport {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimantEmail?: string;
  claimantPhone?: string;
  claimType: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDescription: string;
  riskScore: number;
  status: string;
  priority: string;
  assignedTo?: string;
  estimatedAmount: number;
  fraudIndicators: string[];
  lastUpdated: string;
  claimStatus: string;
  createdAt: string;
  investigationNotes?: string[];
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

function getInvestigationStatus(claim: any): string {
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const isHighRisk = claim.priorityLevel === 'HIGH' || claim.priorityLevel === 'URGENT';
  
  if (claim.claimStatus === 'APPROVED') return 'COMPLETED';
  if (claim.claimStatus === 'REJECTED') return 'CLOSED';
  if (claim.claimStatus === 'UNDER_INVESTIGATION') return 'IN_PROGRESS';
  if (riskScore > 70) return 'OPEN';
  if (isHighRisk) return 'UNDER_REVIEW';
  return 'OPEN';
}

function getInvestigationPriority(claim: any): string {
  if (claim.priorityLevel === 'URGENT') return 'URGENT';
  if (claim.priorityLevel === 'HIGH') return 'HIGH';
  if (claim.priorityLevel === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

function generateFraudIndicators(claim: any): string[] {
  const indicators: string[] = [];
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const amount = parseFloat(claim.claimedAmount?.toString() || '0');
  
  if (riskScore > 80) indicators.push('Alto rischio frode');
  if (amount > 15000) indicators.push('Importo elevato');
  if (claim.priorityLevel === 'URGENT') indicators.push('Tempestività sospetta');
  if (claim.claimType === 'THEFT') indicators.push('Furto - area ad alto rischio');
  if (claim.claimStatus === 'UNDER_INVESTIGATION') indicators.push('Sotto indagine');
  
  return indicators;
}

function generateInvestigationNotes(claim: any): string[] {
  const notes: string[] = [];
  const riskScore = calculateRiskScore(claim.priorityLevel);
  const status = getInvestigationStatus(claim);
  
  notes.push(`Valutazione rischio iniziale: ${riskScore}/100`);
  
  if (riskScore > 70) {
    notes.push('Richiesta verifica documenti aggiuntivi');
    notes.push('Analisi approfondita raccomandata');
  }
  
  if (status === 'IN_PROGRESS') {
    notes.push('Indagine in corso - attendere aggiornamenti');
  }
  
  if (claim.priorityLevel === 'URGENT') {
    notes.push('Caso urgente - priorità alta');
  }
  
  return notes;
}

function generateHTMLReport(investigation: InvestigationReport): string {
  const timestamp = new Date().toLocaleString('it-IT');
  const riskLevel = investigation.riskScore > 70 ? 'Alto' : investigation.riskScore > 50 ? 'Medio' : 'Basso';
  const riskColor = investigation.riskScore > 70 ? '#dc2626' : investigation.riskScore > 50 ? '#f59e0b' : '#16a34a';
  
  return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Indagine - ${investigation.claimNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
            color: #334155;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
        }
        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 2rem;
        }
        .section {
            margin-bottom: 2rem;
        }
        .section h2 {
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .info-item {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .info-item label {
            font-weight: 600;
            color: #475569;
            display: block;
            margin-bottom: 0.25rem;
        }
        .risk-score {
            background: ${riskColor}20;
            border: 2px solid ${riskColor};
            color: ${riskColor};
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin: 1rem 0;
        }
        .risk-score .score {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
        }
        .risk-score .level {
            font-size: 0.875rem;
            opacity: 0.8;
            margin: 0;
        }
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-open { background: #fef2f2; color: #dc2626; }
        .status-in_progress { background: #eff6ff; color: #2563eb; }
        .status-under_review { background: #fffbeb; color: #d97706; }
        .status-completed { background: #f0fdf4; color: #16a34a; }
        .status-closed { background: #f8fafc; color: #64748b; }
        .fraud-indicators {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .fraud-indicator {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        .notes {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #8b5cf6;
        }
        .notes ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        .notes li {
            margin-bottom: 0.5rem;
        }
        .footer {
            background: #f8fafc;
            padding: 1rem 2rem;
            text-align: center;
            color: #64748b;
            font-size: 0.875rem;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Report Indagine Anti-Frode</h1>
            <p>${investigation.claimNumber}</p>
            <p>Generato il ${timestamp}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Informazioni di Base</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Numero Sinistro</label>
                        <div><strong>${investigation.claimNumber}</strong></div>
                    </div>
                    <div class="info-item">
                        <label>Richiedente</label>
                        <div><strong>${investigation.claimantName}</strong></div>
                        ${investigation.claimantEmail ? `<div style="font-size: 0.875rem;">${investigation.claimantEmail}</div>` : ''}
                        ${investigation.claimantPhone ? `<div style="font-size: 0.875rem;">${investigation.claimantPhone}</div>` : ''}
                    </div>
                    <div class="info-item">
                        <label>Tipo Sinistro</label>
                        <div><strong>${investigation.claimType}</strong></div>
                    </div>
                    <div class="info-item">
                        <label>Data Incidente</label>
                        <div><strong>${investigation.incidentDate}</strong></div>
                    </div>
                    <div class="info-item">
                        <label>Luogo Incidente</label>
                        <div><strong>${investigation.incidentLocation}</strong></div>
                    </div>
                    <div class="info-item">
                        <label>Importo Stimato</label>
                        <div><strong>€${investigation.estimatedAmount.toLocaleString()}</strong></div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Stato e Priorità</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Stato Indagine</label>
                        <div><span class="status-badge status-${investigation.status.toLowerCase()}">${investigation.status.replace('_', ' ')}</span></div>
                    </div>
                    <div class="info-item">
                        <label>Priorità</label>
                        <div><strong>${investigation.priority}</strong></div>
                    </div>
                    ${investigation.assignedTo ? `
                    <div class="info-item">
                        <label>Assegnato a</label>
                        <div><strong>${investigation.assignedTo}</strong></div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="section">
                <h2>Valutazione del Rischio</h2>
                <div class="risk-score">
                    <p class="score">${investigation.riskScore}/100</p>
                    <p class="level">Rischio ${riskLevel}</p>
                </div>
                <div>
                    <label>Indicatori di Frode:</label>
                    <div class="fraud-indicators">
                        ${investigation.fraudIndicators.map(indicator => 
                            `<span class="fraud-indicator">${indicator}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Descrizione Incidente</h2>
                <div class="info-item">
                    <div>${investigation.incidentDescription}</div>
                </div>
            </div>

            ${investigation.investigationNotes && investigation.investigationNotes.length > 0 ? `
            <div class="section">
                <h2>Note Investigative</h2>
                <div class="notes">
                    <ul>
                        ${investigation.investigationNotes.map(note => 
                            `<li>${note}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h2>Timeline</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Data Creazione</label>
                        <div><strong>${investigation.createdAt}</strong></div>
                    </div>
                    <div class="info-item">
                        <label>Ultimo Aggiornamento</label>
                        <div><strong>${investigation.lastUpdated}</strong></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Report generato automaticamente dal sistema anti-frode<br>
            Sistema di Gestione Indagini - © 2024
        </div>
    </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'html';
    const assignedTo = searchParams.get('assignedTo');
    
    // Fetch the specific claim by ID
    const claim = await db
      .select()
      .from(insuranceClaim)
      .where(eq(insuranceClaim.id, id))
      .limit(1);

    if (claim.length === 0) {
      return NextResponse.json(
        { error: 'Investigation not found' },
        { status: 404 }
      );
    }

    const claimData = claim[0];
    const riskScore = calculateRiskScore(claimData.priorityLevel);
    const status = getInvestigationStatus(claimData);
    const priority = getInvestigationPriority(claimData);

    // Transform claim to investigation report data
    const investigation: InvestigationReport = {
      id: claimData.id,
      claimNumber: claimData.claimNumber || `CLM-${claimData.id}`,
      claimantName: claimData.claimantName || 'Unknown',
      claimantEmail: claimData.claimantEmail || undefined,
      claimantPhone: claimData.claimantPhone || undefined,
      claimType: claimData.claimType || 'UNKNOWN',
      incidentDate: claimData.incidentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      incidentLocation: claimData.incidentLocation || 'Da specificare',
      incidentDescription: claimData.claimDescription || 'Descrizione non disponibile',
      riskScore,
      status,
      priority,
      assignedTo: assignedTo || (status === 'IN_PROGRESS' ? 'Da assegnare' : undefined),
      estimatedAmount: parseFloat(claimData.claimedAmount?.toString() || '0'),
      fraudIndicators: generateFraudIndicators(claimData),
      lastUpdated: new Date(claimData.updatedAt).toLocaleDateString('it-IT'),
      claimStatus: claimData.claimStatus || 'PENDING',
      createdAt: new Date(claimData.createdAt).toLocaleDateString('it-IT'),
      investigationNotes: generateInvestigationNotes(claimData)
    };

    switch (format) {
      case 'html':
        const htmlContent = generateHTMLReport(investigation);
        return new NextResponse(htmlContent, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="investigation-${investigation.claimNumber}-report.html"`
          }
        });

      case 'json':
        return new NextResponse(JSON.stringify(investigation, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="investigation-${investigation.claimNumber}-report.json"`
          }
        });

      case 'csv':
        const csvHeaders = [
          'ID', 'Claim Number', 'Claimant Name', 'Claim Type', 'Incident Date',
          'Incident Location', 'Risk Score', 'Status', 'Priority', 'Assigned To',
          'Estimated Amount', 'Claim Status', 'Created At', 'Last Updated'
        ];
        
        const csvRow = [
          investigation.id,
          investigation.claimNumber,
          investigation.claimantName,
          investigation.claimType,
          investigation.incidentDate,
          investigation.incidentLocation,
          investigation.riskScore,
          investigation.status,
          investigation.priority,
          investigation.assignedTo || '',
          investigation.estimatedAmount,
          investigation.claimStatus,
          investigation.createdAt,
          investigation.lastUpdated
        ];

        const csvContent = [
          csvHeaders.join(','),
          csvRow.map(field => `"${field}"`).join(',')
        ].join('\n');

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="investigation-${investigation.claimNumber}-report.csv"`
          }
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error generating investigation report:', error);
    return NextResponse.json(
      { error: 'Failed to generate investigation report' },
      { status: 500 }
    );
  }
}