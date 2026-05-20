import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { useParams, useLocation } from 'react-router-dom';

const socket = io('http://localhost:5000');

const LANGUAGES = [
  { name: 'JavaScript', value: 'javascript', pistonName: 'javascript' },
  { name: 'Python',     value: 'python',     pistonName: 'python' },
  { name: 'Java',       value: 'java',       pistonName: 'java' },
  { name: 'C++',        value: 'cpp',        pistonName: 'c++' },
  { name: 'TypeScript', value: 'typescript', pistonName: 'typescript' },
];

function Editor() {
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || 'Anonymous';

  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [users, setUsers] = useState([]);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    socket.emit('join-room', { roomId, username });

    socket.on('code-update', (newCode) => setCode(newCode));
    socket.on('language-update', (newLang) => {
      const found = LANGUAGES.find(l => l.value === newLang);
      if (found) setLanguage(found);
    });
    socket.on('users-update', (userList) => setUsers(userList));

    return () => {
      socket.off('code-update');
      socket.off('language-update');
      socket.off('users-update');
    };
  }, [roomId, username]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    const selected = LANGUAGES.find(l => l.value === e.target.value);
    setLanguage(selected);
    socket.emit('language-change', { roomId, language: selected.value });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied! Share it with others 🎉');
  };

  const downloadCode = () => {
    const extensions = {
      javascript: 'js', python: 'py', java: 'java',
      cpp: 'cpp', typescript: 'ts',
    };
    const ext = extensions[language.value] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
  };
 const runCode = async () => {
  setRunning(true);
  setOutput('Running...');

  try {
    const res = await fetch('http://localhost:5000/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: language.pistonName,
      }),
    });

    const data = await res.json();
    console.log('API Response:', data);
    const out = data.run?.stdout || data.run?.stderr || 'No output';
    setOutput(out);
  } catch (err) {
    setOutput('Error: ' + err.message);
  }

  setRunning(false);
};
  return (
    <div style={{ height: '100vh', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        backgroundColor: '#007acc',
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>🖥️ Collaborative Editor</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          <span style={{ color: 'white' }}>👥 {users.length} online</span>

          <select
            value={language.value}
            onChange={handleLanguageChange}
            style={{
              padding: '8px',
              borderRadius: '5px',
              backgroundColor: '#1e1e1e',
              color: 'white',
              border: '1px solid white',
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.name}
              </option>
            ))}
          </select>

          <button onClick={copyRoomId} style={{
            padding: '8px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
            📋 Copy Room ID
          </button>

          <button onClick={downloadCode} style={{
            padding: '8px 12px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
            ⬇️ Download
          </button>

          <button onClick={runCode} disabled={running} style={{
            padding: '8px 12px',
            backgroundColor: running ? '#555' : '#e83e8c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: running ? 'not-allowed' : 'pointer',
          }}>
            {running ? '⏳ Running...' : '▶️ Run Code'}
          </button>

        </div>
      </div>

      {/* Editor + Output */}
      <div style={{ display: 'flex', flex: 1 }}>

        <div style={{ flex: 1 }}>
          <MonacoEditor
            height="100%"
            language={language.value}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
          />
        </div>

        <div style={{
          width: '300px',
          backgroundColor: '#0d0d0d',
          color: '#00ff00',
          padding: '15px',
          fontFamily: 'monospace',
          fontSize: '14px',
          overflowY: 'auto',
          borderLeft: '2px solid #007acc',
        }}>
          <h3 style={{ color: '#007acc', marginTop: 0 }}>📤 Output</h3>
          <pre>{output || 'Click ▶️ Run Code to see output here!'}</pre>
        </div>

      </div>
    </div>
  );
}

export default Editor;