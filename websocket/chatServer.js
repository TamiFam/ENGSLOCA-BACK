// websocket/chatServer.js
import { WebSocketServer } from 'ws';
import { wsAuthMiddleware } from './wsAuthMiddleware.js';
import User from "../models/User.js";

class ChatServer {
  constructor(server) {
    console.log('🔄 Starting WebSocket server...');
    
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });
    
    this.messages = [];
    this.onlineUsers = new Map();
    
    this.setupWebSocket();
    console.log('✅ WebSocket server ready');
  }

  setupWebSocket() {
    this.wss.on('connection', async (ws, request) => {
      console.log('🔌 New WebSocket connection attempt');
      
      try {
        const user = await wsAuthMiddleware(request);
        console.log(`✅ User authenticated: ${user.username}`);
        
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

        // Уведомляем всех о новом пользователе
        this.broadcastOnlineUsers();

        // Обработка сообщений
        ws.on('message', (data) => this.handleMessage(data, userInfo));

        // Обработка отключения
        ws.on('close', () => this.handleDisconnect(ws, userInfo));

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.handleDisconnect(ws, userInfo);
        });

      } catch (error) {
        console.error('❌ WebSocket connection failed:', error.message);
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  async handleMessage(data, userInfo) {
    try {
      const messageData = JSON.parse(data.toString());
      console.log('📨 Received message from client:', messageData);
      
      if (messageData.type === 'chat_message' && messageData.text.trim()) {
        
        console.log('👤 User info:', userInfo); // ← ДОБАВЬТЕ ЭТОТ ЛОГ
        
        // Проверяем права на отправку сообщений
        if (userInfo.role === 'viewer') {
          console.log('🚫 Viewer tried to send message:', userInfo.username);
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
  
        console.log('💭 Creating new message:', message);
  
        // Валидация длины сообщения
        if (message.text.length > 500) {
          this.sendToUser(userInfo.ws, {
            type: 'error',
            data: 'Message too long (max 500 characters)'
          });
          return;
        }
  
        // Сохраняем сообщение
        this.messages.push(message);
        console.log('💾 Messages count after save:', this.messages.length); // ← ДОБАВЬТЕ ЭТОТ ЛОГ
        
        // Ограничиваем историю
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(-50);
        }
  
        // Рассылаем всем
        console.log('📢 Broadcasting to', this.wss.clients.size, 'clients'); // ← ДОБАВЬТЕ ЭТОТ ЛОГ
        
        this.broadcast({
          type: 'new_message',
          data: message
        });
  
        console.log(`✅ Message broadcasted: ${userInfo.username}: ${message.text}`);
      }
  
    } catch (error) {
      console.error('❌ Error processing message:', error);
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
    
    // Обновляем lastSeen при отключении
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
    console.log('🔄 Starting broadcast...'); // ← ДОБАВЬТЕ ЭТОТ ЛОГ
    const dataString = JSON.stringify(data);
    let sentCount = 0;
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(dataString);
        sentCount++;
        console.log(`📤 Sent to client ${sentCount}`); // ← ДОБАВЬТЕ ЭТОТ ЛОГ
      }
    });
    
    console.log(`✅ Broadcast completed. Sent to ${sentCount} clients`); // ← ДОБАВЬТЕ ЭТОТ ЛОГ
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

  // Метод для отправки системных сообщений
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