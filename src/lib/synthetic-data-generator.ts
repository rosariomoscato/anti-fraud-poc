import { db } from './db';
import { insuranceClaim, riskAssessment, fraudDetection } from './schema';
import { generateId } from './utils';
import { eq, sql } from 'drizzle-orm';

interface ClaimData {
  claimedAmount: number;
  incidentHour: number;
  claimType: string;
  vehicleYear: number;
  incidentDate: string;
  claimantName: string;
  licensePlate: string;
  vin: string;
  location: string;
}

interface FraudIndicator {
  type: string;
  description: string;
  riskImpact: number;
}

// Italian cities and provinces for realistic data
const italianCities = [
  { city: 'Roma', province: 'RM', postalCode: '00100' },
  { city: 'Milano', province: 'MI', postalCode: '20100' },
  { city: 'Napoli', province: 'NA', postalCode: '80100' },
  { city: 'Torino', province: 'TO', postalCode: '10100' },
  { city: 'Palermo', province: 'PA', postalCode: '90100' },
  { city: 'Genova', province: 'GE', postalCode: '16100' },
  { city: 'Bologna', province: 'BO', postalCode: '40100' },
  { city: 'Firenze', province: 'FI', postalCode: '50100' },
  { city: 'Bari', province: 'BA', postalCode: '70100' },
  { city: 'Catania', province: 'CT', postalCode: '95100' },
  { city: 'Venezia', province: 'VE', postalCode: '30100' },
  { city: 'Verona', province: 'VR', postalCode: '37100' },
  { city: 'Messina', province: 'ME', postalCode: '98100' },
  { city: 'Padova', province: 'PD', postalCode: '35100' },
  { city: 'Trieste', province: 'TS', postalCode: '34100' },
  { city: 'Taranto', province: 'TA', postalCode: '74100' },
  { city: 'Brescia', province: 'BS', postalCode: '25100' },
  { city: 'Parma', province: 'PR', postalCode: '43100' },
  { city: 'Prato', province: 'PO', postalCode: '59100' },
  { city: 'Modena', province: 'MO', postalCode: '41100' }
];

const vehicleMakes = [
  'Fiat', 'Toyota', 'Volkswagen', 'Ford', 'Opel', 'Renault', 'Peugeot', 'Citroën',
  'BMW', 'Mercedes-Benz', 'Audi', 'Seat', 'Skoda', 'Hyundai', 'Kia', 'Dacia',
  'Nissan', 'Honda', 'Mazda', 'Suzuki', 'Jeep', 'Land Rover', 'Volvo', 'Mini'
];

const vehicleModels: Record<string, string[]> = {
  'Fiat': ['Punto', 'Panda', '500', 'Tipo', '500X', '500L'],
  'Toyota': ['Yaris', 'Corolla', 'RAV4', 'C-HR', 'Aygo'],
  'Volkswagen': ['Golf', 'Polo', 'Tiguan', 'T-Cross', 'Passat'],
  'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga', 'EcoSport'],
  'Opel': ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland'],
  'Renault': ['Clio', 'Captur', 'Megane', 'Kadjar', 'Duster'],
  'Peugeot': ['208', '2008', '308', '3008', '5008'],
  'BMW': ['Serie 1', 'Serie 3', 'X1', 'X3', 'X5'],
  'Mercedes-Benz': ['Classe A', 'Classe C', 'GLA', 'GLC', 'GLE'],
  'Audi': ['A1', 'A3', 'Q2', 'Q3', 'Q5']
};

const claimTypes = ['COLLISION', 'THEFT', 'VANDALISM', 'NATURAL_DISASTER', 'OTHER'];
const claimStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'UNDER_INVESTIGATION'];
const priorityLevels = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// Italian names and surnames
const firstNames = [
  'Marco', 'Giuseppe', 'Antonio', 'Mario', 'Luigi', 'Giovanni', 'Paolo', 'Roberto',
  'Francesco', 'Carlo', 'Angelo', 'Salvatore', 'Vincenzo', 'Domenico', 'Stefano',
  'Laura', 'Anna', 'Maria', 'Giulia', 'Sofia', 'Chiara', 'Valentina', 'Francesca',
  'Eleonora', 'Alessia', 'Martina', 'Giovanna', 'Caterina', 'Rosa', 'Isabella'
];

const lastNames = [
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci',
  'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa',
  'Giordano', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana', 'Santoro',
  'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone'
];

// Utility functions
function randomElement<T>(array: T[] | string): T {
  if (typeof array === 'string') {
    return array[Math.floor(Math.random() * array.length)] as T;
  }
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomTime(): string {
  const hours = randomInt(0, 23);
  const minutes = randomInt(0, 59);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateLicensePlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let plate = '';
  for (let i = 0; i < 2; i++) {
    plate += randomElement(letters);
  }
  for (let i = 0; i < 3; i++) {
    plate += randomElement(numbers);
  }
  for (let i = 0; i < 2; i++) {
    plate += randomElement(letters);
  }
  
  return plate;
}

function generateVin(): string {
  const chars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += randomElement(chars);
  }
  return vin;
}

function generatePhoneNumber(): string {
  const prefix = ['320', '328', '330', '333', '334', '335', '338', '339', '340', '347', '348', '349'];
  return `${randomElement(prefix)}${randomInt(1000000, 9999999)}`;
}

function generateEmail(name: string, surname: string): string {
  const domains = ['gmail.com', 'hotmail.com', 'libero.it', 'yahoo.com', 'outlook.com'];
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const cleanSurname = surname.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanName}.${cleanSurname}${randomInt(1, 99)}@${randomElement(domains)}`;
}

function generateFiscalCode(name: string, surname: string, birthDate: Date): string {
  // Simplified Italian fiscal code generation
  const surnameCode = surname.substring(0, 3).toUpperCase().padEnd(3, 'X');
  const nameCode = name.substring(0, 3).toUpperCase().padEnd(3, 'X');
  const dateCode = `${(birthDate.getFullYear() % 100).toString().padStart(2, '0')}${(birthDate.getMonth() + 1).toString().padStart(2, '0')}${birthDate.getDate().toString().padStart(2, '0')}`;
  const checkCode = randomElement(['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T']);
  return `${surnameCode}${nameCode}${dateCode}${checkCode}`;
}

// Risk scoring logic for synthetic fraud patterns
function calculateRiskScore(claim: ClaimData, fraudPercentage: number): number {
  let riskScore = randomInt(1, 100);
  
  // Increase risk based on various factors
  if (claim.claimedAmount > 10000) riskScore += 20;
  if (claim.incidentHour >= 22 || claim.incidentHour <= 6) riskScore += 15;
  if (claim.claimType === 'THEFT') riskScore += 25;
  if (claim.vehicleYear < 2010) riskScore += 10;
  
  // Add fraud patterns based on specified percentage
  if (Math.random() < fraudPercentage / 100) { // Dynamic chance based on fraud percentage
    riskScore += randomInt(20, 40);
  }
  
  return Math.min(100, Math.max(1, riskScore));
}

function generateFraudIndicators(claim: ClaimData, fraudPercentage: number): FraudIndicator[] {
  const indicators = [];
  
  if (claim.incidentHour >= 22 || claim.incidentHour <= 6) {
    indicators.push({
      type: 'TEMPORAL',
      description: 'Incidente durante ore notturne',
      riskImpact: 15
    });
  }
  
  if (claim.claimedAmount > 15000) {
    indicators.push({
      type: 'FINANCIAL',
      description: 'Importo elevato richiesto',
      riskImpact: 20
    });
  }
  
  // Add behavioral indicators based on fraud percentage
  if (Math.random() < (fraudPercentage / 100) * 0.33) { // Scale with fraud percentage
    indicators.push({
      type: 'BEHAVIORAL',
      description: 'Pattern comportamentale sospetto',
      riskImpact: 30
    });
  }
  
  // Add additional fraud indicators for higher percentages
  if (fraudPercentage > 30 && Math.random() < (fraudPercentage - 30) / 100) {
    indicators.push({
      type: 'PATTERN',
      description: 'Pattern di frode multipli rilevati',
      riskImpact: 25
    });
  }
  
  return indicators;
}

export interface SyntheticClaimData {
  claimNumber: string;
  policyNumber: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  incidentDate: Date;
  incidentTime: string;
  incidentLocation: string;
  incidentCity: string;
  incidentProvince: string;
  incidentPostalCode: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleLicensePlate: string;
  vehicleVin: string;
  claimType: string;
  claimDescription: string;
  estimatedDamage: number;
  claimedAmount: number;
  claimStatus: string;
  priorityLevel: string;
  riskScore: number;
  fraudIndicators: FraudIndicator[];
}

export function generateSyntheticClaim(fraudPercentage: number = 15): SyntheticClaimData {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const birthDate = randomDate(new Date('1950-01-01'), new Date('2005-12-31'));
  const claimantId = generateFiscalCode(firstName, lastName, birthDate);
  
  const incidentDate = randomDate(new Date('2023-01-01'), new Date('2024-12-31'));
  const incidentTime = randomTime();
  const incidentHour = parseInt(incidentTime.split(':')[0]);
  
  const city = randomElement(italianCities);
  const vehicleMake = randomElement(vehicleMakes);
  const vehicleModelsForMake = vehicleModels[vehicleMake] || ['Modello'];
  const vehicleModel = randomElement(vehicleModelsForMake);
  
  const claimType = randomElement(claimTypes);
  const claimedAmount = randomFloat(500, 25000);
  const estimatedDamage = claimedAmount * randomFloat(0.7, 1.3);
  
  const claim: ClaimData = {
    claimedAmount,
    incidentHour,
    claimType,
    vehicleYear: randomInt(2000, 2024),
    incidentDate: incidentDate.toISOString().split('T')[0],
    claimantName: `${firstName} ${lastName}`,
    licensePlate: generateLicensePlate(),
    vin: generateVin(),
    location: city.city
  };
  
  const riskScore = calculateRiskScore(claim, fraudPercentage);
  const fraudIndicators = generateFraudIndicators(claim, fraudPercentage);
  
  const claimNumber = `CLM-${incidentDate.getFullYear()}-${randomInt(1000, 9999).toString().padStart(4, '0')}`;
  const policyNumber = `POL-${randomInt(100000, 999999)}`;
  
  return {
    claimNumber,
    policyNumber,
    claimantId,
    claimantName: `${firstName} ${lastName}`,
    claimantEmail: generateEmail(firstName, lastName),
    claimantPhone: generatePhoneNumber(),
    incidentDate,
    incidentTime,
    incidentLocation: `Via ${randomElement(['Roma', 'Milano', 'Torino', 'Napoli'])} ${randomInt(1, 200)}`,
    incidentCity: city.city,
    incidentProvince: city.province,
    incidentPostalCode: city.postalCode,
    vehicleMake,
    vehicleModel,
    vehicleYear: randomInt(2000, 2024),
    vehicleLicensePlate: generateLicensePlate(),
    vehicleVin: generateVin(),
    claimType,
    claimDescription: generateClaimDescription(claimType),
    estimatedDamage,
    claimedAmount,
    claimStatus: randomElement(claimStatuses),
    priorityLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
    riskScore,
    fraudIndicators
  };
}

function generateClaimDescription(claimType: string): string {
  const descriptions = {
    'COLLISION': [
      'Incidente con altro veicolo a rotonda',
      'Tamponamento in coda al semaforo',
      'Scontro frontale in curva',
      'Incidente durante parcheggio',
      'Urto laterale all\'incrocio'
    ],
    'THEFT': [
      'Furto del veicolo parcheggiato in strada',
      'Tentativo di furto con danni alla portiera',
      'Veicolo rubato da garage privato',
      'Furto con scasso del bloccasterzo',
      'Rapina del veicolo'
    ],
    'VANDALISM': [
      'Vernice spruzzata sulla carrozzeria',
      'Specchi rotti da vandali',
      'Gomme tagliate durante la notte',
      'Finestrini infranti',
      'Danni intenzionali alla carrozzeria'
    ],
    'NATURAL_DISASTER': [
      'Danni da grandine',
      'Allagamento per pioggia intensa',
      'Danni da vento forte',
      'Caduta rami sull\'auto',
      'Inondazione area parcheggio'
    ],
    'OTHER': [
      'Danni da animali selvatici',
      'Incendio parziale del motore',
      'Danni da caduta oggetti',
      'Problemi meccanici improvvisi',
      'Danni da eventi atmosferici'
    ]
  };
  
  const descArray = descriptions[claimType as keyof typeof descriptions] || descriptions['OTHER'];
  return randomElement(descArray);
}

export async function generateSyntheticClaims(count: number, fraudPercentage: number = 15): Promise<SyntheticClaimData[]> {
  const claims: SyntheticClaimData[] = [];
  
  for (let i = 0; i < count; i++) {
    const claim = generateSyntheticClaim(fraudPercentage);
    claims.push(claim);
  }
  
  return claims;
}

export async function insertSyntheticClaims(claims: SyntheticClaimData[]): Promise<void> {
  for (const claimData of claims) {
    try {
      await db.insert(insuranceClaim).values({
        id: generateId(),
        claimNumber: claimData.claimNumber,
        policyNumber: claimData.policyNumber,
        claimantId: claimData.claimantId,
        claimantName: claimData.claimantName,
        claimantEmail: claimData.claimantEmail,
        claimantPhone: claimData.claimantPhone,
        incidentDate: claimData.incidentDate,
        incidentTime: claimData.incidentTime,
        incidentLocation: claimData.incidentLocation,
        incidentCity: claimData.incidentCity,
        incidentProvince: claimData.incidentProvince,
        incidentPostalCode: claimData.incidentPostalCode,
        incidentCountry: 'IT',
        vehicleMake: claimData.vehicleMake,
        vehicleModel: claimData.vehicleModel,
        vehicleYear: claimData.vehicleYear,
        vehicleLicensePlate: claimData.vehicleLicensePlate,
        vehicleVin: claimData.vehicleVin,
        claimType: claimData.claimType,
        claimDescription: claimData.claimDescription,
        estimatedDamage: claimData.estimatedDamage.toString(),
        claimedAmount: claimData.claimedAmount.toString(),
        claimStatus: claimData.claimStatus,
        priorityLevel: claimData.priorityLevel,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error inserting claim ${claimData.claimNumber}:`, error);
    }
  }
}

// Count existing synthetic claims
export async function countExistingClaims(): Promise<number> {
  try {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(insuranceClaim);
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error counting existing claims:', error);
    return 0;
  }
}

// Delete existing synthetic claims and related data
export async function deleteExistingClaims(): Promise<{ deletedClaims: number; deletedAssessments: number; deletedDetections: number }> {
  try {
    console.log('Deleting existing synthetic claims...');
    
    // Count records before deletion
    const claimCount = await countExistingClaims();
    
    if (claimCount === 0) {
      return { deletedClaims: 0, deletedAssessments: 0, deletedDetections: 0 };
    }
    
    // Delete related records first (foreign key constraints will handle cascading deletes)
    const assessmentCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(riskAssessment)
      .where(eq(riskAssessment.claimId, sql`any(select id from insurance_claim)`));
    
    const detectionCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(fraudDetection)
      .where(eq(fraudDetection.claimId, sql`any(select id from insurance_claim)`));
    
    const assessmentCount = assessmentCountResult[0]?.count || 0;
    const detectionCount = detectionCountResult[0]?.count || 0;
    
    // Delete claims (this will cascade delete related records due to foreign key constraints)
    const deleteResult = await db.delete(insuranceClaim).returning({ id: insuranceClaim.id });
    const deletedClaimCount = deleteResult.length;
    
    console.log(`Deleted ${deletedClaimCount} claims, ${assessmentCount} assessments, ${detectionCount} detections`);
    
    return {
      deletedClaims: deletedClaimCount,
      deletedAssessments: assessmentCount,
      deletedDetections: detectionCount
    };
  } catch (error) {
    console.error('Error deleting existing claims:', error);
    throw error;
  }
}

export async function generateAndInsertClaims(count: number, fraudPercentage: number = 15, clearExisting: boolean = true): Promise<{
  generatedClaims: number;
  deletedClaims?: number;
  deletedAssessments?: number;
  deletedDetections?: number;
}> {
  console.log(`Starting synthetic claims generation with ${fraudPercentage}% fraud rate...`);
  
  let deletionResult = null;
  
  // Clear existing data if requested
  if (clearExisting) {
    deletionResult = await deleteExistingClaims();
  }
  
  console.log(`Generating ${count} synthetic claims...`);
  const claims = await generateSyntheticClaims(count, fraudPercentage);
  console.log(`Inserting ${claims.length} claims into database...`);
  await insertSyntheticClaims(claims);
  console.log(`Synthetic claims generation completed with ${fraudPercentage}% fraud rate!`);
  
  return {
    generatedClaims: claims.length,
    ...deletionResult
  };
}