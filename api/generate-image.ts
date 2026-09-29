import type { VercelRequest, VercelResponse } from '@vercel/node';
import { InferenceClient } from '@huggingface/inference';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    const {
      prompt,
      width = 1024,
      height = 576,
    } = req.body ?? {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required',
      });
    }

    const token = process.env.HF_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: 'HF_TOKEN is not configured',
      });
    }

    const client = new InferenceClient(token);

    const finalPrompt = `
${prompt.trim()}

Generate a high-quality photorealistic image.
Sharp focus, detailed textures, realistic lighting,
natural colors, professional photography, clean composition.
Do not intentionally blur the image.
    `.trim();

    const imageBlob = await client.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: finalPrompt,
    });

    const imageBuffer = Buffer.from(
      await imageBlob.arrayBuffer()
    );

    res.setHeader(
      'Content-Type',
      imageBlob.type || 'image/png'
    );

    res.setHeader(
      'Cache-Control',
      'no-store'
    );

    return res.status(200).send(imageBuffer);
  } catch (error) {
    console.error(
      'Hugging Face image generation error:',
      error
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Image generation failed',
    });
  }
}