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
declare class EmailService {
    private static instance;
    private transporter;
    private constructor();
    static getInstance(): EmailService;
    private initializeTransporter;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean>;
    sendOrderConfirmationEmail(userEmail: string, userName: string, orderData: any): Promise<boolean>;
    sendShippingNotificationEmail(userEmail: string, userName: string, orderData: any): Promise<boolean>;
    sendDeliveryConfirmationEmail(userEmail: string, userName: string, orderData: any): Promise<boolean>;
    sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<boolean>;
    sendEmailVerificationEmail(userEmail: string, userName: string, verificationToken: string): Promise<boolean>;
    sendOrderCancellationEmail(userEmail: string, userName: string, orderData: any, reason?: string): Promise<boolean>;
    sendRefundNotificationEmail(userEmail: string, userName: string, refundData: any): Promise<boolean>;
    sendLowStockAlert(productData: any): Promise<boolean>;
    sendNewOrderAlert(orderData: any): Promise<boolean>;
    private getAdminEmails;
    private getWelcomeEmailTemplate;
    private getOrderConfirmationTemplate;
    private getShippingNotificationTemplate;
    private getDeliveryConfirmationTemplate;
    private getPasswordResetTemplate;
    private getEmailVerificationTemplate;
    private getOrderCancellationTemplate;
    private getRefundNotificationTemplate;
    private getLowStockAlertTemplate;
    private getNewOrderAlertTemplate;
    testConnection(): Promise<boolean>;
}
export default EmailService;
//# sourceMappingURL=emailService.d.ts.map