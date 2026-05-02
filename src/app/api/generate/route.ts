import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export async function POST(req: Request) {
  try {
    const { prompt, imageBase64, outputFormat } = await req.json();

    const PROJECT_ID = process.env.PROJECT_ID;
    
    // Initialize GoogleAuth
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const ACCESS_TOKEN = tokenResponse.token;

    if (!PROJECT_ID || !ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Server configuration error: Missing Project ID or Authentication Token' }, { status: 500 });
    }

    const url = `https://aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/global/interactions`;

    const input: any[] = [];
    if (prompt) {
      input.push({
        type: 'text',
        text: prompt
      });
    }

    if (imageBase64) {
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        input.push({
            type: 'image',
            mime_type: 'image/jpeg',
            data: base64Data
        });
    }

    const requestBody = {
      model: outputFormat === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview',
      input: input
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ error: `Vertex AI Error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
