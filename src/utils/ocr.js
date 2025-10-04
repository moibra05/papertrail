import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { geminiReceiptSchema, receiptSchema } from "@/entities/receipt";
import { isAllowedReceiptFile } from "./shared";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PRIVATE_GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";
const PROMPT = `
You are a receipt extraction AI.

- If a valid receipt is detected in the input (image, PDF, or text), extract its structured data according to the provided schema.
- If no valid receipt or purchase information is found, respond exactly with:
{
  "error": "No valid receipt found"
}

Respond with empty fields if it is classified as a receipt and partial info is found.
`;

export async function extractReceipt(file) {
  try {
    if (!isAllowedReceiptFile(file)) {
      throw new Error(`File type ${file.type} is not supported.`);
    }

    const newFile = await ai.files.upload({
      file,
      config: { mimeType: file.type },
    });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: createUserContent([
        createPartFromUri(newFile.uri, newFile.mimeType),
        PROMPT,
      ]),
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiReceiptSchema,
      },
    });

    const result = JSON.parse(response.text || "{}");
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  } catch (error) {
    console.error("Error extracting receipt:", error);
    throw error;
  }
}
