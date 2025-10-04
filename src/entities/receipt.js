export const receiptSchema = {
    "name": "Receipt",
    "type": "object",
    "properties": {
      "merchant": {
        "type": "string",
        "description": "Name of the merchant/vendor"
      },
      "date": {
        "type": "string",
        "format": "date",
        "description": "Date of purchase"
      },
      "total_amount": {
        "type": "number",
        "description": "Total amount paid"
      },
      "currency": {
        "type": "string",
        "default": "USD",
        "description": "Currency code"
      },
      "category": {
        "type": "string",
        "enum": [
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
          "other"
        ],
        "default": "other",
        "description": "Expense category"
      },
      "payment_method": {
        "type": "string",
        "enum": [
          "credit_card",
          "debit_card",
          "cash",
          "bank_transfer",
          "digital_wallet",
          "other"
        ],
        "description": "Method of payment used"
      },
      "receipt_number": {
        "type": "string",
        "description": "Receipt or transaction number"
      },
      "tax_amount": {
        "type": "number",
        "description": "Tax amount if applicable"
      },
      "items": {
        "type": "array",
        "description": "Line items from the receipt",
        "items": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string"
            },
            "quantity": {
              "type": "number"
            },
            "unit_price": {
              "type": "number"
            },
            "total": {
              "type": "number"
            }
          }
        }
      },
      "notes": {
        "type": "string",
        "description": "Additional notes about the expense"
      },
      "folder_id": {
        "type": "string",
        "description": "ID of the folder this receipt belongs to"
      },
      "file_url": {
        "type": "string",
        "description": "URL of the uploaded receipt image/PDF"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Custom tags for organization"
      }
    },
    "required": [
      "merchant",
      "date",
      "total_amount"
    ]
  }