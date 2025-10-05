import { createClient } from "../../../../utils/supabase/server";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
    try {
        console.log("🔄 Starting Gmail scraper...");
        
        // Check if user is authenticated
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return Response.json({ 
                error: 'You must be logged in to scrape emails.',
                auth_required: true 
            }, { status: 401 });
        }

        console.log(`👤 User authenticated: ${user.email}`);

        // Run the Python scraper to download .eml files
        // First, let's check if authentication is properly set up
        const tokenPath = path.join(process.cwd(), 'scripts', 'token.json');
        let validAuth = false;
        
        if (fs.existsSync(tokenPath)) {
            try {
                const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
                validAuth = tokenData.refresh_token && tokenData.client_id;
                if (!validAuth) {
                    console.log("⚠️ token.json exists but missing refresh_token, treating as invalid");
                }
            } catch (parseError) {
                console.log("⚠️ token.json exists but is invalid JSON");
                validAuth = false;
            }
        }
        
        if (!validAuth) {
            console.log("⚠️ Valid Gmail authentication not found, using existing files");
            
            // Check if there are existing .eml files to process
            const emailsRawPath = path.join(process.cwd(), 'scripts', 'emails_raw');
            const emlFiles = [];
            
            if (fs.existsSync(emailsRawPath)) {
                const files = fs.readdirSync(emailsRawPath);
                const emlFilesList = files.filter(file => file.endsWith('.eml'));
                
                emlFilesList.forEach(file => {
                    emlFiles.push({
                        filename: file,
                        path: `/scripts/emails_raw/${file}`,
                        id: file.replace('.eml', '')
                    });
                });
            }
            
            if (emlFiles.length === 0) {
                return Response.json({ 
                    success: false,
                    error: 'Gmail authentication not properly set up and no existing .eml files found.',
                    setup_required: true,
                    message: 'To set up Gmail access: 1) Open terminal, 2) cd scripts, 3) rm token.json, 4) source venv/bin/activate && python gmailScraper.py, 5) Complete OAuth flow in browser'
                }, { status: 400 });
            }
            
            return Response.json({ 
                success: true, 
                message: `Using existing .eml files. Found ${emlFiles.length} files to process.`,
                processed_count: emlFiles.length,
                eml_files: emlFiles,
                user_email: user.email,
                note: 'Using existing files - Gmail authentication not properly configured'
            });
        }

        console.log("✅ Valid Gmail authentication found, running scraper");
        
        // Use process.cwd() to get the current working directory instead of hard-coded path
        const scriptsPath = path.join(process.cwd(), 'scripts');
        const command = `cd "${scriptsPath}" && source venv/bin/activate && python gmailScraper.py`;
        
        console.log(`🔧 Running command: ${command}`);
        
        const { stdout, stderr } = await execAsync(command, { 
            timeout: 60000, // 60 second timeout
            shell: '/bin/zsh',
            cwd: scriptsPath
        });
        
        console.log("✅ Python scraper completed");
        console.log("Stdout:", stdout);
        
        if (stderr) {
            console.warn("Stderr:", stderr);
        }

        // Parse the output to get processed count
        const processedMatch = stdout.match(/Successfully processed: (\d+)/);
        const processedCount = processedMatch ? parseInt(processedMatch[1]) : 0;

        // Get list of .eml files created
        const emailsRawPath = path.join(process.cwd(), 'scripts', 'emails_raw');
        const emlFiles = [];
        
        if (fs.existsSync(emailsRawPath)) {
            const files = fs.readdirSync(emailsRawPath);
            const emlFilesList = files.filter(file => file.endsWith('.eml'));
            
            // Create full file paths for the frontend to access
            emlFilesList.forEach(file => {
                emlFiles.push({
                    filename: file,
                    path: `/scripts/emails_raw/${file}`,
                    id: file.replace('.eml', '')
                });
            });
        }

        console.log(`📧 Found ${emlFiles.length} .eml files to process`);

        return Response.json({ 
            success: true, 
            message: `Gmail scraper completed successfully. Found ${processedCount} emails.`,
            processed_count: processedCount,
            eml_files: emlFiles,
            user_email: user.email
        });
        
    } catch (error) {
        console.error("❌ Gmail scraper error:", error);
        
        return Response.json({ 
            success: false, 
            error: error.message,
            details: error.stdout || error.stderr || 'Unknown error'
        }, { status: 500 });
    }
}