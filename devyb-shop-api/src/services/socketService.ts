import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import { extractUserFromToken } from '../middleware/auth';

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

class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Socket.IO 서버 초기화
   */
  public initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.FRONTEND_URL,
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

  /**
   * 미들웨어 설정
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    // 인증 미들웨어
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('인증 토큰이 필요합니다.'));
        }

        const user = await extractUserFromToken(token);
        if (!user) {
          return next(new Error('유효하지 않은 토큰입니다.'));
        }

        // Socket 객체에 사용자 정보 추가
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('인증 실패'));
      }
    });
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);

      // 이벤트 리스너 등록
      socket.on('join_room', (room: string) => this.handleJoinRoom(socket, room));
      socket.on('leave_room', (room: string) => this.handleLeaveRoom(socket, room));
      socket.on('subscribe_notifications', () => this.handleSubscribeNotifications(socket));
      socket.on('mark_notification_read', (notificationId: string) => this.handleMarkNotificationRead(socket, notificationId));
      socket.on('disconnect', () => this.handleDisconnection(socket));

      // 관리자 전용 이벤트
      if (socket.data.user.role === 'admin') {
        socket.on('join_admin_room', () => this.handleJoinAdminRoom(socket));
        socket.on('broadcast_announcement', (data: any) => this.handleBroadcastAnnouncement(socket, data));
      }
    });
  }

  /**
   * 연결 처리
   */
  private handleConnection(socket: Socket): void {
    const user = socket.data.user;
    const connectedUser: ConnectedUser = {
      userId: user._id.toString(),
      socketId: socket.id,
      role: user.role,
      joinedAt: new Date()
    };

    // 연결된 사용자 정보 저장
    this.connectedUsers.set(socket.id, connectedUser);

    // 사용자별 소켓 목록 관리
    const userSocketIds = this.userSockets.get(user._id.toString()) || new Set();
    userSocketIds.add(socket.id);
    this.userSockets.set(user._id.toString(), userSocketIds);

    // 사용자별 룸에 참여
    socket.join(`user:${user._id}`);

    // 역할별 룸에 참여
    socket.join(`role:${user.role}`);

    console.log(`👤 사용자 연결됨: ${user.name} (${user.email}) - Socket: ${socket.id}`);

    // 연결 확인 메시지 전송
    socket.emit('connected', {
      message: '실시간 알림이 활성화되었습니다.',
      userId: user._id,
      timestamp: new Date()
    });

    // 연결 상태를 다른 관리자들에게 알림 (관리자인 경우)
    if (user.role === 'admin') {
      socket.broadcast.to('role:admin').emit('admin_online', {
        adminId: user._id,
        adminName: user.name,
        timestamp: new Date()
      });
    }
  }

  /**
   * 연결 해제 처리
   */
  private handleDisconnection(socket: Socket): void {
    const connectedUser = this.connectedUsers.get(socket.id);
    
    if (connectedUser) {
      console.log(`👋 사용자 연결 해제됨: ${connectedUser.userId} - Socket: ${socket.id}`);

      // 연결된 사용자 정보 제거
      this.connectedUsers.delete(socket.id);

      // 사용자별 소켓 목록에서 제거
      const userSocketIds = this.userSockets.get(connectedUser.userId);
      if (userSocketIds) {
        userSocketIds.delete(socket.id);
        if (userSocketIds.size === 0) {
          this.userSockets.delete(connectedUser.userId);
        } else {
          this.userSockets.set(connectedUser.userId, userSocketIds);
        }
      }

      // 관리자 오프라인 알림
      if (connectedUser.role === 'admin') {
        // 해당 사용자의 다른 연결이 없는 경우에만 오프라인 알림
        if (!this.userSockets.has(connectedUser.userId)) {
          socket.broadcast.to('role:admin').emit('admin_offline', {
            adminId: connectedUser.userId,
            timestamp: new Date()
          });
        }
      }
    }
  }

  /**
   * 룸 참여 처리
   */
  private handleJoinRoom(socket: Socket, room: string): void {
    socket.join(room);
    console.log(`📍 사용자가 룸에 참여함: ${room} - Socket: ${socket.id}`);
  }

  /**
   * 룸 탈퇴 처리
   */
  private handleLeaveRoom(socket: Socket, room: string): void {
    socket.leave(room);
    console.log(`🚪 사용자가 룸에서 나감: ${room} - Socket: ${socket.id}`);
  }

  /**
   * 알림 구독 처리
   */
  private handleSubscribeNotifications(socket: Socket): void {
    const user = socket.data.user;
    socket.join(`notifications:${user._id}`);
    
    socket.emit('notifications_subscribed', {
      message: '알림 구독이 활성화되었습니다.',
      timestamp: new Date()
    });
  }

  /**
   * 알림 읽음 처리
   */
  private handleMarkNotificationRead(socket: Socket, notificationId: string): void {
    // TODO: 데이터베이스에서 알림을 읽음으로 표시
    console.log(`✅ 알림 읽음 처리: ${notificationId} by ${socket.data.user._id}`);
  }

  /**
   * 관리자 룸 참여
   */
  private handleJoinAdminRoom(socket: Socket): void {
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

  /**
   * 공지사항 브로드캐스트
   */
  private handleBroadcastAnnouncement(socket: Socket, data: any): void {
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

  /**
   * 특정 사용자에게 알림 전송
   */
  public sendNotificationToUser(userId: string, notification: NotificationData): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('notification', {
      id: this.generateNotificationId(),
      ...notification,
      timestamp: new Date()
    });

    console.log(`📧 알림 전송: ${userId} - ${notification.title}`);
  }

  /**
   * 역할별 알림 전송
   */
  public sendNotificationToRole(role: string, notification: NotificationData): void {
    if (!this.io) return;

    this.io.to(`role:${role}`).emit('notification', {
      id: this.generateNotificationId(),
      ...notification,
      timestamp: new Date()
    });

    console.log(`📧 역할별 알림 전송: ${role} - ${notification.title}`);
  }

  /**
   * 모든 사용자에게 브로드캐스트
   */
  public broadcastToAll(event: string, data: any): void {
    if (!this.io) return;

    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });

    console.log(`📢 전체 브로드캐스트: ${event}`);
  }

  /**
   * 룸에 메시지 전송
   */
  public sendToRoom(room: string, event: string, data: any): void {
    if (!this.io) return;

    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date()
    });

    console.log(`📍 룸 메시지 전송: ${room} - ${event}`);
  }

  /**
   * 관리자에게 실시간 통계 전송
   */
  public sendRealtimeStats(stats: any): void {
    if (!this.io) return;

    this.io.to('admin:dashboard').emit('realtime_stats', {
      ...stats,
      timestamp: new Date()
    });
  }

  /**
   * 주문 상태 업데이트 알림
   */
  public notifyOrderStatusUpdate(userId: string, orderData: any): void {
    this.sendNotificationToUser(userId, {
      type: 'order',
      title: '주문 상태 업데이트',
      message: `주문 상태가 '${orderData.status}'로 변경되었습니다.`,
      data: orderData,
      priority: 'medium',
      timestamp: new Date()
    });
  }

  /**
   * 결제 완료 알림
   */
  public notifyPaymentSuccess(userId: string, paymentData: any): void {
    this.sendNotificationToUser(userId, {
      type: 'payment',
      title: '결제 완료',
      message: `결제가 성공적으로 완료되었습니다. (${paymentData.amount.toLocaleString()}원)`,
      data: paymentData,
      priority: 'high',
      timestamp: new Date()
    });

    // 관리자에게도 알림
    this.sendNotificationToRole('admin', {
      type: 'order',
      title: '새 주문 접수',
      message: `새로운 주문이 접수되었습니다. (${paymentData.amount.toLocaleString()}원)`,
      data: paymentData,
      priority: 'medium',
      timestamp: new Date()
    });
  }

  /**
   * 재고 부족 알림 (관리자)
   */
  public notifyLowStock(productData: any): void {
    this.sendNotificationToRole('admin', {
      type: 'product',
      title: '재고 부족 경고',
      message: `${productData.name} 상품의 재고가 ${productData.stock}개 남았습니다.`,
      data: productData,
      priority: 'high',
      timestamp: new Date()
    });
  }

  /**
   * 리뷰 작성 알림 (관리자)
   */
  public notifyNewReview(reviewData: any): void {
    this.sendNotificationToRole('admin', {
      type: 'review',
      title: '새 리뷰 작성',
      message: `${reviewData.productName}에 새로운 리뷰가 작성되었습니다. (${reviewData.rating}점)`,
      data: reviewData,
      priority: 'low',
      timestamp: new Date()
    });
  }

  /**
   * 연결된 사용자 수 조회
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * 특정 사용자의 온라인 상태 확인
   */
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * 연결된 관리자 목록 조회
   */
  public getOnlineAdmins(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values()).filter(user => user.role === 'admin');
  }

  /**
   * 알림 ID 생성
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 서버 종료 시 정리
   */
  public cleanup(): void {
    if (this.io) {
      this.io.close();
      console.log('🔌 Socket.IO 서버가 종료되었습니다');
    }
    this.connectedUsers.clear();
    this.userSockets.clear();
  }
}

export default SocketService;