import { useState } from 'react'

const ALGORITHMS = [
  { value: 'luhn', label: 'Luhn' },
  { value: 'lexrank', label: 'LexRank' },
  { value: 'lsa', label: 'LSA' },
  { value: 'textrank', label: 'TextRank' },
  { value: 'sumbasic', label: 'SumBasic' },
  { value: 'edmundson', label: 'Edmundson' },
]

export default function Summarizer() {
  const [text, setText] = useState('')
const [sentences, setSentences] = useState(3)
const [algorithm, setAlgorithm] = useState('luhn')
const [loading, setLoading] = useState(false)
const [summary, setSummary] = useState(null)   // ✅ fixed
const [error, setError] = useState(null)


  const handleSummarize = async () => {
    setLoading(true)
    setSummary(null)
    setError(null)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sentences, algorithm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to summarize')
      setSummary(data.summary)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    }
 finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h1>Sumy Summarizer</h1>

      <label style={{ display: 'block', marginTop: '1rem' }}>
        <div>Input Text</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          style={{ width: '100%' }}
          placeholder="Paste text to summarize…"
        />
      </label>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <label>
          Sentences:&nbsp;
          <input
            type="number"
            min={1}
            max={10}
            value={sentences}
            onChange={(e) => setSentences(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>

        <label>
          Algorithm:&nbsp;
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || !text.trim()}
        style={{ marginTop: '1rem' }}
      >
        {loading ? 'Summarizing…' : 'Summarize'}
      </button>

      {error && (
        <p style={{ color: 'crimson', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      {summary && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  )
}

// in app.jsx:
import Summarizer from './Summarizer'

export default function App() {
  return <Summarizer />
}
