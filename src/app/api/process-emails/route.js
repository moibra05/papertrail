import { extractReceipt } from "@/utils/ocr";
import { createClient } from "../../../../utils/supabase/server";

export async function POST(request) {
    try {
        const formData = await request.formData();
        
        const file = formData.get('eml_file'); 
        if (!file) {
          return Response.json({ error: 'No .eml file provided' }, { status: 400 });
        }
        
        const data = await extractReceipt(file);
        
        try {
            const supabase = createClient();
            
            const receiptData = {
                merchant: data.merchant || 'Unknown',
                date: data.date || new Date().toISOString().split('T')[0],
                total_amount: parseFloat(data.total_amount) || 0,
                category: data.category || 'Email Receipt',
                items: data.items || [],
                raw_text: data.raw_text || '',
                source: 'email_scraper',
                email_id: file.name.replace('.eml', ''),
                created_at: new Date().toISOString()
            };
            
            const { data: savedReceipt, error: saveError } = await supabase
                .from('receipts')
                .insert([receiptData])
                .select()
                .single();
            
            if (saveError) {
                console.error("Database save error:", saveError);
                return Response.json({
                    ...data,
                    warning: 'Email processed but not saved to database',
                    database_error: saveError.message
                });
            }
            
            console.log("Email receipt saved to database:", savedReceipt.id);
            
            return Response.json({
                ...data,
                id: savedReceipt.id,
                saved: true,
                source: 'email_scraper',
                message: 'Email receipt processed and saved successfully'
            });
            
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return Response.json({
                ...data,
                warning: 'Email processed but database unavailable',
                database_error: dbError.message
            });
        }
        
    } catch (error) {
        console.error("Email processing error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
