import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { useParams, useLocation } from 'react-router-dom';

// Initialize Socket connection
const socket = io('http://localhost:5000');

const LANGUAGES = [
  { name: 'JavaScript', value: 'javascript', pistonName: 'javascript' },
  { name: 'Python',     value: 'python',     pistonName: 'python' },
  { name: 'Java',       value: 'java',       pistonName: 'java' },
  { name: 'C++',        value: 'cpp',        pistonName: 'c++' },
  { name: 'TypeScript', value: 'typescript', pistonName: 'typescript' },
];

// Default boilerplates so the editor isn't blank on switch
const STARTER_CODE = {
  javascript: '// JavaScript Environment\nconsole.log("Hello, World!");',
  python: '# Python Environment\nprint("Hello, World!")',
  java: '// Java Environment\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World!");\n  }\n}',
  cpp: '// C++ Environment\n#include <iostream>\n\nint main() {\n  std::cout << "Hello World!";\n  return 0;\n}',
  typescript: '// TypeScript Environment\nconst msg: string = "Hello World!";\nconsole.log(msg);'
};

function Editor() {
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || 'Anonymous';

  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [users, setUsers] = useState([]);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    socket.emit('join-room', { roomId, username });

    socket.on('code-update', (newCode) => setCode(newCode));
    socket.on('language-update', (newLang) => {
      const found = LANGUAGES.find((l) => l.value === newLang);
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
    const selected = LANGUAGES.find((l) => l.value === e.target.value);
    setLanguage(selected);
    
    // Automatically set default starter code when changing language
    const newCode = STARTER_CODE[selected.value] || '// Start typing...';
    setCode(newCode);

    socket.emit('language-change', { roomId, language: selected.value });
    socket.emit('code-change', { roomId, code: newCode });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied! Share it with others 🎉');
  };

  const downloadCode = () => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      typescript: 'ts',
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
    setOutput('Running code...');
    const currentLanguage = typeof language === 'object' 
    ? (language.pistonName || language.value) 
    : language;

    try {
      const res = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          language: currentLanguage,
        }),
      });

      const data = await res.json();
      console.log('Server Output:', data);
      const outputText = 
      data.run?.output || 
      data.run?.stdout || 
      data.run?.stderr || 
      (data.message ? `Error: ${data.message}` : 'Code executed with no output.');
      
      setOutput(outputText); // <--- HERE! You saved it into 'outputText', but called 'setOutput(out)'
    } catch (err) {
      setOutput('Error connecting to execution server: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>

      {/* VS Code Dark Style Header Navbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #3c3c3c'
      }}>
        {/* Left Side: App Name + Room Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ color: '#007acc', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            ⚡ CodeSync
          </h3>
          <span style={{ color: '#858585', fontSize: '12px' }}>
            Room: <strong style={{ color: '#cccccc' }}>{roomId}</strong>
          </span>
          <span style={{ color: '#4ec9b0', fontSize: '12px' }}>
            👥 {users.length} Active
          </span>
        </div>

        {/* Right Side: Language Dropdown + Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Language Selector */}
          <select
            value={language.value}
            onChange={handleLanguageChange}
            style={{
              padding: '4px 8px',
              borderRadius: '3px',
              backgroundColor: '#3c3c3c',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Copy Room Button */}
          <button onClick={copyRoomId} style={{
            padding: '5px 10px',
            backgroundColor: '#3a3d41',
            color: '#cccccc',
            border: 'none',
            borderRadius: '2px',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            📋 Share Room
          </button>

          {/* Download Button */}
          <button onClick={downloadCode} style={{
            padding: '5px 10px',
            backgroundColor: '#3a3d41',
            color: '#cccccc',
            border: 'none',
            borderRadius: '2px',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            ⬇️ Export File
          </button>

          {/* Run Code Button */}
          <button onClick={runCode} disabled={running} style={{
            padding: '5px 14px',
            backgroundColor: running ? '#555555' : '#0e639c',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: running ? 'not-allowed' : 'pointer',
          }}>
            {running ? '⏳ Executing...' : '▶ Run Code'}
          </button>

        </div>
      </div>

      {/* Editor & Terminal Panel Area */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Monaco Editor Section */}
        <div style={{ flex: 1 }}>
          <MonacoEditor
            height="100%"
            language={language.value}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
            }}
          />
        </div>

        {/* Console / Output Panel */}
        <div style={{
          width: '320px',
          backgroundColor: '#181818',
          color: '#d4d4d4',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #3c3c3c',
        }}>
          {/* Output Header Bar */}
          <div style={{
            backgroundColor: '#252526',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#858585',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #3c3c3c'
          }}>
            Terminal / Output
          </div>

          {/* Output Terminal Output Window */}
          <pre style={{
            padding: '12px',
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '13px',
            color: '#4ec9b0',
            whiteSpace: 'pre-wrap',
            margin: 0,
            flex: 1,
            overflowY: 'auto'
          }}>
            {output || '// Click "▶ Run Code" to display execution output here.'}
          </pre>
        </div>

      </div>
    </div>
  );
}

export default Editor;