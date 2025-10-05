import { createClient } from "../../../../utils/supabase/server";
import fs from 'fs';
import path from 'path';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return Response.json({ 
                error: 'You must be logged in to clear emails.',
                auth_required: true 
            }, { status: 401 });
        }

        const emailsRawPath = path.join(process.cwd(), 'scripts', 'emails_raw');
        let clearedCount = 0;
        
        if (fs.existsSync(emailsRawPath)) {
            const files = fs.readdirSync(emailsRawPath);
            
            for (const file of files) {
                const filePath = path.join(emailsRawPath, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    clearedCount++;
                }
            }
        }

        return Response.json({ 
            success: true, 
            message: `Successfully cleared ${clearedCount} files from emails_raw folder.`,
            cleared_count: clearedCount
        });
        
    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message
        }, { status: 500 });
    }
}
