import { createClient as createServerClient } from "../../../../utils/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createServerClient();

    const contentType = (
      request.headers.get("content-type") || ""
    ).toLowerCase();

    // Helper to insert receipt record into DB
    async function insertReceipt(payload) {
      const { data, error } = await supabase
        .from("receipts")
        .insert([payload])
        .select();
      if (error) throw error;
      return data && data[0] ? data[0] : null;
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();
      // validate required fields
      const { merchant, purchase_date, total_amount } = body;
      if (
        !merchant ||
        !purchase_date ||
        total_amount === undefined ||
        total_amount === null
      ) {
        return new Response(
          JSON.stringify({
            error:
              "Missing required fields: merchant, purchase_date, total_amount",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const userId = user.id;

      const payload = {
        merchant,
        purchase_date,
        total_amount,
        currency: body.currency || "USD",
        category: body.category || "other",
        payment_method: body.payment_method || null,
        receipt_number: body.receipt_number || null,
        tax_amount: body.tax_amount || null,
        items: body.items || null,
        notes: body.notes || null,
        folder_id: body.folder_id || null,
        file_url: body.file_url || null,
        tags: body.tags || null,
        user: userId,
      };

      const inserted = await insertReceipt(payload);
      return new Response(JSON.stringify({ receipt: inserted }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
