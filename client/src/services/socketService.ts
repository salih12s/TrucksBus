import io, { Socket } from "socket.io-client";
import { store } from "../store";

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private userId: number | null = null;

  connect(userId: number) {
    // Eğer aynı kullanıcı için zaten bağlıysa, mevcut socket'i döndür
    if (this.socket && this.isConnected && this.userId === userId) {
      return this.socket;
    }

    // Farklı bir kullanıcı için bağlantı isteniyorsa, önce mevcut bağlantıyı kapat
    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;

    const serverUrl = (
      import.meta.env.VITE_API_URL ||
      "https://trucksbus-production.up.railway.app/api"
    ).replace("/api", "");

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    console.log("🔌 Socket.io bağlantısı başlatılıyor:", serverUrl);

    this.socket.on("connect", () => {
      console.log("✅ Socket.io sunucusuna bağlandı");
      this.isConnected = true;

      // Join user's personal room for notifications
      this.socket?.emit("join_user_room", userId);
      console.log(`👤 Kullanıcı odası: user_${userId}`);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket bağlantısı kesildi:", reason);
      this.isConnected = false;
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Socket yeniden bağlandı (deneme: ${attemptNumber})`);
      // Yeniden bağlandığında kullanıcı odasına tekrar katıl
      this.socket?.emit("join_user_room", userId);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket bağlantı hatası:", error.message);
      this.isConnected = false;
    });

    // Listen for new messages
    this.socket.on("newMessage", (message) => {
      console.log("New message received:", message);

      // Get current user ID from Redux store
      const state = store.getState();
      const currentUserId = state.auth.user?.id;

      // Dispatch action to update Redux store with current user context
      store.dispatch({
        type: "messaging/newMessageReceived",
        payload: { message, currentUserId },
      });

      // Show notification if user is not on messages page
      if (!window.location.pathname.includes("/messages")) {
        this.showNotification("Yeni Mesaj", message.content, `/messages`);
      }
    });

    // Listen for unread count updates
    this.socket.on("updateUnreadCount", () => {
      console.log("Unread count update received");
      // Mesaj sayfasında değilsek unread count'u güncelle
      if (!window.location.pathname.includes("/messages")) {
        // Trigger unread count refresh
        import("../store/messagingSlice").then(({ fetchUnreadCount }) => {
          store.dispatch(fetchUnreadCount());
        });
      }
    });

    // Listen for new notifications
    this.socket.on("newNotification", () => {
      console.log("New notification received");
      // Trigger notification refresh
      store.dispatch({ type: "notifications/refreshNotifications" });
    });

    // Listen for notification events (from ad approval, rejection, subscription)
    this.socket.on(
      "notification",
      (data: { title: string; message: string; type: string }) => {
        console.log("Notification event received:", data);
        // Show browser notification
        this.showNotification(data.title, data.message);
        // Trigger notification refresh
        store.dispatch({ type: "notifications/refreshNotifications" });
      },
    );

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Socket bağlantısı kapatılıyor...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  private showNotification(title: string, body: string, url?: string) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/Trucksbus.png",
        badge: "/Trucksbus.png",
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

  getSocket() {
    return this.socket;
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }
}

const socketService = new SocketService();

export { socketService, SocketService };
export default socketService;
