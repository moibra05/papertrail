import { GoogleGenerativeAI } from "@google/generative-ai";
import { receiptSchema } from "@/entities/receipt";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PRIVATE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function handleUpload(file) {
  try {
    const contents = await getContents(file);
    const result = await model.generateContent({contents});

    const jsonText = result.response.text().replace(/```json|```/g, "");
    const data = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getContents(file) {
    const contents = [];
  
    try {
      // Convert File to ArrayBuffer first
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
  
      // Instruction prompt first
      contents.push({
        type: "input_text",
        text: `
        Extract receipt data into this JSON schema:
        ${receiptSchema}
        If there is no data for a field, leave it blank ''.
        Return only JSON.
      `,
      });
  
      // Determine file type
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        // Gemini expects raw buffer for files
        contents.push({
          type: "input_file",
          file: buffer,
          filename: file.name,
          mime_type: file.type,
        });
      } else if (
        file.type.startsWith("text/") ||
        /\.(txt|md)$/i.test(file.name)
      ) {
        // Text file - convert buffer to text
        const textData = buffer.toString("utf8");
        contents.push({
          text: textData,
        });
      } else {
        throw new Error(
          "Unsupported file type. Must be an image, PDF, or text file."
        );
      }
  
      return contents;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  