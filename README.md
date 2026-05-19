# Collaborative Code Editor

A real-time collaborative code editor where multiple users can write code simultaneously.

##  Features
- Real-time code synchronization between multiple users
- VS Code like editor experience (Monaco Editor)
- Supports JavaScript syntax highlighting
- WebSocket based live communication

##  Tech Stack
- **Frontend:** React.js, Monaco Editor
- **Backend:** Node.js, Express.js
- **Real-time:** Socket.io (WebSockets)

##  How to Run Locally

### Backend
cd server
npm install
node index.js

### Frontend
cd client
npm install
npm start

##  Open two browser tabs at http://localhost:3000 and type code in one — it appears in the other live!
