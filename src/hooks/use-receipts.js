import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

export default function useReceipts() {
  async function updateReceipt(id, data) {
    const {
      merchant,
      purchase_date,
      total_amount,
      currency,
      category,
      payment_method,
      receipt_number,
      tax_amount,
      items,
      notes,
      folder_id,
      file_url,
      tags,
    } = data;

    const updateData = {
      merchant,
      purchase_date,
      total_amount,
      currency,
      category,
      payment_method,
      receipt_number,
      tax_amount,
      items,
      notes,
      folder_id: folder_id || null,
      file_url,
      tags,
    };

    const { error } = await supabase.from("receipts").update(updateData).eq("id", id);

    if (error) {
      console.error("Error updating receipt:", error.message);
      return { error };
    }

    return { error: null };
  }

  async function deleteReceipt(id) {
    const { error } = await supabase.from("receipts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting receipt:", error.message);
      return { error };
    }

    return { error: null };
  }

  return {
    updateReceipt,
    deleteReceipt,
  };
}
