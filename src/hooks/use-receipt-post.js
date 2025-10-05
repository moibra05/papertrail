import { useState } from "react";

export function useReceiptPost() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const postReceipt = async (receiptData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) {
        throw new Error("Failed to post receipt");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, postReceipt };
}
