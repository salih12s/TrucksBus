import io, { Socket } from 'socket.io-client';
import { store } from '../store';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId: number) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
      
      // Join user's personal room for notifications
      this.socket?.emit('join_user_room', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Listen for new messages
    this.socket.on('newMessage', (message) => {
      console.log('New message received:', message);
      // Dispatch action to update Redux store
      store.dispatch({ type: 'messages/newMessageReceived', payload: message });
      
      // Show notification if user is not on messages page
      if (!window.location.pathname.includes('/messages')) {
        this.showNotification('Yeni Mesaj', message.content, `/messages`);
      }
    });

    // Listen for unread count updates
    this.socket.on('updateUnreadCount', () => {
      console.log('Unread count update received');
      // Trigger unread count refresh
      store.dispatch({ type: 'messages/refreshUnreadCount' });
    });

    // Listen for new notifications
    this.socket.on('newNotification', () => {
      console.log('New notification received');
      // Trigger notification refresh
      store.dispatch({ type: 'notifications/refreshNotifications' });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  private showNotification(title: string, body: string, url?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/Trucksbus.png',
        badge: '/Trucksbus.png'
      });

      if (url) {
        notification.onclick = () => {
          window.focus();
          window.location.href = url;
          notification.close();
        };
      }

      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
}

const socketService = new SocketService();

export { socketService, SocketService };
export default socketService;
