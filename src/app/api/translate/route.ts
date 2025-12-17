import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const TRANSLATION_PROMPT = `You are a casual, fun translator specializing in RUSSIAN language - focusing on natural, conversational Russian.

CRITICAL: Use NATURAL RUSSIAN language:

Russian Slang & Expressions (use naturally when appropriate):
- "чувак" (dude, guy)
- "круто/крутой" (cool, awesome)
- "блин" (damn, darn - mild expletive)
- "офигенно" (awesome, amazing)
- "прикольно" (cool, funny)
- "капец" (damn, wow)
- "зашибись" (awesome, great)
- "чё" (what - casual form of "что")
- "нифига себе" (wow, no way)
- "бабки/бабло" (money - slang)
- "тусить/тусоваться" (to hang out, party)
- "классно" (cool, great)
- "короче" (so basically, anyway)
- "типа" (like, kind of)
- "прикинь" (imagine, can you believe)
- "реально" (really, seriously)
- "ваще" (at all, totally - casual "вообще")
- "норм/нормально" (fine, okay)
- "братан/бро" (bro, brother)
- "кайф" (pleasure, bliss - something great)

Russian Characteristics:
- Use natural contractions: "щас" (сейчас), "чё" (что), "ваще" (вообще)
- Conversational fillers: "ну", "типа", "короче", "в общем"
- Diminutives for friendliness: "секундочку", "минуточку"
- Natural word order for spoken Russian
- Use "ты" form for casual translations

IMPORTANT: Provide TWO translations:

1. STANDARD CASUAL: Friendly, casual Russian (ты form) - what you'd say to anyone in everyday conversation
2. STREET/SLANG: Ultra-casual, heavy slang with colloquialisms - authentic street Russian that young people use. Include mild swear words when natural. Don't sanitize - be authentic to how Russians actually speak informally.

IMPORTANT: You must respond with ONLY a JSON object, no additional text or comments. Format:
{
  "translation": "standard casual translation",
  "casual_alternative": "ultra-casual/slang alternative",
  "examples": [
    {
      "text": "example usage for standard translation",
      "english": "English translation of the example"
    }
  ],
  "casual_examples": [
    {
      "text": "example usage for street/slang version",
      "english": "English translation of the example"
    }
  ]
}

Provide 2 examples for each version showing authentic Russian usage. Each example should include both the text in the target language AND its English translation. If translating TO Russian, provide Russian examples with English translations. If translating TO English, provide English examples with their original Russian.`;

export async function POST(request: NextRequest) {
  try {
    const { text, fromLang, toLang } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const direction = fromLang === 'en' ? 'English to Russian' : 'Russian to English';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://russian.vercel.app',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4.5',
        messages: [
          {
            role: 'system',
            content: TRANSLATION_PROMPT
          },
          {
            role: 'user',
            content: `Translate from ${direction}:\n\n${text}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json({ error: 'Translation API failed' }, { status: 500 });
    }

    const completion = await response.json();
    const responseContent = completion.choices?.[0]?.message?.content || '{}';
    console.log('Raw LLM response:', responseContent);

    let parsedResponse;

    try {
      let jsonContent = responseContent.trim();

      // Extract JSON from markdown code blocks if present (handles text before/after)
      const jsonBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        jsonContent = jsonBlockMatch[1].trim();
      }

      // Also try to extract raw JSON object if no code block found
      if (!jsonBlockMatch) {
        const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonContent = jsonObjectMatch[0];
        }
      }

      parsedResponse = JSON.parse(jsonContent);
    } catch (e) {
      console.error('JSON parse error:', e);
      console.error('Failed to parse:', responseContent);

      // Fallback - treat entire response as translation
      parsedResponse = {
        translation: responseContent,
        examples: []
      };
    }

    const translation = parsedResponse.translation || '';
    const casual_alternative = parsedResponse.casual_alternative || '';
    const examples = parsedResponse.examples || [];
    const casual_examples = parsedResponse.casual_examples || [];

    return NextResponse.json({
      translation,
      casual_alternative,
      examples,
      casual_examples,
      original: text,
      fromLang,
      toLang,
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
