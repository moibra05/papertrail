// Gmail API utilities for scraping receipts

export async function searchGmailReceipts(accessToken) {
    const query = 'subject:"Thank you for your order" OR subject:"receipt" OR subject:"invoice"';
    
    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.messages || [];
    } catch (error) {
        console.error('Error searching Gmail:', error);
        throw error;
    }
}

export async function getGmailMessage(messageId, accessToken) {
    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
        }

        const message = await response.json();
        return message;
    } catch (error) {
        console.error('Error getting Gmail message:', error);
        throw error;
    }
}

export function extractReceiptFromEmail(message) {
    const headers = message.payload?.headers || [];
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    // Extract email body
    let body = '';
    if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload?.parts) {
        // Multi-part message
        for (const part of message.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                body += Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
        }
    }

    return {
        id: message.id,
        subject,
        from,
        date,
        body,
        snippet: message.snippet || '',
    };
}
