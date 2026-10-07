import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

// Hardcoded model fallback chain in priority order
const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

function getRankedModels(): string[] {
  return MODELS;
}

const PROMPT = `You are an expert botanist and agricultural plant pathologist with deep knowledge of tropical, African, and global crops.

STEP 1 — PRECISE CROP IDENTIFICATION:
Examine the leaf shape, texture, venation, color, aroma cues, stem structure, and any visible flowers or seeds.
Identify the EXACT common name of the plant. Do NOT use generic names like "Jute", "Herb", or "Leafy Green" when a specific identity is possible.
Pay special attention to African/tropical crops such as:
- Scent leaf (Ocimum gratissimum / African basil)
- Bitter leaf (Vernonia amygdalina)
- Waterleaf (Talinum triangulare)
- Ugu / Fluted pumpkin (Telfairia occidentalis)
- Efo Riro / African spinach (Celosia argentea)
- Moringa (Moringa oleifera)
- Cassava, Yam, Cocoyam, Plantain, Banana, Pawpaw, Okra, Pepper, Tomato
- And all other common food and herb crops globally
Use the most recognizable local/common name first (e.g., "Scent Leaf (African Basil)").

STEP 2 — DEEP DISEASE & HEALTH ANALYSIS:
Do NOT assume the plant is healthy without thorough inspection. Check for ALL of the following:
- Leaf spots (fungal, bacterial, viral)
- Discoloration (yellowing, browning, blackening, mosaic patterns)
- Wilting, curling, or deformed leaf edges
- Pest damage (holes, trails, webbing, eggs, insects)
- Powdery or downy mildew
- Blight (early or late)
- Root/stem rot signs visible at base
- Nutrient deficiencies (chlorosis, necrosis patterns)
Even for healthy plants, describe specific observed healthy indicators (e.g., "Deep green coloration consistent with Ocimum gratissimum, aromatic glandular trichomes visible, no lesions or pest damage").

STEP 3 — OUTPUT:
Return a detailed, actionable JSON response.
If the image is NOT a plant/crop/leaf, set cropName to "Invalid Image" and diseaseName to "Not a plant".`;

const RESPONSE_CONFIG = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    required: [
      "cropName", "leafType", "diseaseName", "confidence",
      "symptoms", "causes", "severity", "recommendedTreatment",
      "preventionMethods", "nextAction"
    ],
    properties: {
      cropName: { type: Type.STRING, description: "Exact common name of the crop/plant including local name where applicable (e.g. 'Scent Leaf (African Basil)', NOT just 'Herb')" },
      leafType: { type: Type.STRING, description: "Specific leaf type, shape and structure (e.g. 'Simple, ovate, serrated margins with visible glandular trichomes')" },
      diseaseName: { type: Type.STRING, description: "Precise name of the detected disease (e.g. 'Cercospora Leaf Spot') or 'Healthy' if no disease found" },
      confidence: { type: Type.NUMBER, description: "Confidence score percentage (0-100) for both the crop ID and health assessment" },
      symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific observed symptoms or healthy indicators — be detailed, not generic" },
      causes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific likely causes of the disease, or growth/environmental factors for healthy plants" },
      severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"], description: "Disease severity level" },
      recommendedTreatment: { type: Type.STRING, description: "Specific, actionable treatment steps with product types or techniques" },
      preventionMethods: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific, practical prevention steps tailored to this crop" },
      nextAction: { type: Type.STRING, description: "The single most important immediate step the farmer should take right now" }
    }
  }
};

export const analyzeCropImage = async (base64Image: string): Promise<DiagnosisResult> => {
  const imageData = base64Image.split(',')[1] || base64Image;
  const models = getRankedModels();
  let lastError: unknown;

  for (const model of models) {
    try {
      console.log(`[CropCare] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inlineData: { mimeType: "image/jpeg", data: imageData } }
            ]
          }
        ],
        config: RESPONSE_CONFIG
      });

      const result = JSON.parse(response.text);
      return {
        ...result,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        imageUrl: base64Image
      };
    } catch (err: any) {
      const code = err?.status || err?.code || err?.error?.code;
      const isRetryable =
        code === "UNAVAILABLE" || code === 503 ||
        code === "NOT_FOUND"   || code === 404;

      if (isRetryable) {
        console.warn(`[CropCare] Model ${model} failed (${code}), trying next...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};
