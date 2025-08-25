import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;

  private constructor() {
    this.initializeTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * 이메일 전송기 초기화
   */
  private initializeTransporter(): void {
    if (!config.EMAIL_HOST || !config.EMAIL_USER || !config.EMAIL_PASS) {
      console.warn('⚠️  이메일 설정이 완료되지 않았습니다. 이메일 기능이 비활성화됩니다.');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465, // SSL
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ 이메일 서비스가 초기화되었습니다');
  }

  /**
   * 이메일 전송
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  이메일 전송기가 초기화되지 않았습니다.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"DevYB Shop" <${config.EMAIL_FROM}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 이메일 전송 성공: ${options.subject} → ${options.to}`);
      return true;
    } catch (error) {
      console.error('❌ 이메일 전송 실패:', error);
      return false;
    }
  }

  /**
   * 환영 이메일 전송
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(userName);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 주문 확인 이메일 전송
   */
  async sendOrderConfirmationEmail(
    userEmail: string, 
    userName: string, 
    orderData: any
  ): Promise<boolean> {
    const template = this.getOrderConfirmationTemplate(userName, orderData);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 배송 시작 이메일 전송
   */
  async sendShippingNotificationEmail(
    userEmail: string,
    userName: string,
    orderData: any
  ): Promise<boolean> {
    const template = this.getShippingNotificationTemplate(userName, orderData);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 배송 완료 이메일 전송
   */
  async sendDeliveryConfirmationEmail(
    userEmail: string,
    userName: string,
    orderData: any
  ): Promise<boolean> {
    const template = this.getDeliveryConfirmationTemplate(userName, orderData);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 비밀번호 재설정 이메일 전송
   */
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<boolean> {
    const template = this.getPasswordResetTemplate(userName, resetToken);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 이메일 인증 메일 전송
   */
  async sendEmailVerificationEmail(
    userEmail: string,
    userName: string,
    verificationToken: string
  ): Promise<boolean> {
    const template = this.getEmailVerificationTemplate(userName, verificationToken);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 주문 취소 이메일 전송
   */
  async sendOrderCancellationEmail(
    userEmail: string,
    userName: string,
    orderData: any,
    reason?: string
  ): Promise<boolean> {
    const template = this.getOrderCancellationTemplate(userName, orderData, reason);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 환불 처리 이메일 전송
   */
  async sendRefundNotificationEmail(
    userEmail: string,
    userName: string,
    refundData: any
  ): Promise<boolean> {
    const template = this.getRefundNotificationTemplate(userName, refundData);
    
    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 재고 부족 알림 이메일 (관리자)
   */
  async sendLowStockAlert(productData: any): Promise<boolean> {
    const adminEmails = await this.getAdminEmails();
    if (adminEmails.length === 0) return false;

    const template = this.getLowStockAlertTemplate(productData);
    
    return await this.sendEmail({
      to: adminEmails,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 새 주문 알림 이메일 (관리자)
   */
  async sendNewOrderAlert(orderData: any): Promise<boolean> {
    const adminEmails = await this.getAdminEmails();
    if (adminEmails.length === 0) return false;

    const template = this.getNewOrderAlertTemplate(orderData);
    
    return await this.sendEmail({
      to: adminEmails,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * 관리자 이메일 목록 조회
   */
  private async getAdminEmails(): Promise<string[]> {
    try {
      const User = require('../models/User').default;
      const admins = await User.find({ role: 'admin' }).select('email');
      return admins.map((admin: any) => admin.email);
    } catch (error) {
      console.error('관리자 이메일 조회 오류:', error);
      return [];
    }
  }

  // 이메일 템플릿들

  private getWelcomeEmailTemplate(userName: string): EmailTemplate {
    return {
      subject: 'DevYB Shop에 오신 것을 환영합니다! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">환영합니다!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">DevYB Shop 가족이 되신 것을 축하합니다</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              DevYB Shop에 가입해주셔서 감사합니다. 이제 다양한 상품을 만나보시고 
              편리한 쇼핑을 경험하실 수 있습니다.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🎁 회원 혜택</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>신규 회원 10% 할인 쿠폰</li>
                <li>무료 배송 혜택</li>
                <li>적립금 적립 서비스</li>
                <li>특가 상품 우선 알림</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                쇼핑하러 가기
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              궁금한 점이 있으시면 언제든지 고객센터로 문의해주세요.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        안녕하세요, ${userName}님!
        
        DevYB Shop에 가입해주셔서 감사합니다.
        
        회원 혜택:
        - 신규 회원 10% 할인 쿠폰
        - 무료 배송 혜택
        - 적립금 적립 서비스
        - 특가 상품 우선 알림
        
        지금 바로 쇼핑을 시작해보세요: ${config.FRONTEND_URL}
        
        궁금한 점이 있으시면 언제든지 고객센터로 문의해주세요.
        
        감사합니다.
        DevYB Shop 팀
      `
    };
  }

  private getOrderConfirmationTemplate(userName: string, orderData: any): EmailTemplate {
    const orderItemsHtml = orderData.orderItems.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()}원</td>
      </tr>
    `).join('');

    return {
      subject: `주문이 확정되었습니다 - 주문번호 ${orderData.orderNumber || orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4CAF50; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">주문 확인 📦</h1>
            <p style="margin: 10px 0 0 0;">주문이 성공적으로 접수되었습니다</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <p style="color: #666;">주문해 주셔서 감사합니다. 주문 내역을 확인해주세요.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">주문 정보</h3>
              <p><strong>주문번호:</strong> ${orderData.orderNumber || orderData.id}</p>
              <p><strong>주문일시:</strong> ${new Date(orderData.createdAt).toLocaleString('ko-KR')}</p>
              <p><strong>결제방법:</strong> ${orderData.paymentMethod}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">주문 상품</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; text-align: left;">상품명</th>
                    <th style="padding: 10px; text-align: center;">수량</th>
                    <th style="padding: 10px; text-align: right;">가격</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #f5f5f5; font-weight: bold;">
                    <td colspan="2" style="padding: 10px; text-align: right;">총 결제금액:</td>
                    <td style="padding: 10px; text-align: right; color: #4CAF50;">${orderData.totalPrice.toLocaleString()}원</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">배송 정보</h3>
              <p><strong>받는 분:</strong> ${orderData.shippingAddress.fullName}</p>
              <p><strong>주소:</strong> ${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}</p>
              <p><strong>연락처:</strong> ${orderData.shippingAddress.phone}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL}/orders/${orderData.id}" 
                 style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                주문 상세보기
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getShippingNotificationTemplate(userName: string, orderData: any): EmailTemplate {
    return {
      subject: `배송이 시작되었습니다 - 주문번호 ${orderData.orderNumber || orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2196F3; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">배송 출발! 🚚</h1>
            <p style="margin: 10px 0 0 0;">주문하신 상품이 배송을 시작했습니다</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">배송 정보</h3>
              <p><strong>주문번호:</strong> ${orderData.orderNumber || orderData.id}</p>
              ${orderData.trackingNumber ? `<p><strong>운송장번호:</strong> ${orderData.trackingNumber}</p>` : ''}
              <p><strong>배송 상태:</strong> 배송 중</p>
              <p><strong>예상 도착:</strong> 2-3일 내 도착 예정</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL}/orders/${orderData.id}" 
                 style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                배송 현황 확인
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getDeliveryConfirmationTemplate(userName: string, orderData: any): EmailTemplate {
    return {
      subject: `배송이 완료되었습니다 - 주문번호 ${orderData.orderNumber || orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4CAF50; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">배송 완료! 🎉</h1>
            <p style="margin: 10px 0 0 0;">주문하신 상품이 성공적으로 배송되었습니다</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <p style="color: #666;">주문하신 상품이 배송 완료되었습니다. 만족스러우셨나요?</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL}/orders/${orderData.id}/review" 
                 style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 0 10px;">
                리뷰 작성하기
              </a>
              <a href="${config.FRONTEND_URL}/orders/${orderData.id}" 
                 style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 0 10px;">
                주문 내역 보기
              </a>
            </div>
            
            <p style="color: #666; text-align: center; font-size: 14px;">
              리뷰를 작성해주시면 다음 주문에서 사용할 수 있는 적립금을 드립니다!
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getPasswordResetTemplate(userName: string, resetToken: string): EmailTemplate {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return {
      subject: '비밀번호 재설정 요청',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f44336; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">비밀번호 재설정</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <p style="color: #666;">비밀번호 재설정 요청을 받았습니다.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666;">아래 버튼을 클릭하여 새 비밀번호를 설정해주세요:</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetUrl}" 
                   style="background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  비밀번호 재설정
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                <strong>주의:</strong> 이 링크는 10분간만 유효합니다.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getEmailVerificationTemplate(userName: string, verificationToken: string): EmailTemplate {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    return {
      subject: '이메일 주소를 인증해주세요',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2196F3; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">이메일 인증</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <p style="color: #666;">가입을 완료하시려면 이메일 주소를 인증해주세요.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                이메일 인증하기
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getOrderCancellationTemplate(userName: string, orderData: any, reason?: string): EmailTemplate {
    return {
      subject: `주문이 취소되었습니다 - 주문번호 ${orderData.orderNumber || orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f44336; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">주문 취소</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <p style="color: #666;">요청하신 주문이 취소되었습니다.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>주문번호:</strong> ${orderData.orderNumber || orderData.id}</p>
              <p><strong>취소일시:</strong> ${new Date().toLocaleString('ko-KR')}</p>
              ${reason ? `<p><strong>취소사유:</strong> ${reason}</p>` : ''}
              <p><strong>환불금액:</strong> ${orderData.totalPrice.toLocaleString()}원</p>
            </div>
            
            <p style="color: #666;">
              결제하신 금액은 영업일 기준 2-3일 내에 환불될 예정입니다.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getRefundNotificationTemplate(userName: string, refundData: any): EmailTemplate {
    return {
      subject: `환불이 처리되었습니다`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4CAF50; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">환불 완료</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">안녕하세요, ${userName}님!</h2>
            
            <p style="color: #666;">요청하신 환불이 처리되었습니다.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>환불 ID:</strong> ${refundData.refundId}</p>
              <p><strong>환불금액:</strong> ${refundData.amount.toLocaleString()}원</p>
              <p><strong>처리일시:</strong> ${new Date().toLocaleString('ko-KR')}</p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getLowStockAlertTemplate(productData: any): EmailTemplate {
    return {
      subject: `재고 부족 경고 - ${productData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #FF9800; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">재고 부족 알림</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${productData.name}</h3>
              <p><strong>현재 재고:</strong> ${productData.stock}개</p>
              <p><strong>SKU:</strong> ${productData.sku}</p>
              <p><strong>카테고리:</strong> ${productData.category}</p>
            </div>
            
            <p style="color: #666;">
              재고 보충이 필요합니다. 관리자 페이지에서 재고를 확인해주세요.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL}/admin/products" 
                 style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                상품 관리하기
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  private getNewOrderAlertTemplate(orderData: any): EmailTemplate {
    return {
      subject: `새 주문 접수 - ${orderData.totalPrice.toLocaleString()}원`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4CAF50; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">새 주문 접수</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>주문번호:</strong> ${orderData.orderNumber || orderData.id}</p>
              <p><strong>주문금액:</strong> ${orderData.totalPrice.toLocaleString()}원</p>
              <p><strong>주문일시:</strong> ${new Date(orderData.createdAt).toLocaleString('ko-KR')}</p>
              <p><strong>주문자:</strong> ${orderData.user?.name || '고객'}</p>
              <p><strong>상품 개수:</strong> ${orderData.orderItems.length}개</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.FRONTEND_URL}/admin/orders" 
                 style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                주문 관리하기
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 DevYB Shop. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ 이메일 서버 연결 테스트 성공');
      return true;
    } catch (error) {
      console.error('❌ 이메일 서버 연결 테스트 실패:', error);
      return false;
    }
  }
}

export default EmailService;