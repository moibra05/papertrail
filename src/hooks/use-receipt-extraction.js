import { hasNonBlankValue, isNotBlank } from "@/utils/shared";
import { useState } from "react";

export function useReceiptExtraction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractReceipt = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("raw_receipt", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/receipts-extract`,
        {
          method: "POST",
          body: formData,
        }
      );


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!hasNonBlankValue(data)) {
        throw new Error(`Parsing Error: Is the file a valid receipt?`);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractReceipt,
    isLoading,
    error,
  };
}
