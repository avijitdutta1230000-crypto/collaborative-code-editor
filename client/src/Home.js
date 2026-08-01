import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    setRoomId(uuidv4());
  };

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      alert('Please enter both Room ID and Username');
      return;
    }
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  return (
    <div style={styles.container}>
      {/* Background Subtle Grid Pattern */}
      <div style={styles.gridOverlay} />

      {/* Main Form Card */}
      <div style={styles.card}>
        
        {/* Brand Header */}
        <div style={styles.header}>
          <div style={styles.badge}>
            <span style={styles.badgeDot} /> v2.0 Live Sync
          </div>
          <h1 style={styles.title}>
            Code<span style={{ color: '#007acc' }}>Sync</span>
          </h1>
          <p style={styles.subtitle}>
            Enter workspace credentials to start real-time pair programming.
          </p>
        </div>

        {/* Inputs */}
        <div style={styles.formGroup}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>
              <span style={styles.commentKey}>username</span>
            </label>
            <input
              type="text"
              placeholder="e.g. alex_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              style={styles.input}
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label}>
              <span style={styles.commentKey}>room_id</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Paste or generate Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                style={{ ...styles.input, flex: 1 }}
              />
              <button onClick={createNewRoom} style={styles.genButton} title="Generate UUID">
                ⚡ New
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button onClick={joinRoom} style={styles.joinButton}>
          <span>Enter Workspace</span>
          <span style={{ fontSize: '16px' }}>→</span>
        </button>

        {/* Footer info */}
        <div style={styles.footer}>
          <span>Powered by Piston Execution Engine</span>
        </div>

      </div>
    </div>
  );
}

// Modern High-Contrast Code Aesthetic
const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0b0d10',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontFamily: "'Fira Code', Consolas, Monaco, monospace",
    color: '#c9d1d9',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(#1f242d 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
    opacity: 0.6,
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '36px 32px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1)',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '28px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: 'rgba(0, 122, 204, 0.15)',
    border: '1px solid rgba(0, 122, 204, 0.4)',
    borderRadius: '20px',
    fontSize: '11px',
    color: '#58a6ff',
    fontWeight: '500',
    marginBottom: '12px',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#3fb950',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#f0f6fc',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#8b949e',
    margin: 0,
    lineHeight: '1.5',
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '28px',
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    color: '#8b949e',
  },
  commentKey: {
    color: '#79c0ff',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    color: '#f0f6fc',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  genButton: {
    padding: '0 14px',
    backgroundColor: '#21262d',
    border: '1px solid #30363d',
    borderRadius: '6px',
    color: '#c9d1d9',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  joinButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#238636',
    border: '1px solid rgba(240, 246, 252, 0.1)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(35, 134, 54, 0.3)',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#484f58',
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
};