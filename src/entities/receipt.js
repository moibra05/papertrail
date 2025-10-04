import { Type } from "@google/genai";

export const receiptSchema = {
  name: "Receipt",
  type: "object",
  properties: {
    merchant: {
      type: "string",
      description: "Name of the merchant/vendor",
    },
    date: {
      type: "string",
      format: "date",
      description: "Date of purchase",
    },
    total_amount: {
      type: "number",
      description: "Total amount paid",
    },
    currency: {
      type: "string",
      default: "USD",
      description: "Currency code",
    },
    category: {
      type: "string",
      enum: [
        "food_dining",
        "groceries",
        "transportation",
        "utilities",
        "healthcare",
        "entertainment",
        "shopping",
        "travel",
        "business_services",
        "office_supplies",
        "software_subscriptions",
        "other",
      ],
      default: "other",
      description: "Expense category",
    },
    payment_method: {
      type: "string",
      enum: [
        "credit_card",
        "debit_card",
        "cash",
        "bank_transfer",
        "digital_wallet",
        "other",
      ],
      description: "Method of payment used",
    },
    receipt_number: {
      type: "string",
      description: "Receipt or transaction number",
    },
    tax_amount: {
      type: "number",
      description: "Tax amount if applicable",
    },
    items: {
      type: "array",
      description: "Line items from the receipt",
      items: {
        type: "object",
        properties: {
          description: {
            type: "string",
          },
          quantity: {
            type: "number",
          },
          unit_price: {
            type: "number",
          },
          total: {
            type: "number",
          },
        },
      },
    },
    notes: {
      type: "string",
      description: "Additional notes about the expense",
    },
    folder_id: {
      type: "string",
      description: "ID of the folder this receipt belongs to",
    },
    file_url: {
      type: "string",
      description: "URL of the uploaded receipt image/PDF",
    },
    tags: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Custom tags for organization",
    },
  },
  required: ["merchant", "date", "total_amount"],
};

export const geminiReceiptSchema = {
  name: "Receipt",
  type: Type.OBJECT,
  properties: {
    id: {
      type: Type.STRING,
      description: "UUID of the receipt (auto-generated)",
    },
    merchant: {
      type: Type.STRING,
      description: "Name of the merchant/vendor",
    },
    purchase_date: {
      type: Type.STRING,
      description: "Date of purchase in YYYY-MM-DD format",
    },
    total_amount: {
      type: Type.NUMBER,
      description: "Total amount paid",
    },
    currency: {
      type: Type.STRING,
      default: "USD",
      description: "Three-letter currency code (ISO 4217)",
    },
    category: {
      type: Type.STRING,
      enum: [
        "food_dining",
        "groceries",
        "transportation",
        "utilities",
        "healthcare",
        "entertainment",
        "shopping",
        "travel",
        "business_services",
        "office_supplies",
        "software_subscriptions",
        "other",
      ],
      default: "other",
      description: "Expense category (from receipt_category enum)",
    },
    payment_method: {
      type: Type.STRING,
      enum: [
        "credit_card",
        "debit_card",
        "cash",
        "bank_transfer",
        "digital_wallet",
        "other",
      ],
      description: "Payment method used (from payment_method_type enum)",
    },
    receipt_number: {
      type: Type.STRING,
      description: "Receipt or transaction number",
    },
    tax_amount: {
      type: Type.NUMBER,
      description: "Tax amount if applicable",
    },
    items: {
      type: Type.ARRAY,
      description: "Array of line items from the receipt (parsed from JSONB)",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit_price: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
        },
      },
    },
    notes: {
      type: Type.STRING,
      description: "Additional notes or comments",
    },
    folder_id: {
      type: Type.STRING,
      description: "UUID of the folder this receipt belongs to",
    },
    file_url: {
      type: Type.STRING,
      description: "URL to the uploaded receipt file (image or PDF)",
    },
    tags: {
      type: Type.ARRAY,
      description: "Array of text tags for organization",
      items: { type: Type.STRING },
    },
    created_at: {
      type: Type.STRING,
      description: "Timestamp (ISO 8601) when the receipt was created",
    },
    updated_at: {
      type: Type.STRING,
      description: "Timestamp (ISO 8601) when the receipt was last updated",
    },
    user: {
      type: Type.STRING,
      description: "UUID of the user who owns this receipt",
    },
  },
  required: ["merchant", "purchase_date", "total_amount", "user"],
};
