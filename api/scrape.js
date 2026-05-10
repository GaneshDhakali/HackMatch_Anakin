export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })

  try {
    const response = await fetch('https://api.anakin.io/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANAKIN_KEY}`
      },
      body: JSON.stringify({ url, format: 'markdown', useBrowser: true })
    })
    const data = await response.json()
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
