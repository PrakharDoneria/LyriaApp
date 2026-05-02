'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuota } from '@/components/QuotaContext';

// Types
interface Track {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  timestamp: number;
  url: string;
}

export default function Dashboard() {
  const { remaining, total, canGenerate, useQuota: consumeQuota, isBypassed, tryBypass } = useQuota();
  
  // App State
  const [history, setHistory] = useState<Track[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [genType, setGenType] = useState<'text' | 'image' | 'lyrics' | 'pro'>('text');
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sysStats, setSysStats] = useState({ cpu: '--', ram: '--' });
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [bypassEmail, setBypassEmail] = useState('');

  // Refs for Audio and Visualizer
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const visualizerBarsRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('lyria-theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedHistory = JSON.parse(localStorage.getItem('lyria_history') || '[]');
    setHistory(savedHistory);

    updateStats();
    const statsInterval = setInterval(updateStats, 10000);
    return () => clearInterval(statsInterval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lyria-theme', newTheme);
  };

  const updateStats = () => {
    setSysStats({
      cpu: Math.floor(Math.random() * 20 + 5).toString(),
      ram: Math.floor(Math.random() * 30 + 10).toString()
    });
  };

  const initAudioContext = () => {
    if (audioContextRef.current) return;
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      if (audioRef.current) {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
      }
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const loop = () => {
      if (isPlaying && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
        visualizerBarsRef.current.forEach((bar, i) => {
          if (bar && dataArrayRef.current) {
            const val = dataArrayRef.current[i] || 0;
            const height = Math.max(4, (val / 255) * 60);
            const opacity = 0.3 + (val / 255) * 0.7;
            bar.style.height = `${height}px`;
            bar.style.opacity = opacity.toString();
          }
        });
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isPlaying]);

  const playTrack = (track: Track) => {
    initAudioContext();
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play().catch(console.error);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return alert('You have reached your daily limit. Support the creator to get more quota!');
    if (!prompt.trim()) return alert('Enter a prompt first!');
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBase64: genType === 'image' ? uploadedImages[0] : null,
          outputFormat: genType === 'pro' ? 'pro' : outputFormat
        })
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else if (data.status === 'completed' || data.outputs) {
        const outputs = data.outputs || [];
        const audioOutput = outputs.find((o: any) => o.type === 'audio');
        const lyricsOutput = outputs.find((o: any) => o.type === 'text' && o.text.length > 50);
        const audioData = audioOutput?.data || audioOutput?.bytes;

        if (audioData) {
          consumeQuota();
          const audioUrl = `data:audio/mp3;base64,${audioData}`;
          const newTrack: Track = {
            id: Math.random().toString(36).substr(2, 9),
            title: prompt.substring(0, 24) || 'New Track',
            artist: 'Lyria AI',
            lyrics: lyricsOutput?.text || '',
            timestamp: Date.now(),
            url: audioUrl
          };
          const newHistory = [newTrack, ...history];
          setHistory(newHistory);
          localStorage.setItem('lyria_history', JSON.stringify(newHistory));
          setPrompt('');
          setLyrics('');
          setUploadedImages([]);
          playTrack(newTrack);
        }
      }
    } catch (err) { alert('Failed to connect to API'); }
    finally { setIsGenerating(false); }
  };

  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tryBypass(bypassEmail)) {
      alert('Quota unlocked for testing!');
      setShowQuotaModal(false);
    } else {
      alert('Invalid business email.');
    }
  };

  return (
    <div id="app" className="app-container dashboard-page">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <section id="dashboard-screen" className="screen active dashboard-view">
        <aside className="dashboard-sidebar glass">
          <div className="sidebar-top">
            <div className="logo-area">
              <div className="logo-icon">🎵</div>
              <span className="logo-text">LYRIA AI</span>
            </div>
            <nav className="side-nav">
              <div className="nav-item active">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                Create
              </div>
            </nav>
          </div>
          <div className="sidebar-stats">
            <h3>Usage & Quota</h3>
            <div className="usage-pill">
              <div className="usage-item">
                 <div className="usage-info"><span>Daily Generations</span><span>{isBypassed ? '∞' : `${remaining}/${total}`}</span></div>
                 <div className="usage-bar"><div style={{ width: isBypassed ? '100%' : `${(remaining/total)*100}%`, background: 'var(--accent)' }}></div></div>
              </div>
              <button onClick={() => setShowQuotaModal(true)} className="btn-secondary" style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}>
                Get more quota
              </button>
            </div>
          </div>
          <div className="sidebar-footer">
            <div className="theme-switch-wrapper">
              <button onClick={toggleTheme} className="btn-theme-toggle">
                <span className="theme-icon-dark">🌙</span>
                <span className="theme-icon-light">☀️</span>
                <span className="theme-label">Switch Theme</span>
              </button>
            </div>
            <div className="sys-stats-mini">
              <span>CPU: {sysStats.cpu}%</span>
              <span>RAM: {sysStats.ram}%</span>
            </div>
          </div>
        </aside>

        <main className="dashboard-content">
          <header className="content-header">
            <div className="header-welcome">
              <h1>New Generation</h1>
              <p>Create studio-quality music with AI</p>
            </div>
          </header>

          <div className="dashboard-grid">
            <div className="gen-section">
              <div className="gen-categories-row">
                {['text', 'image', 'lyrics', 'pro'].map(type => (
                  <div key={type} className={`category ${genType === type ? 'active' : ''}`} onClick={() => setGenType(type as any)}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} Mode
                  </div>
                ))}
              </div>

              <div className="creation-card glass">
                <div className="input-group">
                  <label>Describe your sound</label>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. A melancholic piano piece..."></textarea>
                </div>
                
                <div className="creation-footer">
                  <div className="format-select">
                    <label>Format</label>
                    <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                      <option value="mp3">High MP3</option>
                      <option value="wav">Studio WAV</option>
                    </select>
                  </div>
                  <button onClick={handleGenerate} disabled={isGenerating || !canGenerate} className="btn-generate-main">
                    <span>{isGenerating ? 'Creating...' : 'Generate Music'}</span>
                    <div className="gen-icon">✨</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="activity-section">
              <div className="history-section">
                <h3>Library</h3>
                <div id="history-container">
                  {history.length === 0 ? <div className="empty-state">No tracks generated yet.</div> : history.map(item => (
                    <div key={item.id} className="history-item glass-hover" onClick={() => playTrack(item)}>
                      <div className="item-visual"><span>🎵</span></div>
                      <div className="item-info"><h4>{item.title}</h4><p>Lyria AI • {new Date(item.timestamp).toLocaleDateString()}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* Quota Modal */}
      {showQuotaModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>Unlock Unlimited Quota</h2>
            <p>Please enter the business/corporate email of my mentor <strong>Harshvardhan Sir</strong> to grant additional testing quota.</p>
            <form onSubmit={handleBypassSubmit}>
              <input 
                type="email" 
                value={bypassEmail} 
                onChange={(e) => setBypassEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="modal-input"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowQuotaModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Overlay */}
      <div className={`player-overlay ${!currentTrack ? 'hidden' : ''}`}>
        <header className="player-header">
          <button onClick={() => setCurrentTrack(null)} className="btn-icon">
            <svg viewBox="0 0 24 24" width="24" height="24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
        </header>
        <div className="player-content">
          <div className="vinyl-display">
            <div className={`vinyl-record ${isPlaying ? 'rotating' : ''}`}><div className="vinyl-label"></div></div>
          </div>
          <div className="track-info">
            <h2>{currentTrack?.title || 'Track Title'}</h2>
            <p>{currentTrack?.artist || 'Artist Name'}</p>
          </div>
          <div className="visualizer-container">
            <div className="player-progress" onClick={(e) => {
              if (!audioRef.current || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pos * duration;
            }}>
              <div id="player-progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>
            <div className="waveform">
              {[...Array(20)].map((_, i) => (
                <span key={i} ref={(el) => { visualizerBarsRef.current[i] = el; }}></span>
              ))}
            </div>
            <div className="time-info">
              <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
              <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          <div className="player-controls">
            <button onClick={togglePlayback} className="btn-play-main">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>
        </div>
        <audio 
          ref={audioRef}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
}
