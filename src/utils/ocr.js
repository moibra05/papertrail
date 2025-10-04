import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { geminiReceiptSchema, receiptSchema } from "@/entities/receipt";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PRIVATE_GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";
const PROMPT = `Extract receipt data into this JSON schema:\n${receiptSchema}\nIf there is no data for a field, leave it blank ''. Return only JSON. 
If a valid receipt cannot be identified in the input file, 
respond with:
{
  "error": "No valid receipt found"
}
Otherwise, output a valid JSON object matching the given schema.`;

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

    try {
      return JSON.parse(response.text);
    } catch (err) {
      return { raw: response.text };
    }
  } catch (error) {
    console.error("Error extracting receipt:", error);
    throw error;
  }
}

export function isAllowedReceiptFile(file) {
  if (!file) return false;

  const mime = file.type?.toLowerCase() || "";
  const name = file.name?.toLowerCase() || "";

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/tiff",
  ];

  const allowedTextTypes = [
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
    "message/rfc822", // .eml
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".heic",
    ".tiff",
    ".pdf",
    ".txt",
    ".md",
    ".markdown",
    ".csv",
    ".json",
    ".eml",
    ".log",
  ];

  if (
    allowedImageTypes.includes(mime) ||
    allowedTextTypes.includes(mime) ||
    mime === "application/pdf"
  ) {
    return true;
  }

  return allowedExtensions.some((ext) => name.endsWith(ext));
}
