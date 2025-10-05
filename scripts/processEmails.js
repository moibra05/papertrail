#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAILS_DIR = path.join(__dirname, 'emails_raw');
const API_ENDPOINT = 'http://localhost:3000/api/process-emails';

async function processEmlFiles() {
    try {
        
        if (!fs.existsSync(EMAILS_DIR)) {
            return;
        }
        
        const files = fs.readdirSync(EMAILS_DIR).filter(f => f.endsWith('.eml'));
        
        if (files.length === 0) {
            return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const fileName of files) {
            const filePath = path.join(EMAILS_DIR, fileName);
            
            try {
                
                // Read the .eml file
                const fileBuffer = fs.readFileSync(filePath);
                
                // Create FormData
                const { FormData } = await import('formdata-node');
                const { File } = await import('formdata-node/file');
                
                const formData = new FormData();
                const file = new File([fileBuffer], fileName, {
                    type: 'message/rfc822'
                });
                formData.append('eml_file', file);
                
                // Send to API
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.ok) {
                    const result = await response.json();
                    successCount++;
                } else {
                    const errorText = await response.text();
                    errorCount++;
                }
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                errorCount++;
            }
        }

        
    } catch (error) {
        console.error('❌ Script error:', error);
    }
}

// Run the script
processEmlFiles();
