import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { receiptSchema } from "@/entities/receipt";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PRIVATE_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });