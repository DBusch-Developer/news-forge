import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export type Brief = {
  summary: string;
  why_it_matters: string;
  your_take_prompt: string;
  discussion_questions: string[];
  topic_tags: string[];
};

const BRIEF_SYSTEM_PROMPT = `You are helping a cohort of new developers prep 2-minute presentation briefs about AI news articles. They will read your output aloud to peers in a Monday morning share.

Return a brief in this exact JSON shape:

{
  "summary": "2-3 sentences. Plain language. No hype. What is the article about?",
  "why_it_matters": "1-2 sentences. Why should a builder or developer care? Editorial framing, not just restating the article.",
  "your_take_prompt": "One starter sentence the presenter can finish with their own opinion. Format: 'I think this is [adjective] because...'",
  "discussion_questions": ["Exactly 3 thought-provoking questions. One per array item. Open-ended (not yes/no). Ask about implications, ethics, or future directions."],
  "topic_tags": ["2-3 short tags. lowercase. Examples: 'reasoning', 'open source', 'policy'"]
}

Return ONLY the JSON object. No preamble. No markdown fences. No commentary.`;

export async function generateBrief({
  title,
  source,
  text,
}: {
  title: string;
  source: string;
  text: string;
}): Promise<Brief> {
  // Truncate very long articles to keep token usage reasonable
  const truncated = text.length > 8000 ? text.slice(0, 8000) + '...' : text;

  const userPrompt = `Article from ${source}:

Title: ${title}

Content:
${truncated}

Generate the brief now.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: BRIEF_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 1000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from Groq');
  }

  return JSON.parse(content) as Brief;
}

const CURATION_SYSTEM_PROMPT = `You are curating the top 5 most important AI news stories of the past week for a cohort of new developers learning to build with AI.

Given a list of articles with titles, sources, and excerpts, pick the 5 most worth their attention.

Prioritize:
- Capability advances (new models, benchmarks, breakthroughs)
- Builder-relevant news (APIs, tools, platforms, pricing)
- Policy or regulation that affects what they can build
- Stories with broad implications, not narrow product updates

Avoid:
- Hype with no substance
- Multiple stories on the same angle (pick the strongest one)

Return JSON in this exact shape:

{
  "picks": [
    { "article_index": 0, "reasoning": "One short editorial sentence on why this matters this week." }
  ]
}

Include exactly 5 picks, ranked from most to least important. article_index is the 0-indexed position of the article in the input list. Return ONLY the JSON object. No preamble, no markdown.`;

export type WeeklyPick = {
  article_index: number;
  reasoning: string;
};

export async function generateWeeklyPicks(
  articles: Array<{ title: string; source: string; excerpt: string | null }>
): Promise<WeeklyPick[]> {
  const articleList = articles
    .map(
      (a, i) =>
        `${i}. [${a.source}] ${a.title}\n   ${(a.excerpt ?? '').slice(0, 200)}`
    )
    .join('\n\n');

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: CURATION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Articles from the past week:\n\n${articleList}\n\nPick the top 5.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq');

  const data = JSON.parse(content) as { picks: WeeklyPick[] };
  return data.picks;
}