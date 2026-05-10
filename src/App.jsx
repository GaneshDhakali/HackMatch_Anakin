import { useState, useEffect } from 'react'
import './index.css'

const AVATAR_COLORS = [
  { bg: '#3b82f6', color: '#ffffff' },
  { bg: '#ec4899', color: '#ffffff' },
  { bg: '#8b5cf6', color: '#ffffff' },
  { bg: '#f59e0b', color: '#ffffff' },
  { bg: '#10b981', color: '#ffffff' },
  { bg: '#6366f1', color: '#ffffff' },
]

const DEMO_PROFILES = [
  { name: 'Priya Sharma', username: 'priya-sharma', bio: 'Frontend Engineer', org: 'Razorpay', location: 'Bangalore, India', skills: ['React', 'TypeScript', 'CSS', 'Next.js', 'Figma'], interests: ['fintech', 'design systems', 'open source'] },
  { name: 'Arjun Mehta', username: 'arjun-mehta', bio: 'ML Engineer', org: 'Google', location: 'Hyderabad, India', skills: ['Python', 'PyTorch', 'LLMs', 'Data pipelines', 'MLOps'], interests: ['NLP', 'AI agents', 'research'] },
  { name: 'Sneha Rao', username: 'sneha-rao', bio: 'Product Manager', org: 'Swiggy', location: 'Bangalore, India', skills: ['Product strategy', 'SQL', 'User research', 'A/B testing'], interests: ['food tech', 'growth', 'consumer apps'] },
  { name: 'Karan Patel', username: 'karan-patel', bio: 'Backend Engineer', org: 'Zerodha', location: 'Bangalore, India', skills: ['Go', 'Kafka', 'PostgreSQL', 'Redis', 'gRPC'], interests: ['fintech', 'high performance systems', 'trading'] },
  { name: 'Divya Nair', username: 'divya-nair', bio: 'Designer', org: 'Notion', location: 'Mumbai, India', skills: ['Figma', 'Prototyping', 'Design systems', 'User research'], interests: ['productivity', 'B2B SaaS', 'design ops'] },
  { name: 'Marcus Chen', username: 'mchen', bio: 'Fullstack Dev', org: 'Stripe', location: 'Singapore', skills: ['Ruby', 'React', 'PostgreSQL', 'Redis', 'Docker'], interests: ['payments', 'API design'] },
  { name: 'Sarah Jenkins', username: 'sjenk', bio: 'DevRel Engineer', org: 'Vercel', location: 'London, UK', skills: ['Next.js', 'JavaScript', 'Public speaking', 'Documentation'], interests: ['developer experience', 'serverless'] },
]

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getAvatarColor(name) {
  let h = 0
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[Math.abs(h)]
}

function Avatar({ name, size = 48 }) {
  const c = getAvatarColor(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '16px',
      background: c.bg, color: c.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
      boxShadow: `0 8px 16px ${c.bg}44`,
      border: '2px solid rgba(255,255,255,0.1)'
    }}>
      {getInitials(name)}
    </div>
  )
}

function profileLabel(p) {
  if (p.bio) return p.bio
  if (p.org) return `@${p.org}`
  if (p.skills?.length > 0) return `${p.skills[0]} developer`
  return 'Hackathon Attendee'
}

const FRONTEND = ['React', 'Vue', 'Angular', 'TypeScript', 'CSS', 'Figma', 'Next.js', 'Svelte', 'Tailwind']
const BACKEND = ['Go', 'Node.js', 'Python', 'Java', 'PostgreSQL', 'Redis', 'Kafka', 'gRPC', 'Django', 'FastAPI', 'Rust', 'Ruby']

function scoreMatch(me, them) {
  const sharedSkills = (me.skills || []).filter(s => (them.skills || []).includes(s))
  const sharedInterests = (me.interests || []).filter(i => (them.interests || []).includes(i))
  const myIsFront = (me.skills || []).some(s => FRONTEND.includes(s))
  const theyIsBack = (them.skills || []).some(s => BACKEND.includes(s))
  const complements = (myIsFront && theyIsBack) ? (them.skills || []).filter(s => BACKEND.includes(s)).slice(0, 2) : []
  
  const score = Math.min(98, 40 + sharedInterests.length * 15 + sharedSkills.length * 8 + complements.length * 10)
  const parts = []
  if (sharedInterests.length) parts.push(`Both interested in ${sharedInterests.slice(0, 2).join(' and ')}`)
  if (complements.length) parts.push(`Their ${complements[0]} skills complement your frontend work`)
  if (sharedSkills.length) parts.push(`Shared experience with ${sharedSkills.slice(0, 2).join(' and ')}`)
  if (!parts.length) parts.push(`${profileLabel(them)} — worth meeting at this hackathon`)
  
  return { score, sharedSkills, sharedInterests, complements, reason: parts.join('. ') + '.' }
}

function extractProfile(markdown, url) {
  const username = url.split('github.com/')[1]?.replace(/\//g, '') || 'you'

  let name = username
  const titleMatch = markdown.match(/^(.+?)\s*[·(]\s*(?:GitHub|[a-z0-9_-]+\s*·)/im)
  const h1Match = markdown.match(/^#\s+(.+)/m)
  if (titleMatch) name = titleMatch[1].trim().replace(/\s*[·(].*$/, '').trim()
  else if (h1Match) name = h1Match[1].trim().replace(/\s*[·(].*$/, '').trim()
  name = name.replace(new RegExp('\\s+' + username + '$', 'i'), '').trim() || username

  let bio = ''
  const nameIdx = markdown.indexOf(name)
  if (nameIdx !== -1) {
    const candidates = markdown.slice(nameIdx + name.length).split('\n')
      .map(l => l.trim().replace(/^#+\s*/, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))
      .filter(l => l.length > 3 && l.length < 200 && !l.startsWith('http') && !/^[-*]/.test(l) && !/^\d+/.test(l) && !/^@/.test(l) && !l.includes('github.com'))
    if (candidates[0]) bio = candidates[0].length > 80 ? candidates[0].slice(0, 80) + '...' : candidates[0]
  }

  const orgMatch = markdown.match(/@([A-Za-z0-9][A-Za-z0-9_-]+)/)
  const org = orgMatch ? orgMatch[1] : ''

  const locationMatch = markdown.match(/📍\s*([^\n]+)|🌍\s*([^\n]+)|Location:\s*([^\n]+)/m)
  const location = locationMatch ? (locationMatch[1] || locationMatch[2] || locationMatch[3] || '').trim() : ''

  const skillWords = [
    'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift', 
    'TypeScript', 'JavaScript', 'C++', 'C#', 'Ruby', 'PHP', 'LLM', 'SQL', 'Figma', 'Next.js', 
    'PostgreSQL', 'Redis', 'Kafka', 'PyTorch', 'TensorFlow', 'AWS', 'GCP', 'Docker', 
    'Kubernetes', 'FastAPI', 'Tailwind', 'GraphQL', 'Prisma', 'Supabase', 'Firebase'
  ]
  const skills = skillWords.filter(s => {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // If the skill ends with a non-word char (like C++), don't use \b at the end
    const pattern = /[a-zA-Z0-9]$/.test(s) ? `\\b${escaped}\\b` : `\\b${escaped}`
    return new RegExp(pattern, 'i').test(markdown)
  })
  const interests = [
    'fintech', 'healthtech', 'edtech', 'logistics', 'AI', 'open source', 'developer tools', 
    'consumer', 'B2B', 'SaaS', 'gaming', 'crypto', 'machine learning', 'web3', 'mobile',
    'infrastructure', 'security', 'data science'
  ].filter(i => markdown.toLowerCase().includes(i.toLowerCase()))

  return { name, username, bio, org, location, skills: skills.slice(0, 7), interests: interests.slice(0, 5) }
}

function MatchCard({ m }) {
  return (
    <article className="match-card" id={`match-${m.username}`}>
      <div className="match-header">
        <Avatar name={m.name} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white' }}>{m.name}</div>
          {(m.bio || m.role) && (
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{m.bio || m.role}</div>
          )}
          {(m.org || m.company) && (
            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, marginTop: 4 }}>
              @{m.org || m.company}{m.location ? ` · ${m.location}` : ''}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{m.score}%</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>match</div>
        </div>
      </div>
      <div className="skills-row">
        {m.skills.map(s => <span key={s} className={`skill-tag ${(m.sharedSkills || []).includes(s) ? 'shared' : ''}`}>{s}</span>)}
      </div>
      {m.aiInsight && (
        <div className="reason">
          <span style={{ color: 'var(--primary)', marginRight: 8 }}>✦</span>
          {m.aiInsight}
        </div>
      )}
      {m.insightError && (
        <div className="reason" style={{ borderColor: 'var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <span style={{ color: 'var(--error)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>AI Insight Error</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{m.insightError}</span>
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 16 }}>{m.reason}</div>
      <a href={`https://github.com/${m.username}`} target="_blank" rel="noopener noreferrer" className="connect-btn" id={`connect-${m.username}`}>
        View GitHub Profile →
      </a>
    </article>
  )
}

export default function App() {
  const [tab, setTab] = useState('join')
  const [githubUrl, setGithubUrl] = useState('')
  const [status, setStatus] = useState({ msg: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [myProfile, setMyProfile] = useState(null)
  const [attendees, setAttendees] = useState(DEMO_PROFILES)
  const [matches, setMatches] = useState([])

  async function handleJoin() {
    if (!githubUrl.includes('github.com/')) {
      setStatus({ msg: 'Please enter a valid GitHub profile URL', type: 'error' }); return
    }
    setLoading(true)
    setStatus({ msg: 'Scraping your profile via Anakin...', type: 'loading' })
    let profile
    try {
      const resp = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl })
      })
      if (!resp.ok) throw new Error(`${resp.status}`)
      const data = await resp.json()
      setStatus({ msg: 'Extracting skills and interests...', type: 'loading' })
      profile = extractProfile(data.markdown || data.content || '', githubUrl)
      setStatus({ msg: `Profile loaded! You're in the pool.`, type: 'success' })
    } catch (e) {
      console.error(e)
      setStatus({ msg: `Scrape error. Using default profile.`, type: 'error' })
      const slug = githubUrl.split('github.com/')[1]?.replace(/\//g, '') || 'you'
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      profile = { name, username: slug, bio: 'Hackathon Enthusiast', org: '', location: 'Global', skills: ['React', 'Node.js', 'Python'], interests: ['AI', 'open source'] }
    }
    
    setMyProfile(profile)
    const newAttendees = attendees.some(a => a.username === profile.username)
      ? attendees : [...attendees, profile]
    setAttendees(newAttendees)
    
    const scored = newAttendees
      .filter(a => a.username !== profile.username)
      .map(a => ({ ...a, ...scoreMatch(profile, a) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    setStatus({ msg: 'Generating AI match insights...', type: 'loading' })
    await Promise.all(scored.map(async match => {
      try {
        const insightResp = await fetch('/api/generate-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person1: profile, person2: match })
        })
        const data = await insightResp.json()
        if (data.insight) match.aiInsight = data.insight
        if (data.error) match.insightError = data.error
      } catch (e) {
        match.insightError = e.message
      }
    }))

    setMatches(scored)
    setStatus({ msg: '', type: '' })
    setLoading(false)
    setTab('matches')
  }

  return (
    <main className="app">
      <header className="header">
        <span className="badge">Powered by Anakin.io & Groq</span>
        <h1>HackMatch</h1>
        <p>Intelligent networking for the next generation of builders.</p>
      </header>

      <nav className="tab-row">
        {[
          ['join', 'Get Started'], 
          ['matches', `My Matches${matches.length ? ` (${matches.length})` : ''}`], 
          ['attendees', `Attendees (${attendees.length})`]
        ].map(([id, label]) => (
          <button 
            key={id} 
            id={`tab-${id}`}
            className={`tab ${tab === id ? 'active' : ''}`} 
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'join' && (
        <section className="fade-in">
          <div className="card" id="join-card">
            <h2 className="field-label">Join the Event</h2>
            <div className="input-row">
              <input 
                type="text" 
                id="github-url-input"
                placeholder="https://github.com/username" 
                value={githubUrl} 
                onChange={e => setGithubUrl(e.target.value)} 
                className="text-input" 
              />
              <button 
                id="join-btn"
                className="primary-btn" 
                onClick={handleJoin} 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Analyze & Join'}
              </button>
            </div>
            {status.msg && <div className={`status ${status.type}`}>{status.msg}</div>}
            
            {myProfile && (
              <div className="my-profile fade-in">
                <Avatar name={myProfile.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'white' }}>{myProfile.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{profileLabel(myProfile)}</div>
                  <div className="skills-row" style={{ marginTop: 8 }}>
                    {myProfile.skills.slice(0, 5).map(s => <span key={s} className="skill-tag" style={{ background: 'var(--primary)', color: 'white', borderColor: 'transparent' }}>{s}</span>)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card how-it-works">
            <h2 className="field-label">How it works</h2>
            <div className="steps-grid">
              {[
                ['Connect GitHub', 'Anakin scrapes your profile — bio, languages, and activity.'],
                ['Join the Pool', 'You are added to our real-time attendee directory.'],
                ['Smart Matching', 'AI analyzes skill complementarity and shared interests.'],
                ['Insta-Connect', 'Get deep insights on why you should collaborate.'],
              ].map(([title, desc], i) => (
                <div key={i} className="step">
                  <div className="step-num">{i + 1}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'white' }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'matches' && (
        <section className="fade-in">
          {!myProfile && <div className="empty">Join the event first to see your matches</div>}
          {matches.map(m => <MatchCard key={m.username} m={m} />)}
        </section>
      )}

      {tab === 'attendees' && (
        <section className="fade-in card">
          <h2 className="field-label">Event Attendees</h2>
          <div className="attendees-grid">
            {attendees.map(a => (
              <div key={a.username} className="attendee-chip">
                <Avatar name={a.name} size={40} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profileLabel(a)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
