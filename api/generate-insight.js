export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { person1, person2 } = req.body
  if (!person1 || !person2) return res.status(400).json({ error: 'Both profiles required' })

  try {
    console.log('Using Groq Key:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.slice(0, 7)}... (len: ${process.env.GROQ_API_KEY.length})` : 'MISSING')
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 60,
        messages: [
          {
            role: 'user',
            content: `Person 1: ${person1.name}, works at ${person1.org || 'unknown'}, skills: ${person1.skills.join(', ')}, location: ${person1.location || 'unknown'}
Person 2: ${person2.name}, works at ${person2.org || 'unknown'}, skills: ${person2.skills.join(', ')}, location: ${person2.location || 'unknown'}
Write one sentence max 12 words: why should these two collaborate at a hackathon today? Mention their actual skills. No quotes. No punctuation at end.`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        return res.status(response.status).json({ error: errorJson.error?.message || `Groq error: ${response.status}` })
      } catch (e) {
        return res.status(response.status).json({ error: `Groq error ${response.status}: ${errorText.slice(0, 100)}` })
      }
    }

    const data = await response.json()
    const insight = data.choices?.[0]?.message?.content?.trim()
    
    if (!insight) {
      return res.status(200).json({ error: 'AI returned an empty response' })
    }
    
    res.status(200).json({ insight })
  } catch (e) {
    console.error('API Error:', e)
    res.status(500).json({ error: `Server error: ${e.message}` })
  }
}
