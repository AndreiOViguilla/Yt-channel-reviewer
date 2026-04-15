const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', (req, res) => {
  const userMessage = req.body.messages[0].content;
  const body = JSON.stringify({
    model: 'llama3',
    prompt: userMessage,
    stream: false,
    format: 'json',
    options: { temperature: 0.1 }
  });

  const options = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => data += chunk);
    proxyRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        let text = parsed.response || '';
        text = text.replace(/```json|```/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ error: { message: 'No JSON in response' } });
        JSON.parse(jsonMatch[0]);
        res.json({ content: [{ type: 'text', text: jsonMatch[0] }] });
      } catch (e) {
        res.status(500).json({ error: { message: 'Parse error: ' + e.message } });
      }
    });
  });

  proxyReq.on('error', (e) => res.status(500).json({ error: { message: 'Ollama not running. Run: ollama serve' } }));
  proxyReq.write(body);
  proxyReq.end();
});

app.post('/api/update-video', (req, res) => {
  const { videoId, title, description, tags, accessToken } = req.body;

  const getOptions = {
    hostname: 'www.googleapis.com',
    path: `/youtube/v3/videos?part=snippet&id=${videoId}`,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + accessToken },
  };

  const getReq = https.request(getOptions, (getRes) => {
    let getData = '';
    getRes.on('data', chunk => getData += chunk);
    getRes.on('end', () => {
      try {
        const video = JSON.parse(getData);
        if (video.error) return res.status(500).json({ error: { message: video.error.message } });

        const snippet = video.items[0].snippet;
        snippet.title = title;
        snippet.description = description;
        snippet.tags = tags;

        const putBody = JSON.stringify({ id: videoId, snippet });
        const putOptions = {
          hostname: 'www.googleapis.com',
          path: '/youtube/v3/videos?part=snippet',
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(putBody),
          },
        };

        const putReq = https.request(putOptions, (putRes) => {
          let putData = '';
          putRes.on('data', chunk => putData += chunk);
          putRes.on('end', () => {
            const result = JSON.parse(putData);
            if (result.error) return res.status(500).json({ error: { message: result.error.message } });
            res.json({ success: true });
          });
        });

        putReq.on('error', e => res.status(500).json({ error: { message: e.message } }));
        putReq.write(putBody);
        putReq.end();
      } catch (e) {
        res.status(500).json({ error: { message: 'Parse error: ' + e.message } });
      }
    });
  });

  getReq.on('error', e => res.status(500).json({ error: { message: e.message } }));
  getReq.end();
});

app.post('/api/scan-links', (req, res) => {
  const { description, title } = req.body;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = (description.match(urlRegex) || []).slice(0, 5);

  const skipDomains = ['photopea.com','canva.com','discord.gg','discord.com','twitter.com','instagram.com','facebook.com','t.co','bit.ly','youtube.com','youtu.be','tiktok.com','linkedin.com','pinterest.com'];
  const scannable = urls.filter(url => !skipDomains.some(d => url.includes(d)));

  if (!scannable.length) {
    generateTagsFromText(title, description, '', res);
    return;
  }

  fetchPage(scannable[0], title, description, res);
});

function fetchPage(url, title, description, res) {
  try {
    const targetUrl = new URL(url);
    const lib = targetUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: targetUrl.hostname,
      path: targetUrl.pathname + targetUrl.search,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
    };
    const pageReq = lib.request(options, (pageRes) => {
      if (pageRes.statusCode === 301 || pageRes.statusCode === 302) {
        const redirectUrl = pageRes.headers.location;
        if (redirectUrl) { fetchPage(redirectUrl, title, description, res); return; }
      }
      let html = '';
      pageRes.on('data', chunk => { html += chunk; if (html.length > 100000) html = html.slice(0, 100000); });
      pageRes.on('end', () => {
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 2000);
        generateTagsFromText(title, description, text, res);
      });
    });
    pageReq.on('error', () => generateTagsFromText(title, description, '', res));
    pageReq.end();
  } catch (e) {
    generateTagsFromText(title, description, '', res);
  }
}

function generateTagsFromText(title, description, pageText, res) {
  const prompt = `You are a YouTube SEO expert. Based on the video metadata and any additional context from linked pages, suggest the best tags for this video.

VIDEO TITLE: ${title}
VIDEO DESCRIPTION: ${description.slice(0, 500)}
LINKED PAGE CONTENT: ${pageText ? pageText.slice(0, 1000) : 'No linked page content available.'}

Generate 15-20 highly relevant YouTube tags. Consider:
1. The main topic of the video
2. Specific keywords from the title
3. Related terms people would search for
4. Any relevant context from the linked page
5. Avoid generic tags like "video", "youtube", "watch"

Respond ONLY with a valid JSON object, no markdown:
{
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "reasoning": "one sentence explaining the tag strategy"
}`;

  const body = JSON.stringify({
    model: 'llama3',
    prompt,
    stream: false,
    format: 'json',
    options: { temperature: 0.2 }
  });

  const options = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  };

  const aiReq = http.request(options, (aiRes) => {
    let data = '';
    aiRes.on('data', chunk => data += chunk);
    aiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        let text = parsed.response || '';
        text = text.replace(/```json|```/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ error: { message: 'No JSON in response' } });
        res.json(JSON.parse(jsonMatch[0]));
      } catch (e) {
        res.status(500).json({ error: { message: 'Parse error: ' + e.message } });
      }
    });
  });

  aiReq.on('error', () => res.status(500).json({ error: { message: 'Ollama not running' } }));
  aiReq.write(body);
  aiReq.end();
}

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));