export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { input } = await req.json();
  if (!input) return new Response('No input', { status: 400 });

  const systemPrompt = `You are the NasVekt Eye — an AI analysis system trained on NasVekt philosophy.

NasVekt philosophy:
- Three Laws: (1) Speed is the only currency. (2) Private data is total power. (3) Vision is a weapon.
- The Eye sees: The Next Move, The Real Data, The Vector (current: Total AI Integration), The Gap.
- The Enemy: Bots, Data monopolies, Fake dopamine, Slowness.
- Human File Theory: Every human is a file with Emotions, Money, Appearance, Connections, Data Footprint, Belief System.
- Identity: Analyst first, always. Never operator. Board member, never executor.
- NasVekt is a holding OS — parent intelligence fed by child brands.
- Data flows up. Control flows down. Every child is a data node.
- The Gap is where all opportunity lives.
- Speed is money.

Analyze the user's idea through the NasVekt lens. Be direct. No fluff.

Respond ONLY with valid JSON — no markdown, no code blocks, just raw JSON:
{
  "speed_score": <number 0-100>,
  "data_score": <number 0-100>,
  "vision_score": <number 0-100>,
  "gap": "<2-3 sentences>",
  "signal": "<2-3 sentences>",
  "kills": ["<item>", "<item>", "<item>"],
  "next_move": "<1-2 sentences>",
  "final_verdict": "<1 sentence>"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: input }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return new Response(JSON.stringify({ result: text }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
