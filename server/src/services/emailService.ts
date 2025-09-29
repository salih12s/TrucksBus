import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private useSendGrid: boolean = false;

  constructor() {
    this.initializeSMTP();
  }

  private initializeSMTP(): void {
    try {
      // E-posta sağlayıcısına göre konfigürasyon
      const emailConfig: any = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      };

      // Eğer Gmail kullanılıyorsa service özelliğini ekle
      if (process.env.SMTP_HOST?.includes("gmail") || !process.env.SMTP_HOST) {
        emailConfig.service = "gmail";
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.useSendGrid = false;

      // Bağlantıyı test et
      this.verifyConnection();
    } catch (error) {
      console.error("❌ SMTP kurulum hatası:", error);
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) return;

    try {
      await this.transporter.verify();
      console.log("✅ E-posta servisi hazır");
    } catch (error) {
      console.error("❌ E-posta servisi bağlantı hatası:", error);
      console.log("🔧 E-posta ayarlarınızı kontrol edin (.env dosyası)");
      console.log(
        "💡 Gerçek e-posta göndermek için Gmail uygulama şifresi gerekli"
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error("E-posta servisi yapılandırılmamış");
    }

    try {
      const mailOptions = {
        from: `"TrucksBus" <${
          process.env.EMAIL_USER || process.env.FROM_EMAIL
        }>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ E-posta gönderildi:", info.messageId);
    } catch (error) {
      console.error("❌ E-posta gönderme hatası:", error);
      throw new Error("E-posta gönderilemedi");
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string
  ): Promise<void> {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama - TrucksBus</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #4A90E2;
            margin: 0;
            font-size: 28px;
          }
          .content {
            text-align: center;
          }
          .reset-button {
            display: inline-block;
            background-color: #4A90E2;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
          }
          .reset-button:hover {
            background-color: #357ABD;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>🚛 TrucksBus</h1>
          </div>
          
          <div class="content">
            <h2>Şifre Sıfırlama Talebi</h2>
            <p>Merhaba,</p>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            
            <a href="${resetLink}" class="reset-button">Şifremi Sıfırla</a>
            
            <div class="warning">
              <strong>⚠️ Önemli Güvenlik Uyarısı:</strong><br>
              • Bu bağlantı 1 saat süreyle geçerlidir<br>
              • Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin<br>
              • Şifrenizi asla kimseyle paylaşmayın
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Eğer yukarıdaki buton çalışmıyorsa, aşağıdaki bağlantıyı tarayıcınıza kopyalayın:
            </p>
            <p style="word-break: break-all; font-size: 12px; color: #888;">
              ${resetLink}
            </p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.</p>
            <p><strong>TrucksBus Ekibi</strong></p>
            <p>📧 destek@trucksbus.com.tr | 🌐 www.trucksbus.com.tr</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
TrucksBus - Şifre Sıfırlama

Merhaba,

Hesabınız için şifre sıfırlama talebinde bulundunuz. 

Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
${resetLink}

Bu bağlantı 1 saat süreyle geçerlidir.

Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin.

TrucksBus Ekibi
www.trucksbus.com.tr
    `;

    await this.sendEmail({
      to: email,
      subject: "🔐 TrucksBus - Şifre Sıfırlama Talebi",
      html: htmlTemplate,
      text: textContent,
    });
  }
}

export const emailService = new EmailService();
