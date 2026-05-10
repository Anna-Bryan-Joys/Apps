require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.json());
app.use(express.static('public'));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const sessions = new Map();
const RECIPES_DIR = path.join(__dirname, 'public', 'recipes');

const SYSTEM_PROMPT = `You are a warm, knowledgeable cooking companion helping to preserve and complete handwritten recipe notes. You understand that recipes carry memory, imprecision, and love. You fill gaps thoughtfully, ask only what matters, and write with warmth.`;

// Read a recipe from an image or raw text
app.post('/api/read', upload.single('image'), async (req, res) => {
  try {
    const content = [];

    if (req.file) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: req.file.mimetype, data: req.file.buffer.toString('base64') },
      });
    }

    const inputText = req.file
      ? 'Transcribe and analyse this handwritten or informal recipe card.'
      : `Analyse these informal recipe notes:\n\n${req.body.text}`;

    content.push({
      type: 'text',
      text: `${inputText}

Return ONLY valid JSON (no markdown) with this shape:
{
  "title": "recipe name or your best guess",
  "ingredients": ["ingredient with quantity"],
  "steps": ["each step"],
  "notes": "any tips, context, or margin notes",
  "questions": ["specific practical question where something is unclear or missing — only ask if it would actually affect the outcome"],
  "story": "one warm sentence about what this dish might be or mean, based on any clues"
}`,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    });

    const raw = response.content[0].text;
    const recipe = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

    const sessionId = Date.now().toString();
    sessions.set(sessionId, { recipe, messages: [] });

    res.json({ sessionId, recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Conversational clarification
app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.messages.push({ role: 'user', content: message });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
      {
        type: 'text',
        text: `The recipe being refined:\n${JSON.stringify(session.recipe, null, 2)}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: session.messages,
  });

  const reply = response.content[0].text;
  session.messages.push({ role: 'assistant', content: reply });

  res.json({ reply });
});

// Produce the final beautiful recipe
app.post('/api/finalize', async (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const convo = session.messages.length
    ? `\n\nClarifications from conversation:\n${session.messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
    : '';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Create a complete, beautiful recipe from these notes and clarifications.

Original: ${JSON.stringify(session.recipe)}${convo}

Return ONLY valid JSON:
{
  "title": "final title",
  "tagline": "one evocative line — the feeling of this dish",
  "servings": "serves X",
  "time": "X mins / X hours",
  "ingredients": [{"amount": "...", "item": "..."}],
  "steps": ["full clear steps"],
  "notes": "chef's notes, tips, variations",
  "story": "1–2 warm sentences about this dish's meaning or origin"
}`,
    }],
  });

  const raw = response.content[0].text;
  const final = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

  const slug = final.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
  fs.writeFileSync(path.join(RECIPES_DIR, `${slug}.json`), JSON.stringify(final, null, 2));

  res.json({ recipe: final });
});

// Saved recipes
app.get('/api/recipes', (_req, res) => {
  const files = fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith('.json'));
  const recipes = files.map(f => {
    const r = JSON.parse(fs.readFileSync(path.join(RECIPES_DIR, f)));
    return { title: r.title, tagline: r.tagline, slug: f.replace('.json', '') };
  });
  res.json(recipes.reverse());
});

app.get('/api/recipes/:slug', (req, res) => {
  const file = path.join(RECIPES_DIR, `${req.params.slug}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(fs.readFileSync(file)));
});

const PORT = process.env.PORT || 3131;
app.listen(PORT, () => console.log(`From the Card → http://localhost:${PORT}`));
