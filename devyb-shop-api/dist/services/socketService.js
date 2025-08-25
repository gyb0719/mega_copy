"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const config_1 = __importDefault(require("../config"));
const auth_1 = require("../middleware/auth");
class SocketService {
    static instance;
    io = null;
    connectedUsers = new Map();
    userSockets = new Map();
    constructor() { }
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: config_1.default.FRONTEND_URL,
                methods: ['GET', 'POST'],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });
        this.setupMiddleware();
        this.setupEventHandlers();
        console.log('✅ Socket.IO 서버가 초기화되었습니다');
    }
    setupMiddleware() {
        if (!this.io)
            return;
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('인증 토큰이 필요합니다.'));
                }
                const user = await (0, auth_1.extractUserFromToken)(token);
                if (!user) {
                    return next(new Error('유효하지 않은 토큰입니다.'));
                }
                socket.data.user = user;
                next();
            }
            catch (error) {
                next(new Error('인증 실패'));
            }
        });
    }
    setupEventHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
            socket.on('join_room', (room) => this.handleJoinRoom(socket, room));
            socket.on('leave_room', (room) => this.handleLeaveRoom(socket, room));
            socket.on('subscribe_notifications', () => this.handleSubscribeNotifications(socket));
            socket.on('mark_notification_read', (notificationId) => this.handleMarkNotificationRead(socket, notificationId));
            socket.on('disconnect', () => this.handleDisconnection(socket));
            if (socket.data.user.role === 'admin') {
                socket.on('join_admin_room', () => this.handleJoinAdminRoom(socket));
                socket.on('broadcast_announcement', (data) => this.handleBroadcastAnnouncement(socket, data));
            }
        });
    }
    handleConnection(socket) {
        const user = socket.data.user;
        const connectedUser = {
            userId: user._id.toString(),
            socketId: socket.id,
            role: user.role,
            joinedAt: new Date()
        };
        this.connectedUsers.set(socket.id, connectedUser);
        const userSocketIds = this.userSockets.get(user._id.toString()) || new Set();
        userSocketIds.add(socket.id);
        this.userSockets.set(user._id.toString(), userSocketIds);
        socket.join(`user:${user._id}`);
        socket.join(`role:${user.role}`);
        console.log(`👤 사용자 연결됨: ${user.name} (${user.email}) - Socket: ${socket.id}`);
        socket.emit('connected', {
            message: '실시간 알림이 활성화되었습니다.',
            userId: user._id,
            timestamp: new Date()
        });
        if (user.role === 'admin') {
            socket.broadcast.to('role:admin').emit('admin_online', {
                adminId: user._id,
                adminName: user.name,
                timestamp: new Date()
            });
        }
    }
    handleDisconnection(socket) {
        const connectedUser = this.connectedUsers.get(socket.id);
        if (connectedUser) {
            console.log(`👋 사용자 연결 해제됨: ${connectedUser.userId} - Socket: ${socket.id}`);
            this.connectedUsers.delete(socket.id);
            const userSocketIds = this.userSockets.get(connectedUser.userId);
            if (userSocketIds) {
                userSocketIds.delete(socket.id);
                if (userSocketIds.size === 0) {
                    this.userSockets.delete(connectedUser.userId);
                }
                else {
                    this.userSockets.set(connectedUser.userId, userSocketIds);
                }
            }
            if (connectedUser.role === 'admin') {
                if (!this.userSockets.has(connectedUser.userId)) {
                    socket.broadcast.to('role:admin').emit('admin_offline', {
                        adminId: connectedUser.userId,
                        timestamp: new Date()
                    });
                }
            }
        }
    }
    handleJoinRoom(socket, room) {
        socket.join(room);
        console.log(`📍 사용자가 룸에 참여함: ${room} - Socket: ${socket.id}`);
    }
    handleLeaveRoom(socket, room) {
        socket.leave(room);
        console.log(`🚪 사용자가 룸에서 나감: ${room} - Socket: ${socket.id}`);
    }
    handleSubscribeNotifications(socket) {
        const user = socket.data.user;
        socket.join(`notifications:${user._id}`);
        socket.emit('notifications_subscribed', {
            message: '알림 구독이 활성화되었습니다.',
            timestamp: new Date()
        });
    }
    handleMarkNotificationRead(socket, notificationId) {
        console.log(`✅ 알림 읽음 처리: ${notificationId} by ${socket.data.user._id}`);
    }
    handleJoinAdminRoom(socket) {
        if (socket.data.user.role !== 'admin') {
            socket.emit('error', { message: '관리자 권한이 필요합니다.' });
            return;
        }
        socket.join('admin:dashboard');
        socket.emit('admin_room_joined', {
            message: '관리자 대시보드에 연결되었습니다.',
            timestamp: new Date()
        });
    }
    handleBroadcastAnnouncement(socket, data) {
        if (socket.data.user.role !== 'admin') {
            socket.emit('error', { message: '관리자 권한이 필요합니다.' });
            return;
        }
        this.broadcastToAll('system_announcement', {
            title: data.title,
            message: data.message,
            priority: data.priority || 'medium',
            timestamp: new Date(),
            announcedBy: socket.data.user.name
        });
    }
    sendNotificationToUser(userId, notification) {
        if (!this.io)
            return;
        this.io.to(`user:${userId}`).emit('notification', {
            id: this.generateNotificationId(),
            ...notification,
            timestamp: new Date()
        });
        console.log(`📧 알림 전송: ${userId} - ${notification.title}`);
    }
    sendNotificationToRole(role, notification) {
        if (!this.io)
            return;
        this.io.to(`role:${role}`).emit('notification', {
            id: this.generateNotificationId(),
            ...notification,
            timestamp: new Date()
        });
        console.log(`📧 역할별 알림 전송: ${role} - ${notification.title}`);
    }
    broadcastToAll(event, data) {
        if (!this.io)
            return;
        this.io.emit(event, {
            ...data,
            timestamp: new Date()
        });
        console.log(`📢 전체 브로드캐스트: ${event}`);
    }
    sendToRoom(room, event, data) {
        if (!this.io)
            return;
        this.io.to(room).emit(event, {
            ...data,
            timestamp: new Date()
        });
        console.log(`📍 룸 메시지 전송: ${room} - ${event}`);
    }
    sendRealtimeStats(stats) {
        if (!this.io)
            return;
        this.io.to('admin:dashboard').emit('realtime_stats', {
            ...stats,
            timestamp: new Date()
        });
    }
    notifyOrderStatusUpdate(userId, orderData) {
        this.sendNotificationToUser(userId, {
            type: 'order',
            title: '주문 상태 업데이트',
            message: `주문 상태가 '${orderData.status}'로 변경되었습니다.`,
            data: orderData,
            priority: 'medium',
            timestamp: new Date()
        });
    }
    notifyPaymentSuccess(userId, paymentData) {
        this.sendNotificationToUser(userId, {
            type: 'payment',
            title: '결제 완료',
            message: `결제가 성공적으로 완료되었습니다. (${paymentData.amount.toLocaleString()}원)`,
            data: paymentData,
            priority: 'high',
            timestamp: new Date()
        });
        this.sendNotificationToRole('admin', {
            type: 'order',
            title: '새 주문 접수',
            message: `새로운 주문이 접수되었습니다. (${paymentData.amount.toLocaleString()}원)`,
            data: paymentData,
            priority: 'medium',
            timestamp: new Date()
        });
    }
    notifyLowStock(productData) {
        this.sendNotificationToRole('admin', {
            type: 'product',
            title: '재고 부족 경고',
            message: `${productData.name} 상품의 재고가 ${productData.stock}개 남았습니다.`,
            data: productData,
            priority: 'high',
            timestamp: new Date()
        });
    }
    notifyNewReview(reviewData) {
        this.sendNotificationToRole('admin', {
            type: 'review',
            title: '새 리뷰 작성',
            message: `${reviewData.productName}에 새로운 리뷰가 작성되었습니다. (${reviewData.rating}점)`,
            data: reviewData,
            priority: 'low',
            timestamp: new Date()
        });
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }
    getOnlineAdmins() {
        return Array.from(this.connectedUsers.values()).filter(user => user.role === 'admin');
    }
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    cleanup() {
        if (this.io) {
            this.io.close();
            console.log('🔌 Socket.IO 서버가 종료되었습니다');
        }
        this.connectedUsers.clear();
        this.userSockets.clear();
    }
}
exports.default = SocketService;
//# sourceMappingURL=socketService.js.map