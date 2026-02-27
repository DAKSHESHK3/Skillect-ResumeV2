// SKILLECT.AI — Multi-provider API proxy
// Providers: Claude, Mistral, Groq, Cohere, OpenRouter, Together AI

const PROVIDERS = {

  claude: {
    name: 'Claude',
    call: async (body, apiKey) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: body.max_tokens || 4000,
          system: body.system,
          messages: body.messages,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return (data.content || []).map(b => b.text || '').join('').trim();
    },
  },

  mistral: {
    name: 'Mistral',
    call: async (body, apiKey) => {
      const messages = buildOpenAIMessages(body);
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'mistral-small-latest', messages, max_tokens: body.max_tokens || 4000, temperature: 0.3 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      return data.choices?.[0]?.message?.content?.trim() || '';
    },
  },

  groq: {
    name: 'Groq',
    call: async (body, apiKey) => {
      const messages = buildOpenAIMessages(body);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: body.max_tokens || 4000, temperature: 0.3 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      return data.choices?.[0]?.message?.content?.trim() || '';
    },
  },

  cohere: {
    name: 'Cohere',
    call: async (body, apiKey) => {
      const userMsg = flattenMessages(body.messages);
      const res = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'command-r-plus-08-2024',
          messages: [
            ...(body.system ? [{ role: 'system', content: body.system }] : []),
            { role: 'user', content: userMsg },
          ],
          max_tokens: body.max_tokens || 4000,
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      if (data.message && !data.message.content) throw new Error(data.message || JSON.stringify(data));
      return data.message?.content?.[0]?.text?.trim() || '';
    },
  },

  openrouter: {
    name: 'OpenRouter',
    call: async (body, apiKey) => {
      const messages = buildOpenAIMessages(body);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://resume-ai.vercel.app',
          'X-Title': 'SKILLECT.AI',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages,
          max_tokens: body.max_tokens || 4000,
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return data.choices?.[0]?.message?.content?.trim() || '';
    },
  },

  together: {
    name: 'Together AI',
    call: async (body, apiKey) => {
      const messages = buildOpenAIMessages(body);
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
          messages,
          max_tokens: body.max_tokens || 4000,
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return data.choices?.[0]?.message?.content?.trim() || '';
    },
  },

};

// Helpers
function buildOpenAIMessages(body) {
  const msgs = [];
  if (body.system) msgs.push({ role: 'system', content: body.system });
  (body.messages || []).forEach(m => {
    const content = typeof m.content === 'string' ? m.content
      : (m.content || []).map(c => c.text || '').join(' ');
    msgs.push({ role: m.role, content });
  });
  return msgs;
}

function flattenMessages(messages) {
  return (messages || []).map(m =>
    typeof m.content === 'string' ? m.content
      : (m.content || []).map(c => c.text || '').join(' ')
  ).join('\n');
}

// Merge panel results
function mergeAnalyses(results) {
  const valid = results.filter(r => r.success).map(r => r.data);
  if (valid.length === 0) throw new Error('All providers failed. Check API keys in Vercel env vars.');
  if (valid.length === 1) return { ...valid[0], _panel: true, _providers: results };

  const avgScore = Math.round(valid.reduce((s, a) => s + (a.overallScore || 0), 0) / valid.length);
  const names = results.filter(r => r.success).map(r => r.provider);

  const mergeArr = (key, idField) => {
    const seen = new Set();
    return valid.flatMap(a => a[key] || []).filter(item => {
      const id = (item[idField] || '').toLowerCase().slice(0, 40);
      if (seen.has(id)) return false;
      seen.add(id); return true;
    });
  };
  const mergeStrs = (key, limit = 6) => {
    const seen = new Set();
    return valid.flatMap(a => a[key] || []).filter(s => {
      const k = s.toLowerCase().slice(0, 35);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    }).slice(0, limit);
  };

  return {
    name: valid[0].name,
    currentRole: valid[0].currentRole,
    overallScore: avgScore,
    scoreReason: `Judge Panel (${names.join(' · ')}): Avg ${avgScore}/100. ${valid[0].scoreReason || ''}`,
    resumeImprovements: mergeArr('resumeImprovements', 'section'),
    skillGaps: mergeArr('skillGaps', 'skill'),
    learningResources: mergeArr('learningResources', 'resourceName'),
    opportunities: mergeArr('opportunities', 'name'),
    strengths: mergeStrs('strengths'),
    quickWins: mergeStrs('quickWins'),
    _panel: true,
    _providers: results,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { provider = 'claude', panel = false, ...body } = req.body;

    // Whitelist only fields AI providers accept
    const cleanBody = {
      system:     body.system,
      messages:   body.messages,
      max_tokens: body.max_tokens || 4000,
    };

    // Panel mode — run all configured providers in parallel
    if (panel) {
      const allProviders = [
        { key: 'claude',      apiKey: process.env.ANTHROPIC_API_KEY },
        { key: 'mistral',     apiKey: process.env.MISTRAL_API_KEY },
        { key: 'groq',        apiKey: process.env.GROQ_API_KEY },
        { key: 'cohere',      apiKey: process.env.COHERE_API_KEY },
        { key: 'openrouter',  apiKey: process.env.OPENROUTER_API_KEY },
        { key: 'together',    apiKey: process.env.TOGETHER_API_KEY },
      ].filter(p => p.apiKey);

      if (allProviders.length === 0) {
        return res.status(400).json({ error: 'No API keys configured. Add at least one in Vercel env vars.' });
      }

      const results = await Promise.all(
        allProviders.map(async ({ key, apiKey }) => {
          try {
            const text = await PROVIDERS[key].call(cleanBody, apiKey);
            const data = JSON.parse(text.replace(/```json|```/g, '').trim());
            return { provider: PROVIDERS[key].name, success: true, data };
          } catch (e) {
            return { provider: PROVIDERS[key].name, success: false, error: e.message };
          }
        })
      );

      return res.status(200).json({ result: mergeAnalyses(results), panel: results });
    }

    // Single provider mode
    const apiKeyMap = {
      claude:     process.env.ANTHROPIC_API_KEY,
      mistral:    process.env.MISTRAL_API_KEY,
      groq:       process.env.GROQ_API_KEY,
      cohere:     process.env.COHERE_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
      together:   process.env.TOGETHER_API_KEY,
    };

    const apiKey = apiKeyMap[provider];
    if (!apiKey) return res.status(400).json({ error: `No API key set for "${provider}". Add ${provider.toUpperCase().replace('OPENROUTER','OPENROUTER').replace('TOGETHER','TOGETHER')}_API_KEY in Vercel env vars.` });

    if (!PROVIDERS[provider]) return res.status(400).json({ error: `Unknown provider: ${provider}` });

    const text = await PROVIDERS[provider].call(cleanBody, apiKey);
    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
