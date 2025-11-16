// websocket/chatServer.js
import { WebSocketServer } from 'ws';
import { wsAuthMiddleware } from './wsAuthMiddleware.js';
import User from "../models/User.js";

class ChatServer {
  constructor(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });
    
    this.messages = [];
    this.onlineUsers = new Map();
    
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', async (ws, request) => {
      try {
        // ✅ Используем общую аутентификацию
        const user = await wsAuthMiddleware(request);
        
        // Обновляем lastSeen
        await User.findByIdAndUpdate(user.id, { 
          lastSeen: new Date() 
        });

        const userInfo = {
          id: user.id,
          username: user.username,
          role: user.role,
          ws: ws
        };

        this.onlineUsers.set(ws, userInfo);
        console.log(`💬 User ${user.username} (${user.role}) connected to chat`);

        // Отправляем историю сообщений
        this.sendToUser(ws, {
          type: 'message_history',
          data: this.messages.slice(-50)
        });

        this.broadcastOnlineUsers();

        // Обработка сообщений
        ws.on('message', (data) => this.handleMessage(data, userInfo));
        ws.on('close', () => this.handleDisconnect(ws, userInfo));
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.handleDisconnect(ws, userInfo);
        });

      } catch (error) {
        console.error('WebSocket connection error:', error.message);
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  async handleMessage(data, userInfo) {
    try {
      const messageData = JSON.parse(data.toString());
      
      if (messageData.type === 'chat_message' && messageData.text.trim()) {
        
        if (userInfo.role === 'viewer') {
          this.sendToUser(userInfo.ws, {
            type: 'error',
            data: 'Viewers cannot send messages'
          });
          return;
        }

        const message = {
          id: Date.now(),
          text: messageData.text.trim(),
          user: {
            id: userInfo.id,
            username: userInfo.username,
            role: userInfo.role
          },
          timestamp: new Date().toISOString()
        };

        if (message.text.length > 500) {
          this.sendToUser(userInfo.ws, {
            type: 'error',
            data: 'Message too long (max 500 characters)'
          });
          return;
        }

        this.messages.push(message);
        
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(-50);
        }

        this.broadcast({
          type: 'new_message',
          data: message
        });

        console.log(`💭 ${userInfo.username} (${userInfo.role}): ${message.text}`);
      }

      else if (messageData.type === 'delete_message') {
        this.handleDeleteMessage(messageData.messageId, userInfo);
      }

      else if (messageData.type === 'clear_chat' && userInfo.role === 'admin') {
        this.messages = [];
        this.broadcast({
          type: 'chat_cleared'
        });
        console.log(`🗑️ Admin ${userInfo.username} cleared the chat`);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      this.sendToUser(userInfo.ws, {
        type: 'error',
        data: 'Invalid message format'
      });
    }
  }

  handleDeleteMessage(messageId, userInfo) {
    if (userInfo.role !== 'admin') {
      this.sendToUser(userInfo.ws, {
        type: 'error',
        data: 'Insufficient permissions'
      });
      return;
    }

    const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      this.messages.splice(messageIndex, 1);
      this.broadcast({
        type: 'message_deleted',
        data: messageId
      });
      console.log(`🗑️ Admin ${userInfo.username} deleted message ${messageId}`);
    }
  }

  handleDisconnect(ws, userInfo) {
    this.onlineUsers.delete(ws);
    this.broadcastOnlineUsers();
    console.log(`💬 User ${userInfo?.username} disconnected from chat`);
    
    if (userInfo?.id) {
      User.findByIdAndUpdate(userInfo.id, { 
        lastSeen: new Date() 
      }).catch(console.error);
    }
  }

  sendToUser(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data) {
    const dataString = JSON.stringify(data);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(dataString);
      }
    });
  }

  broadcastOnlineUsers() {
    const onlineUsersList = Array.from(this.onlineUsers.values()).map(user => ({
      id: user.id,
      username: user.username,
      role: user.role
    }));

    this.broadcast({
      type: 'online_users',
      data: onlineUsersList
    });
  }

  sendSystemMessage(text) {
    const message = {
      id: Date.now(),
      text: text,
      user: {
        id: 'system',
        username: 'System',
        role: 'system'
      },
      timestamp: new Date().toISOString(),
      isSystem: true
    };

    this.messages.push(message);
    this.broadcast({
      type: 'new_message',
      data: message
    });
  }
}

export default ChatServer;