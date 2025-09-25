import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insuranceClaim } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const { format = 'csv' } = await request.json();
    
    if (!['csv', 'json', 'parquet'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be csv, json, or parquet' },
        { status: 400 }
      );
    }

    // Fetch all claims with their data
    const claims = await db.select().from(insuranceClaim);

    if (claims.length === 0) {
      return NextResponse.json(
        { error: 'No data available to export' },
        { status: 404 }
      );
    }

    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(claims);
        contentType = 'text/csv';
        filename = `sinistri_assicurativi_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      
      case 'json':
        content = JSON.stringify(claims, null, 2);
        contentType = 'application/json';
        filename = `sinistri_assicurativi_${new Date().toISOString().split('T')[0]}.json`;
        break;
      
      case 'parquet':
        // For Parquet, we'll return a JSON response with the data and instructions
        // since implementing Parquet generation in the browser would require additional libraries
        return NextResponse.json({
          success: true,
          message: 'Parquet export requires additional setup. Here is the data:',
          data: claims,
          note: 'To generate Parquet files, you would need to use a library like apache-parquet or process this data on the server side.'
        });
      
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }

    // Create response with file download headers
    const response = new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': content.length.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

function convertToCSV(claims: Record<string, unknown>[]): string {
  if (claims.length === 0) return '';

  // Get headers from the first claim object
  const headers = Object.keys(claims[0]).filter(key => 
    !key.includes('password') && !key.includes('secret') // Exclude sensitive fields
  );

  // Create CSV header row
  const csvHeaders = headers.join(',');
  
  // Create CSV data rows
  const csvRows = claims.map(claim => {
    return headers.map(header => {
      const value = claim[header];
      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return String(value);
      }
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}