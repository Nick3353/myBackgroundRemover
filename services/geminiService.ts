import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

const BACKGROUND_REMOVAL_PROMPT = `
Remove the background from this image completely while preserving:
1. Main subject details and edges
2. Fine details like hair, fur, or transparent objects
3. Original image quality and resolution
4. All foreground elements intact

Output requirements:
- Transparent background (PNG format)
- No background artifacts or remnants
- Clean, sharp edges around the subject
- Maintain original image dimensions
- Return ONLY the image, nothing else.
`;

export const removeBackgroundWithGemini = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // We use gemini-2.5-flash-image for a good balance of speed and quality,
    // or gemini-3-pro-image-preview for highest fidelity if needed.
    // Given the task is "High-quality background removal", 2.5 Flash Image is very capable.
    const modelId = 'gemini-2.5-flash-image'; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: BACKGROUND_REMOVAL_PROMPT
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          }
        ]
      }
    });

    // Check for image parts in the response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const parts = candidates[0].content.parts;
    const imagePart = parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process image with Gemini.");
  }
};