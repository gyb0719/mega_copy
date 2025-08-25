import { Server as HTTPServer } from 'http';
export interface NotificationData {
    type: 'order' | 'payment' | 'review' | 'product' | 'system';
    title: string;
    message: string;
    data?: any;
    userId?: string;
    priority: 'low' | 'medium' | 'high';
    timestamp: Date;
}
export interface ConnectedUser {
    userId: string;
    socketId: string;
    role: string;
    joinedAt: Date;
}
declare class SocketService {
    private static instance;
    private io;
    private connectedUsers;
    private userSockets;
    private constructor();
    static getInstance(): SocketService;
    initialize(httpServer: HTTPServer): void;
    private setupMiddleware;
    private setupEventHandlers;
    private handleConnection;
    private handleDisconnection;
    private handleJoinRoom;
    private handleLeaveRoom;
    private handleSubscribeNotifications;
    private handleMarkNotificationRead;
    private handleJoinAdminRoom;
    private handleBroadcastAnnouncement;
    sendNotificationToUser(userId: string, notification: NotificationData): void;
    sendNotificationToRole(role: string, notification: NotificationData): void;
    broadcastToAll(event: string, data: any): void;
    sendToRoom(room: string, event: string, data: any): void;
    sendRealtimeStats(stats: any): void;
    notifyOrderStatusUpdate(userId: string, orderData: any): void;
    notifyPaymentSuccess(userId: string, paymentData: any): void;
    notifyLowStock(productData: any): void;
    notifyNewReview(reviewData: any): void;
    getConnectedUsersCount(): number;
    isUserOnline(userId: string): boolean;
    getOnlineAdmins(): ConnectedUser[];
    private generateNotificationId;
    cleanup(): void;
}
export default SocketService;
//# sourceMappingURL=socketService.d.ts.map