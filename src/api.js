export async function fetchYouTubeVideos(accessToken, count) {
  const chanRes = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    { headers: { Authorization: 'Bearer ' + accessToken } }
  );
  const chanData = await chanRes.json();
  if (chanData.error) throw new Error(chanData.error.message);
  const channelName = chanData.items?.[0]?.snippet?.title || 'Your Channel';

  const maxResults = Math.min(count, 50);
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&maxResults=${maxResults}&type=video&order=date`,
    { headers: { Authorization: 'Bearer ' + accessToken } }
  );
  const searchData = await searchRes.json();
  if (searchData.error) throw new Error(searchData.error.message);

  const ids = searchData.items.map((i) => i.id.videoId).join(',');
  const vidRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${ids}`,
    { headers: { Authorization: 'Bearer ' + accessToken } }
  );
  const vidData = await vidRes.json();
  if (vidData.error) throw new Error(vidData.error.message);

  const videos = vidData.items.map((v) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    tags: v.snippet.tags || [],
    thumb: v.snippet.thumbnails?.medium?.url || '',
    status: v.status?.privacyStatus || 'public',
  }));

  return { channelName, videos };
}

export async function analyzeVideo(video) {
  const prompt = `You are a YouTube SEO expert. Respond ONLY with a single raw JSON object, no text before or after it, no explanation, no markdown.

Analyze this video for metadata consistency issues:

TITLE: ${video.title}
DESCRIPTION: ${(video.description || '').slice(0, 600)}${video.description?.length > 600 ? '…' : ''}
TAGS: ${video.tags.length ? video.tags.join(', ') : '(no tags)'}

Check for:
1. Tags completely irrelevant to the topic (e.g. tagging a Japan video with "korea")
2. Keywords prominent in title/description that are missing from tags
3. Contradictions (title says tool/place/year X, description says Y)
4. Tags that look copy-pasted from a different video
5. Missing obvious tags based on the title topic

Return this exact JSON structure:
{
  "score": <0-100>,
  "issues": [
    {
      "severity": "high|medium|low",
      "type": "irrelevant_tag|missing_tag|contradiction|stale_tag|topic_mismatch",
      "title": "<short title>",
      "description": "<1-2 sentences explaining the issue and why it hurts reach>",
      "offending_tags": ["tag"],
      "suggested_tags": ["tag"]
    }
  ],
  "good_tags": ["well-matched tags, max 6"],
  "summary": "<one sentence verdict>"
}

IMPORTANT: Your entire response must be only the JSON object above. Do not write anything else.`;

  const res = await fetch('http://localhost:3001/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'API error');
  }

  const data = await res.json();
  const text = data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');
  return JSON.parse(jsonMatch[0]);
}

export async function updateVideoTags(videoId, tags, accessToken) {
  const res = await fetch('http://localhost:3001/api/update-tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, tags, accessToken }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Update failed');
  }

  return await res.json();
}