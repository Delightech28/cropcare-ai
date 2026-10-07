export interface DiagnosisResult {
  id: string;
  cropName: string;
  leafType: string;
  diseaseName: string;
  confidence: number;
  symptoms: string[];
  causes: string[];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedTreatment: string;
  preventionMethods: string[];
  nextAction: string;
  timestamp: string;
  imageUrl: string;
}

export interface Expert {
  id: string;
  name: string;
  type: 'Farmer' | 'Extension Officer' | 'Agro Center' | 'Support Agent' | 'Crop Buyer';
  distance: number;
  contact: string;
  specialty: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

export type Page = 'home' | 'scan' | 'result' | 'nearby' | 'history' | 'profile';
