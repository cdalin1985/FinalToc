import { GoogleGenAI } from "@google/genai";

const MASTER_MODEL = 'gemini-3-flash-preview'; 
// Changed BUDGET_IMAGE_MODEL from gemini-flash-lite-latest (which doesn't generate images) to gemini-2.5-flash-image
const BUDGET_IMAGE_MODEL = 'gemini-2.5-flash-image'; 
// Updated PRESTIGE_IMAGE_MODEL to the high-quality banana series model
const PRESTIGE_IMAGE_MODEL = 'gemini-3-pro-image-preview'; 

export const getCoachingAdvice = async (
  fargoRate: number, 
  contextInfo: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a legendary pool coach. The player has a Fargo Rate of ${fargoRate}. ${contextInfo} Directives: 1. Analyze coordinates (X:0-100, Y:0-100) on a 2:1 ratio pool table. 2. Pockets are corners (0,0, 100,0, 0,100, 100,100) and side middles (50,0, 50,100). 3. Suggest offense or defensive safeties. 4. Use billiards slang. Max 50 words.`;
    const response = await ai.models.generateContent({
      model: MASTER_MODEL,
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 2048 } }
    });
    // Correct access to the text property as a getter, not a method.
    return response.text || "Focus on your follow-through, kid.";
  } catch (error) {
    return "Keep it simple: center ball, steady bridge, smooth stroke.";
  }
};

export const generateProImage = async (
  prompt: string, 
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1',
  isPrestige: boolean = false
): Promise<{ url: string | null }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = isPrestige ? PRESTIGE_IMAGE_MODEL : BUDGET_IMAGE_MODEL;
    
    // Call generateContent for image generation with banana series models.
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio },
      },
    });

    let imageUrl = null;
    // Iterate through all parts to find the image part (inlineData).
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return { url: imageUrl };
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const generateAvatar = async (
  playerName: string, 
  customDescription: string, 
  isPrestige: boolean = false
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = isPrestige ? PRESTIGE_IMAGE_MODEL : BUDGET_IMAGE_MODEL;
    
    const finalPrompt = `AVATAR PROXY: ${playerName}. ${customDescription}. Professional high-contrast quality.`;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: finalPrompt }] },
      config: { imageConfig: { aspectRatio: '1:1' } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Avatar Gen Error:", error);
    return null;
  }
};

export const generateCreativeAvatarPrompt = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MASTER_MODEL,
      contents: "Generate a short, creative character description for a pool player. Max 15 words. Just the subject.",
    });
    // Correct access to the text property.
    return response.text?.trim() || "A pool professional in a dark lounge.";
  } catch (error) {
    return "A champion player leaning on a cue.";
  }
};

export const getHistoryNugget = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MASTER_MODEL,
      contents: `Tell me a random, short historical fact about billiards (max 25 words).`,
    });
    // Correct access to the text property.
    return response.text || "Billiards has been played since the 15th century.";
  } catch (error) {
    return "The first world championship was held in 1873.";
  }
};

export const generateMascotCharacter = async (type: 'shark' | 'leopard'): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = type === 'shark' 
      ? "Digital art of a cool cartoon shark holding a pool cue, leather jacket, vibrant, white background."
      : "Digital art of a sleek leopard pool player, cyberpunk aesthetic, white background.";
    
    const response = await ai.models.generateContent({
      model: BUDGET_IMAGE_MODEL, // Using gemini-2.5-flash-image for mascot generation
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    return null;
  }
};