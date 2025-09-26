import { getRiskCategory } from './utils';

interface ClaimData {
  incidentDate: Date | string;
  incidentTime: string;
  claimedAmount: number;
  estimatedDamage: number;
  incidentCity: string;
  incidentProvince: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  claimantId: string;
  claimType: string;
}

interface RiskAssessmentResult {
  overallScore: number;
  category: 'LOW' | 'MEDIUM' | 'HIGH';
  locationScore: number;
  timeScore: number;
  amountScore: number;
  historyScore: number;
  behaviorScore: number;
  featureImportance: Record<string, number>;
  modelPrediction: Record<string, any>;
  confidence: number;
  explanation: {
    summary: string;
    keyFactors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
    recommendations: string[];
  };
}

export function calculateRiskScore(claimData: ClaimData): RiskAssessmentResult {
  let riskScore = 30; // Base risk score
  
  // Initialize individual risk factors
  let locationScore = 25;
  let timeScore = 25;
  let amountScore = 25;
  let historyScore = 25;
  let behaviorScore = 25;
  
  const featureImportance: Record<string, number> = {};
  const keyFactors: Array<{ factor: string; impact: number; description: string }> = [];
  
  // Amount-based risk assessment
  const claimedAmount = claimData.claimedAmount;
  if (claimedAmount > 5000) {
    const amountRisk = Math.min(20, (claimedAmount - 5000) / 1000 * 2);
    amountScore += amountRisk;
    riskScore += amountRisk;
    featureImportance.amount = amountRisk;
    keyFactors.push({
      factor: 'Importo Elevato',
      impact: Math.round(amountRisk),
      description: `L'importo richiesto (€${claimedAmount.toLocaleString()}) supera la soglia di rischio`
    });
  }
  
  if (claimedAmount > 15000) {
    const additionalRisk = Math.min(15, (claimedAmount - 15000) / 1000);
    amountScore += additionalRisk;
    riskScore += additionalRisk;
  }
  
  // Time-based risk assessment
  if (claimData.incidentTime) {
    const incidentHour = parseInt(claimData.incidentTime.split(':')[0]);
    if (incidentHour >= 22 || incidentHour <= 6) {
      const timeRisk = 15;
      timeScore += timeRisk;
      riskScore += timeRisk;
      featureImportance.time = timeRisk;
      keyFactors.push({
        factor: 'Orario Sospetto',
        impact: timeRisk,
        description: `L'incidente è avvenuto in orario notturno (${incidentHour}:00)`
      });
    }
  }
  
  // Claim type risk assessment
  const claimTypeRisk: Record<string, number> = {
    'THEFT': 25,
    'VANDALISM': 15,
    'COLLISION': 5,
    'NATURAL_DISASTER': 0,
    'OTHER': 10
  };
  
  if (claimData.claimType && claimTypeRisk[claimData.claimType]) {
    const typeRisk = claimTypeRisk[claimData.claimType];
    behaviorScore += typeRisk;
    riskScore += typeRisk;
    featureImportance.claimType = typeRisk;
    if (typeRisk > 10) {
      keyFactors.push({
        factor: 'Tipo di Sinistro',
        impact: typeRisk,
        description: `Il tipo di sinistro "${claimData.claimType}" presenta un rischio elevato`
      });
    }
  }
  
  // Vehicle age risk assessment
  if (claimData.vehicleYear) {
    const vehicleAge = new Date().getFullYear() - claimData.vehicleYear;
    if (vehicleAge > 10) {
      const ageRisk = Math.min(15, vehicleAge - 10);
      behaviorScore += ageRisk;
      riskScore += ageRisk;
      featureImportance.vehicleAge = ageRisk;
      keyFactors.push({
        factor: 'Età Veicolo',
        impact: Math.round(ageRisk),
        description: `Il veicolo ha ${vehicleAge} anni, superando la soglia di rischio`
      });
    }
  }
  
  // Location-based risk assessment (simplified)
  const highRiskCities = ['Milano', 'Roma', 'Napoli', 'Palermo', 'Torino', 'Bologna'];
  if (highRiskCities.includes(claimData.incidentCity)) {
    const locationRisk = 10;
    locationScore += locationRisk;
    riskScore += locationRisk;
    featureImportance.location = locationRisk;
    keyFactors.push({
      factor: 'Località a Rischio',
      impact: locationRisk,
      description: `La città di ${claimData.incidentCity} ha un alto tasso di sinistri`
    });
  }
  
  // Damage to claimed amount ratio
  if (claimData.estimatedDamage > 0) {
    const ratio = claimData.claimedAmount / claimData.estimatedDamage;
    if (ratio > 1.5) {
      const ratioRisk = Math.min(10, (ratio - 1.5) * 5);
      behaviorScore += ratioRisk;
      riskScore += ratioRisk;
      featureImportance.ratio = ratioRisk;
      keyFactors.push({
        factor: 'Rapporto Anomalo',
        impact: Math.round(ratioRisk),
        description: `L'importo richiesto è ${ratio.toFixed(1)} volte superiore ai danni stimati`
      });
    }
  }
  
  // Ensure scores are within bounds
  riskScore = Math.min(100, Math.max(1, riskScore));
  locationScore = Math.min(100, Math.max(1, locationScore));
  timeScore = Math.min(100, Math.max(1, timeScore));
  amountScore = Math.min(100, Math.max(1, amountScore));
  historyScore = Math.min(100, Math.max(1, historyScore));
  behaviorScore = Math.min(100, Math.max(1, behaviorScore));
  
  const category = getRiskCategory(riskScore);
  
  // Generate explanation and recommendations
  const explanation = {
    summary: generateRiskSummary(riskScore, category, keyFactors),
    keyFactors: keyFactors.sort((a, b) => b.impact - a.impact),
    recommendations: generateRecommendations(category, keyFactors)
  };
  
  return {
    overallScore: Math.round(riskScore),
    category,
    locationScore: Math.round(locationScore),
    timeScore: Math.round(timeScore),
    amountScore: Math.round(amountScore),
    historyScore: Math.round(historyScore),
    behaviorScore: Math.round(behaviorScore),
    featureImportance,
    modelPrediction: {
      riskLevel: category,
      confidence: Math.min(0.95, 0.6 + (riskScore / 100) * 0.35),
      predictionDate: new Date().toISOString()
    },
    confidence: Math.min(0.95, 0.6 + (riskScore / 100) * 0.35),
    explanation
  };
}

function generateRiskSummary(score: number, category: string, factors: Array<{ factor: string; impact: number }>): string {
  const topFactors = factors.slice(0, 3).map(f => f.factor).join(', ');
  
  switch (category) {
    case 'LOW':
      return `Il sinistro presenta un basso rischio (${score}/100). I fattori principali sono: ${topFactors}.`;
    case 'MEDIUM':
      return `Il sinistro presenta un rischio medio (${score}/100). Sono stati identificati diversi fattori di rischio: ${topFactors}.`;
    case 'HIGH':
      return `Il sinistro presenta un alto rischio (${score}/100). Sono presenti molteplici indicatori di frode: ${topFactors}.`;
    default:
      return `Punteggio di rischio calcolato: ${score}/100.`;
  }
}

function generateRecommendations(category: string, factors: Array<{ factor: string; impact: number }>): string[] {
  const recommendations: string[] = [];
  
  // Base recommendations
  recommendations.push('Verificare la documentazione fornita dal richiedente');
  recommendations.push('Controllare lo storico dei sinistri del richiedente');
  
  // Risk-based recommendations
  if (category === 'HIGH') {
    recommendations.push('Assegnare un investigatore senior per un approfondimento');
    recommendations.push('Richiedere ulteriore documentazione probatoria');
    recommendations.push('Effettuare un sopralluogo');
  }
  
  // Factor-specific recommendations
  factors.forEach(factor => {
    if (factor.factor.includes('Importo')) {
      recommendations.push('Verificare la congruità dell\'importo richiesto');
    }
    if (factor.factor.includes('Orario')) {
      recommendations.push('Approfondire le circostanze dell\'orario dell\'incidente');
    }
    if (factor.factor.includes('Età Veicolo')) {
      recommendations.push('Verificare lo stato di manutenzione del veicolo');
    }
    if (factor.factor.includes('Località')) {
      recommendations.push('Considerare la statistiche di criminalità della zona');
    }
  });
  
  return [...new Set(recommendations)].slice(0, 5); // Remove duplicates and limit to 5
}