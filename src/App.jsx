import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://safenet-backend-eyhx.onrender.com')).replace(/\/$/, '');

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const textArea = useRef(null);
  useEffect(() => {
    if (textArea.current) {
      textArea.current.style.height = 'auto';
      textArea.current.style.height = textArea.current.scrollHeight + 'px';
    }
  }, [text]);

  async function analyze(event) {
    event.preventDefault();
    if (loading) return;
    if (!text.trim()) {
      setResult('Please enter a link, email address, or message.');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const response = await axios.post(API_BASE + '/detect_phishing', { text: text.trim() }, { timeout: 25000 });
      setResult(response.data.analysis || 'No analysis was returned.');
    } catch (error) {
      setResult(error.response?.data?.error || 'Unable to reach the analysis service. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gradient-background">
      <div className="logo-placeholder"><img src="/pngegg.png" className="logo-image" alt="SafeNet logo" /></div>
      <h1 className="main-title">SafeNet</h1>
      <p className="subtitle">Review links, email addresses, and text for possible phishing indicators.</p>
      <div className="categories-container" aria-label="Supported inputs">
        {['Email addresses', 'Website links', 'Message text'].map(label => <div className="category-card" key={label}><h2>{label}</h2></div>)}
      </div>
      <form className="analysis-form" onSubmit={analyze} aria-busy={loading}>
        <label htmlFor="analysis-input">Link, address, or message</label>
        <textarea id="analysis-input" ref={textArea} className="auto-textarea" value={text} onChange={event => setText(event.target.value)} maxLength={8000} disabled={loading} aria-describedby="privacy-note" placeholder="Paste content to review" />
        <p id="privacy-note" className="privacy-note">Submitted URLs go to Google Safe Browsing. Message text goes to OpenAI. Use synthetic examples and exclude passwords or personal information. Results do not establish safety or sender identity.</p>
        <button className="analyze-button" type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Analyze'}</button>
      </form>
      <div className="result-area" role="status" aria-live="polite">{result && <p>{result}</p>}</div>
    </main>
  );
}
