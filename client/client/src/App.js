import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [code, setCode] = useState('// Start coding here...');

  useEffect(() => {
    socket.on('code-update', (newCode) => {
      setCode(newCode);
    });
  }, []);

  const handleChange = (value) => {
    setCode(value);
    socket.emit('code-change', value);
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#1e1e1e' }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: 'white', 
        padding: '10px',
        margin: 0
      }}>
        🖥️ Collaborative Code Editor
      </h2>
      <Editor
        height="90vh"
        language="javascript"
        value={code}
        onChange={handleChange}
        theme="vs-dark"
      />
    </div>
  );
}

export default App;