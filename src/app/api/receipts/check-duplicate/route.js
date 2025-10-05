import { createClient as createServerClient } from "../../../../../utils/supabase/server";

export async function POST(request) {
  try {
    const { merchant, purchase_date, total_amount } = await request.json();
    
    if (!merchant || !purchase_date || total_amount === null || total_amount === undefined) {
      return Response.json({ error: 'Missing required fields for duplicate check' }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { data: existingReceipts, error } = await supabase
      .from('receipts')
      .select('id, merchant, purchase_date, total_amount')
      .eq('merchant', merchant)
      .eq('purchase_date', purchase_date)
      .eq('total_amount', total_amount);

    if (error) {
      console.error('Database error checking for duplicates:', error);
      return Response.json({ error: 'Database error' }, { status: 500 });
    }

    const isDuplicate = existingReceipts && existingReceipts.length > 0;
    
    return Response.json({ 
      isDuplicate,
      existingReceipt: isDuplicate ? existingReceipts[0] : null
    });

  } catch (error) {
    console.error('Error in duplicate check:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
