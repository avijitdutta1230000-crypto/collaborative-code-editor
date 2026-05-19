import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function Home() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = uuidv4();
    if (!username) {
      alert('Please enter your name!');
      return;
    }
    navigate(`/room/${newRoomId}`, { state: { username } });
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      alert('Please enter your name and Room ID!');
      return;
    }
    navigate(`/room/${roomId}`, { state: { username } });
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1e1e1e',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        backgroundColor: '#2d2d2d',
        padding: '40px',
        borderRadius: '10px',
        width: '400px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#007acc', marginBottom: '30px' }}>
          🖥️ Collaborative Editor
        </h1>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px',
            borderRadius: '5px',
            border: '1px solid #007acc',
            backgroundColor: '#1e1e1e',
            color: 'white',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
        />

        {/* Room ID Input */}
        <input
          type="text"
          placeholder="Enter Room ID (to join)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '5px',
            border: '1px solid #007acc',
            backgroundColor: '#1e1e1e',
            color: 'white',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
        />

        {/* Buttons */}
        <button
          onClick={createRoom}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          ➕ Create New Room
        </button>

        <button
          onClick={joinRoom}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          🚪 Join Room
        </button>
      </div>
    </div>
  );
}

export default Home;