import { createClient } from "../../../../utils/supabase/server";

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return Response.json({ 
                error: 'You must be logged in to parse emails.',
                auth_required: true 
            }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('eml_file');
        
        if (!file) {
            return Response.json({ error: 'No .eml file provided' }, { status: 400 });
        }

        const emlContent = await file.text();
        
        const receiptInfo = parseEmailForReceipt(emlContent);
        
        return Response.json(receiptInfo);
        
    } catch (error) {
        console.error(" Parse EML error:", error);
        
        return Response.json({ 
            success: false, 
            error: error.message
        }, { status: 500 });
    }
}

function parseEmailForReceipt(emlContent) {
    try {
        const textMatch = emlContent.match(/Content-Type: text\/plain[\s\S]*?\n\n([\s\S]*?)(?=\n--|\n----|$)/);
        const htmlMatch = emlContent.match(/Content-Type: text\/html[\s\S]*?\n\n([\s\S]*?)(?=\n--|\n----|$)/);
        
        let emailText = '';
        
        if (textMatch && textMatch[1]) {
            emailText = textMatch[1].trim();
        } else if (htmlMatch && htmlMatch[1]) {
            emailText = htmlMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        
        const subjectMatch = emlContent.match(/^Subject: (.+)$/m);
        const subject = subjectMatch ? subjectMatch[1].trim() : '';
        
        const fromMatch = emlContent.match(/^From: (.+)$/m);
        const from = fromMatch ? fromMatch[1].trim() : '';
        
        const receiptPatterns = {
            merchant: extractMerchant(emailText, subject, from),
            total_amount: extractAmount(emailText),
            purchase_date: extractDate(emailText),
            receipt_number: extractReceiptNumber(emailText),
            category: 'other'
        };
        
        if (receiptPatterns.merchant && receiptPatterns.total_amount) {
            return {
                success: true,
                ...receiptPatterns,
                raw_text: emailText,
                subject: subject
            };
        } else {
            return {
                success: false,
                error: 'No valid receipt data found in email',
                raw_text: emailText,
                subject: subject
            };
        }
        
    } catch (error) {
        console.error('Error parsing email:', error);
        return {
            success: false,
            error: 'Failed to parse email content'
        };
    }
}

function extractMerchant(text, subject, from) {
    const emailMatch = from.match(/<([^@]+)@([^>]+)>/);
    if (emailMatch) {
        const domain = emailMatch[2];
        const merchant = domain.replace(/\.(com|org|net|co\.uk)$/, '').replace(/^(www\.|mail\.|noreply\.|no-reply\.)/, '');
        if (merchant && merchant.length > 2) {
            return merchant.charAt(0).toUpperCase() + merchant.slice(1);
        }
    }
    
    const merchantPatterns = [
        /Receipt from (.+?)(?:\s|$)/i,
        /Your (.+?) order/i,
        /(.+?) purchase confirmation/i,
        /Thank you for your (.+?) order/i
    ];
    
    for (const pattern of merchantPatterns) {
        const match = subject.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    const domainMatch = from.match(/@([^>]+)/);
    if (domainMatch) {
        const domain = domainMatch[1].split('.')[0];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
    
    return null;
}

function extractAmount(text) {
    const amountPatterns = [
        /\$(\d+\.?\d*)/g,
        /Total[:\s]*\$?(\d+\.?\d*)/i,
        /Amount[:\s]*\$?(\d+\.?\d*)/i,
        /(\d+\.?\d*)\s*USD/i
    ];
    
    const amounts = [];
    
    for (const pattern of amountPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const amount = parseFloat(match[1]);
            if (amount > 0) {
                amounts.push(amount);
            }
        }
    }
    
    return amounts.length > 0 ? Math.max(...amounts) : null;
}

function extractDate(text) {
    const datePatterns = [
        /(\d{1,2}\/\d{1,2}\/\d{4})/,
        /(\d{4}-\d{1,2}-\d{1,2})/,
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
    ];
    
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            try {
                const date = new Date(match[1] || match[0]);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            } catch (e) {
                continue;
            }
        }
    }
    
    return new Date().toISOString().split('T')[0];
}

function extractReceiptNumber(text) {
    const receiptPatterns = [
        /Receipt\s*#?:?\s*([A-Z0-9]+)/i,
        /Order\s*#?:?\s*([A-Z0-9]+)/i,
        /Transaction\s*#?:?\s*([A-Z0-9]+)/i,
        /#([A-Z0-9]{6,})/
    ];
    
    for (const pattern of receiptPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}