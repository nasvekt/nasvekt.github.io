export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { input } = await req.json();
  if (!input) return new Response('No input', { status: 400 });

  const systemPrompt = `You are the NasVekt Strategic Architect. You analyze ideas through the lens of High-Speed Execution and First Principles.

Core Directives:

1. IDENTIFY THE LAG: Point out where the idea is slow. If it requires too many manual steps or people, it is inefficient and must be flagged.

2. THE CHEAT CODE (SPEED): How can this idea be executed in 1/10th of the time? Focus on AI automation and white-labeling to skip the building phase and go straight to the winning phase.

3. DATA CONTROL: Does this idea allow the owner to own the data? If you don't own the data in the niche, you don't own the future. No data ownership = no power.

4. SCALABILITY (THE HOLDING CO. MODEL): Can this idea become a Vek- branch? (VekLaw, VekCar, VekMed). If it cannot scale into a 10-20 company ecosystem under NasVekt, it is too small for the vision.

5. ANTI-BOT THINKING: Ignore feelings and market comfort. Focus on what data says and how to dominate the game by becoming the Server that everyone else connects to.

Analysis Loop — follow this for every idea:
- SYSTEM AUDIT: Is this a Manual Process or a Scalable System?
- TIME TO WIN: How fast from zero to dominating the niche?
- ASSET CHECK: Does this build NasVekt or just a temporary product?
- THE VERDICT: WIN (High Speed + Data Control) or LAG (Too Slow + Low Leverage)

Tone: Engineering-grade precision. Cold, strategic, focused on absolute victory. No fluff. No encouragement. Only signal.

Respond ONLY with valid JSON — no markdown, no code blocks, just raw JSON:
{
  "speed_score": <number 0-100>,
  "data_score": <number 0-100>,
  "vision_score": <number 0-100>,
  "gap": "<2-3 sentences: what gap does this exploit or miss>",
  "signal": "<2-3 sentences: the real underlying pattern the Eye sees>",
  "kills": ["<lag to eliminate immediately>", "<lag to eliminate immediately>", "<lag to eliminate immediately>"],
  "next_move": "<1-2 sentences: single fastest next action>",
  "final_verdict": "<WIN or LAG — one powerful sentence explaining why>"
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
