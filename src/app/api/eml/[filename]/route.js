import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    try {
        const { filename } = await params;
        const filePath = path.join(process.cwd(), 'scripts', 'emails_raw', filename);
        
        if (!fs.existsSync(filePath)) {
            return new Response('File not found', { status: 404 });
        }
        
        const fileContent = fs.readFileSync(filePath);
        
        return new Response(fileContent, {
            headers: {
                'Content-Type': 'message/rfc822',
                'Content-Disposition': `inline; filename="${filename}"`,
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error serving .eml file:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
