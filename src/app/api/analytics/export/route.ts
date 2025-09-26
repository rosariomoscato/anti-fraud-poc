import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';
import { sql, and, gte, lte, or, ilike, desc } from 'drizzle-orm';

interface ExportContext {
  tab: string;
  timeframe: string;
  filters: {
    search?: string;
    riskLevel?: string;
    pattern?: string;
    fraudType?: string;
    startDate?: string;
    endDate?: string;
  };
  patternAnalysis?: {
    selectedPatterns?: string[];
  };
}

interface ExportRequest {
  format: 'csv' | 'json' | 'pdf';
  context: ExportContext;
}

function generateCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

function generateHTMLReport(data: any[], context: ExportContext, title: string): string {
  const timestamp = new Date().toLocaleString('it-IT');
  
  let html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Anti-Frode - ${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .title {
            color: #1e40af;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            background-color: #f3f4f6;
            padding: 10px 15px;
            font-weight: bold;
            color: #374151;
            border-left: 4px solid #2563eb;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #374151;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .summary {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin-bottom: 20px;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .badge-high { background-color: #fee2e2; color: #dc2626; }
        .badge-medium { background-color: #fef3c7; color: #d97706; }
        .badge-low { background-color: #dcfce7; color: #16a34a; }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Report Anti-Frode</div>
        <div class="subtitle">${title.replace('-', ' ').toUpperCase()}</div>
        <div class="subtitle">Generato il: ${timestamp}</div>
        <div class="subtitle">Periodo: ${context.timeframe === '7d' ? 'Ultimi 7 giorni' : 
                                context.timeframe === '30d' ? 'Ultimi 30 giorni' :
                                context.timeframe === '90d' ? 'Ultimi 90 giorni' :
                                context.timeframe === '1y' ? 'Ultimo anno' : 'Tutto il periodo'}</div>
    </div>

    <div class="summary">
        <strong>Riepilogo:</strong><br>
        • Totale record: ${data.length}<br>
        • Format: Report PDF<br>
        • Tab: ${context.tab}
    </div>
`;

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const displayHeaders = headers.map(header => {
      const headerMap: Record<string, string> = {
        'id': 'ID',
        'claimNumber': 'Numero Sinistro',
        'claimantName': 'Richiedente',
        'claimType': 'Tipo Sinistro',
        'priorityLevel': 'Priorità',
        'claimStatus': 'Stato',
        'incidentDate': 'Data Incidente',
        'claimedAmount': 'Importo Richiesto',
        'createdAt': 'Data Creazione',
        'updatedAt': 'Ultimo Aggiornamento',
        'riskScore': 'Punteggio Rischio',
        'fraudDetected': 'Frode Rilevata',
        'amount': 'Importo',
        'patterns': 'Pattern'
      };
      return headerMap[header] || header;
    });

    html += `
    <div class="section">
        <div class="section-title">Dati Dettagliati</div>
        <table>
            <thead>
                <tr>
    `;
    
    displayHeaders.forEach(header => {
      html += `<th>${header}</th>`;
    });
    
    html += `
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(row => {
      html += '<tr>';
      headers.forEach(header => {
        let value = row[header];
        
        if (value === null || value === undefined) {
          value = '-';
        } else if (typeof value === 'boolean') {
          value = value ? 'Sì' : 'No';
        } else if (header === 'claimedAmount' || header === 'amount') {
          value = `€${parseFloat(value || 0).toLocaleString('it-IT')}`;
        } else if (header === 'riskScore') {
          value = `${value}/100`;
        } else if (header === 'fraudDetected') {
          value = value ? '<span class="badge badge-high">Sì</span>' : '<span class="badge badge-low">No</span>';
        } else if (header === 'priorityLevel') {
          const riskClass = value === 'HIGH' || value === 'URGENT' ? 'badge-high' : 
                           value === 'MEDIUM' ? 'badge-medium' : 'badge-low';
          value = `<span class="badge ${riskClass}">${value}</span>`;
        } else if (header === 'incidentDate' || header === 'createdAt' || header === 'updatedAt') {
          value = new Date(value).toLocaleDateString('it-IT');
        } else if (header === 'patterns' && typeof value === 'object') {
          const patterns = [];
          if (value.highAmount) patterns.push('Importo Elevato');
          if (value.urgentTiming) patterns.push('Tempestivo');
          if (value.inconsistentInfo) patterns.push('Info Incoerenti');
          value = patterns.join(', ') || '-';
        }
        
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
            </tbody>
        </table>
    </div>
`;
  } else {
    html += `
    <div class="section">
        <div class="section-title">Nessun Dato Disponibile</div>
        <p>Non ci sono dati disponibili per il periodo e i filtri selezionati.</p>
    </div>
    `;
  }

  html += `
    <div class="footer">
        Report generato dal sistema Anti-Frode<br>
        Questo report è confidenziale e non deve essere distribuito senza autorizzazione.
    </div>
</body>
</html>`;

  return html;
}

function getDateRange(timeframe: string) {
  const now = new Date();
  let startDate = new Date(0); // Default to all time
  
  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }
  
  return { startDate, endDate: now };
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ExportRequest;
    const { format, context } = body;
    
    let data: any[] = [];
    let filename = '';
    
    if (context.tab === 'overview') {
      // Export overview KPIs and trends
      const { startDate, endDate } = getDateRange(context.timeframe);
      
      const claims = await db
        .select({
          id: insuranceClaim.id,
          claimNumber: insuranceClaim.claimNumber,
          claimantName: insuranceClaim.claimantName,
          claimType: insuranceClaim.claimType,
          priorityLevel: insuranceClaim.priorityLevel,
          claimStatus: insuranceClaim.claimStatus,
          incidentDate: insuranceClaim.incidentDate,
          claimedAmount: insuranceClaim.claimedAmount,
          createdAt: insuranceClaim.createdAt,
          updatedAt: insuranceClaim.updatedAt,
        })
        .from(insuranceClaim)
        .where(and(
          gte(insuranceClaim.createdAt, startDate),
          lte(insuranceClaim.createdAt, endDate)
        ))
        .orderBy(desc(insuranceClaim.createdAt));
      
      data = claims.map(claim => ({
        ...claim,
        riskScore: calculateRiskScore(claim.priorityLevel),
        fraudDetected: calculateRiskScore(claim.priorityLevel) > 70,
      }));
      
      filename = `panoramica-anti-frod-${context.timeframe}`;
      
    } else if (context.tab === 'case-explorer') {
      // Export cases with filters
      const { startDate, endDate } = getDateRange(context.timeframe);
      
      const whereConditions: any[] = [
        gte(insuranceClaim.createdAt, startDate),
        lte(insuranceClaim.createdAt, endDate)
      ];
      
      if (context.filters.search) {
        whereConditions.push(
          or(
            ilike(insuranceClaim.claimNumber, `%${context.filters.search}%`),
            ilike(insuranceClaim.claimantName, `%${context.filters.search}%`),
            ilike(insuranceClaim.claimType, `%${context.filters.search}%`)
          )
        );
      }
      
      if (context.filters.riskLevel && context.filters.riskLevel !== 'ALL') {
        whereConditions.push(sql`${insuranceClaim.priorityLevel} = ${context.filters.riskLevel}`);
      }
      
      if (context.filters.startDate) {
        whereConditions.push(gte(insuranceClaim.incidentDate, new Date(context.filters.startDate)));
      }
      
      if (context.filters.endDate) {
        whereConditions.push(lte(insuranceClaim.incidentDate, new Date(context.filters.endDate)));
      }
      
      const cases = await db
        .select({
          id: insuranceClaim.id,
          claimNumber: insuranceClaim.claimNumber,
          claimantName: insuranceClaim.claimantName,
          claimType: insuranceClaim.claimType,
          priorityLevel: insuranceClaim.priorityLevel,
          claimStatus: insuranceClaim.claimStatus,
          incidentDate: insuranceClaim.incidentDate,
          claimedAmount: insuranceClaim.claimedAmount,
          createdAt: insuranceClaim.createdAt,
          updatedAt: insuranceClaim.updatedAt,
        })
        .from(insuranceClaim)
        .where(and(...whereConditions))
        .orderBy(desc(insuranceClaim.createdAt));
      
      data = cases.map(case_item => ({
        ...case_item,
        riskScore: calculateRiskScore(case_item.priorityLevel),
        fraudDetected: calculateRiskScore(case_item.priorityLevel) > 70,
      }));
      
      filename = `case-explorer-${context.timeframe}`;
      
    } else if (context.tab === 'pattern-analysis') {
      // Export pattern analysis data
      const { startDate, endDate } = getDateRange(context.timeframe);
      
      const claims = await db
        .select({
          id: insuranceClaim.id,
          claimNumber: insuranceClaim.claimNumber,
          claimantName: insuranceClaim.claimantName,
          claimType: insuranceClaim.claimType,
          priorityLevel: insuranceClaim.priorityLevel,
          claimedAmount: insuranceClaim.claimedAmount,
          incidentDate: insuranceClaim.incidentDate,
          createdAt: insuranceClaim.createdAt,
        })
        .from(insuranceClaim)
        .where(and(
          gte(insuranceClaim.createdAt, startDate),
          lte(insuranceClaim.createdAt, endDate)
        ))
        .orderBy(desc(insuranceClaim.createdAt));
      
      // Analyze patterns
      data = claims.map(claim => {
        const amount = parseFloat(claim.claimedAmount?.toString() || '0');
        const riskScore = calculateRiskScore(claim.priorityLevel);
        
        return {
          ...claim,
          riskScore,
          amount,
          patterns: {
            multipleClaims: false, // This would need additional logic
            highAmount: amount > 15000,
            urgentTiming: claim.priorityLevel === 'URGENT',
            inconsistentInfo: riskScore > 80
          }
        };
      });
      
      filename = `pattern-analysis-${context.timeframe}`;
    }
    
    // Generate content based on format
    let content: string | Blob = 'No data available';
    let contentType: string = 'text/plain';
    
    if (format === 'csv') {
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        content = generateCSV(data, headers);
      } else {
        content = 'No data available';
      }
      contentType = 'text/csv';
      
    } else if (format === 'json') {
      content = JSON.stringify({
        exportedAt: new Date().toISOString(),
        context,
        totalRecords: data.length,
        data
      }, null, 2);
      contentType = 'application/json';
      
    } else if (format === 'pdf') {
      // Generate HTML content that can be saved as PDF
      const htmlContent = generateHTMLReport(data, context, filename);
      content = htmlContent;
      contentType = 'text/html';
    }
    
    // Add timestamp to filename
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}.${format}`;
    
    return new NextResponse(content as string, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fullFilename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}