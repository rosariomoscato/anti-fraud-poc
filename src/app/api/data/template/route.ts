import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Template CSV header based on SyntheticClaimData structure
    const headers = [
      'claimNumber',
      'policyNumber', 
      'claimantName',
      'claimantEmail',
      'claimantPhone',
      'incidentDate', // YYYY-MM-DD format
      'incidentTime', // HH:MM format
      'incidentLocation',
      'incidentCity',
      'incidentProvince',
      'incidentPostalCode',
      'vehicleMake',
      'vehicleModel', 
      'vehicleYear',
      'vehicleLicensePlate',
      'vehicleVin',
      'claimType', // COLLISION, THEFT, VANDALISM, NATURAL_DISASTER, OTHER
      'claimDescription',
      'estimatedDamage',
      'claimedAmount',
      'claimStatus', // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, UNDER_INVESTIGATION
      'priorityLevel' // LOW, MEDIUM, HIGH, URGENT
    ];

    // Sample data rows
    const sampleData = [
      [
        'SNT-2024-001',
        'POL-2024-001',
        'Mario Rossi',
        'mario.rossi@email.com',
        '3331234567',
        '2024-01-15',
        '14:30',
        'Via Roma 1, Milano',
        'Milano',
        'MI',
        '20121',
        'Fiat',
        'Panda',
        '2020',
        'AB123CD',
        '1HGBH41JXMN109186',
        'COLLISION',
        'Tamponamento a bassa velocità in coda',
        '1500.00',
        '1800.00',
        'SUBMITTED',
        'MEDIUM'
      ],
      [
        'SNT-2024-002', 
        'POL-2024-002',
        'Laura Bianchi',
        'laura.bianchi@email.com',
        '3449876543',
        '2024-01-20',
        '22:15',
        'Piazza Duomo, Napoli',
        'Napoli',
        'NA',
        '80100',
        'Toyota',
        'Yaris',
        '2019',
        'EF456GH',
        '2T1BURHE1JC123456',
        'THEFT',
        'Furto veicolo parcheggiato',
        '25000.00',
        '22000.00',
        'UNDER_INVESTIGATION',
        'HIGH'
      ]
    ];

    // Create CSV content
    const csvContent = [
      '# Template per importazione sinistri assicurativi',
      '# Istruzioni:',
      '# - Compilare tutti i campi obbligatori',
      '# - Seguire il formato specificato per date e orari',
      '# - Utilizzare i valori consentiti per campi come claimType e claimStatus',
      '#',
      '# Campi obbligatori: claimNumber, claimantName, incidentDate, vehicleMake, vehicleModel, claimType, claimedAmount',
      '#',
      '# Formati:',
      '# - incidentDate: YYYY-MM-DD (es. 2024-01-15)',
      '# - incidentTime: HH:MM (es. 14:30)',
      '# - vehicleYear: Anno numerico (es. 2020)',
      '# - estimatedDamage/claimedAmount: Numerico con 2 decimali (es. 1500.00)',
      '#',
      '# Valori consentiti:',
      '# - claimType: COLLISION, THEFT, VANDALISM, NATURAL_DISASTER, OTHER',
      '# - claimStatus: SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, UNDER_INVESTIGATION',
      '# - priorityLevel: LOW, MEDIUM, HIGH, URGENT',
      '#'
    ];

    // Add headers
    csvContent.push(headers.join(','));

    // Add sample data
    sampleData.forEach(row => {
      csvContent.push(row.map(cell => `"${cell}"`).join(','));
    });

    // Add more empty template rows
    for (let i = 0; i < 3; i++) {
      const emptyRow = headers.map(header => `""`).join(',');
      csvContent.push(emptyRow);
    }

    const csvString = csvContent.join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="template_sinistri.csv"',
      },
    });
  } catch (error) {
    console.error('Error generating CSV template:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV template' },
      { status: 500 }
    );
  }
}