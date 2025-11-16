// websocket/chatServer.js - упрощенная версия
import { WebSocketServer } from 'ws';

class ChatServer {
  constructor(server) {
    console.log('🔄 Starting WebSocket server...');
    
    try {
      this.wss = new WebSocketServer({ 
        server,
        path: '/ws'
      });
      console.log('✅ WebSocket server created');
    } catch (error) {
      console.error('❌ WebSocket server failed:', error);
      return; // Не прерываем выполнение
    }
    
    this.setupWebSocket();
  }

  setupWebSocket() {
    console.log('🔧 Setting up WebSocket handlers...');
    
    this.wss.on('connection', (ws, request) => {
      console.log('🎉 New WebSocket connection!');
      
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to chat server'
      }));
      
      ws.on('message', (data) => {
        console.log('📨 Received message:', data.toString());
      });
      
      ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
      });
    });
    
    console.log('✅ WebSocket setup complete');
  }
}

export default ChatServer;