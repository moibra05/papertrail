import { GoogleGenAI } from "@google/genai";
import { receiptSchema } from "@/entities/receipt";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PRIVATE_GEMINI_API_KEY });
const MODEL = "gemini-2.5-pro";

export async function getFilePart(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const base64Data = buffer.toString("base64");

  // Determine how to send depending on type
  const part =
    file.type.startsWith("image/") || file.type === "application/pdf"
      ? {
          image_input: { image: { content: base64Data }, mime_type: file.type },
        }
      : { text: buffer.toString("utf8") };

  return part;
}

export async function getReceiptData(file) {
  try {
    const part = await getFilePart(file);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          text: `Extract receipt data into this JSON schema:\n${receiptSchema}\nIf there is no data for a field, leave it blank ''. Return only JSON.`,
        },
        part,
      ],
    });

    // Fix: Property 'output' does not exist on type 'GenerateContentResponse'.
    // Use 'candidates' array as per Google GenAI API.
    const outputText = response.candidates?.[0]?.content?.parts?.[0]?.text?.replace(
      /```json|```/g,
      ""
    );
    console.log("outputText", outputText);
    console.log("response", response);
    return JSON.parse(outputText);
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
