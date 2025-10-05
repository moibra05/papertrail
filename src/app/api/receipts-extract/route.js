import { extractReceipt } from "@/utils/ocr";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request) {
    try {
        const formData = await request.formData();
        
        const file = formData.get('raw_receipt'); 
        if (!file) {
          return Response.json({ error: 'No file provided' }, { status: 400 });
        }
        
        const data = await extractReceipt(file);
        
        return Response.json(data);
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
}
