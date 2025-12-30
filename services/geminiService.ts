import { GoogleGenerativeAI } from "@google/generative-ai";

// Using gemini-1.5-flash which is available on the free tier
const MASTER_MODEL = 'gemini-1.5-flash';

// Initialize the API key once from Vite environment
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

export const getCoachingAdvice = async (
  fargoRate: number, 
  contextInfo: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: MASTER_MODEL });
    
    const prompt = `
      You are a legendary pool coach. 
      The player has a Fargo Rate of ${fargoRate}.
      
      ${contextInfo}
      
      Directives:
      1. Analyze coordinates (X:0-100, Y:0-100) on a 2:1 ratio pool table.
      2. Pockets are corners (0,0, 100,0, 0,100, 100,100) and side middles (50,0, 50,100).
      3. Suggest offense or defensive safeties.
      4. Use billiards slang: "english", "draw", "stun", "rail-first".
      5. Max 50 words. Be encouraging but tough like a real pro.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Focus on your follow-through, kid.";
  } catch (error: any) {
    console.error("Gemini Coaching Error:", error);
    return "Keep it simple: center ball, steady bridge, smooth stroke.";
  }
};

export const getHistoryNugget = async (): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: MASTER_MODEL });
    const prompt = `Tell me a random, short historical fact about billiards or the professional pool circuit (max 25 words).`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Billiards has been played by kings and commoners since the 15th century.";
  } catch (error) {
    return "The first world championship for pocket billiards was held in 1873.";
  }
};

export const generateSmackTalk = async (style: 'funny' | 'aggressive' | 'poetic'): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: MASTER_MODEL });
        const prompt = `Generate a short, playful smack talk line for a pool game (max 20 words). Style: ${style}.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text()?.trim() || "Better luck next time!";
    } catch (error) {
        return "I'm going to run this table!";
    }
};

export const generateCreativeAvatarPrompt = async (): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: MASTER_MODEL });
    const prompt = `Generate a creative, visual description (max 10 words) for a pool player avatar. (e.g. "A robotic shark wearing a leather jacket holding a cue").`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text()?.trim() || "A cool pool player";
  } catch (error) {
    return "A legendary pool master";
  }
};

export const generateAvatar = async (playerName: string, customDescription?: string): Promise<string | null> => {
  // Note: Image generation requires Imagen API, not available in basic Gemini SDK
  // This is a placeholder - you'd need to use a different service for image generation
  console.log("Image generation requested for:", playerName, customDescription);
  return null;
};

export const generateMascotCharacter = async (character: 'shark' | 'leopard'): Promise<string | null> => {
  // Note: Image generation requires Imagen API, not available in basic Gemini SDK
  // This is a placeholder - you'd need to use a different service for image generation
  console.log("Mascot generation requested for:", character);
  return null;
};
