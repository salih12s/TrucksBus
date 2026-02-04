import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDisabled: boolean = false;

  constructor() {
    // Geliştirme ortamında e-posta göndermeyi devre dışı bırak
    if (process.env.DISABLE_EMAIL === "true") {
      console.log("📧 E-posta servisi devre dışı (development mode)");
      this.isDisabled = true;
      return;
    }
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
        "💡 Gerçek e-posta göndermek için Gmail uygulama şifresi gerekli",
      );
      console.log(
        "📋 EMAIL_USER:",
        process.env.EMAIL_USER ? "✓ ayarlandı" : "✗ eksik",
      );
      console.log(
        "📋 EMAIL_PASSWORD:",
        process.env.EMAIL_PASSWORD ? "✓ ayarlandı" : "✗ eksik",
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    // Development ortamında e-posta gönderme simülasyonu
    if (this.isDisabled) {
      console.log("📧 [SIMULATED EMAIL]");
      console.log("📮 To:", options.to);
      console.log("📑 Subject:", options.subject);
      console.log("💌 E-posta gönderildi (simulated)");
      console.log(
        "⚠️  Gerçek e-posta göndermek için DISABLE_EMAIL=false yapın ve Gmail App Password ekleyin",
      );
      return;
    }

    if (!this.transporter) {
      console.error("❌ E-posta transporter yapılandırılmamış!");
      console.log("📋 Kontrol edin:");
      console.log("   - EMAIL_USER:", process.env.EMAIL_USER || "EKSİK");
      console.log(
        "   - EMAIL_PASSWORD:",
        process.env.EMAIL_PASSWORD ? "***" : "EKSİK",
      );
      console.log("   - DISABLE_EMAIL:", process.env.DISABLE_EMAIL);
      throw new Error(
        "E-posta servisi yapılandırılmamış. EMAIL_USER ve EMAIL_PASSWORD .env dosyasında tanımlı olmalı.",
      );
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

      console.log("📧 E-posta gönderiliyor:", options.to);
      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ E-posta başarıyla gönderildi:", info.messageId);
    } catch (error: any) {
      console.error("❌ E-posta gönderme hatası:", error.message || error);
      if (error.code === "EAUTH") {
        console.error(
          "🔐 Kimlik doğrulama hatası! Gmail App Password kullandığınızdan emin olun.",
        );
        console.error(
          "   Normal Gmail şifresi ÇALIŞMAZ. Google Account > Security > App passwords",
        );
      }
      throw new Error(
        `E-posta gönderilemedi: ${error.message || "Bilinmeyen hata"}`,
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4A90E2;
          }
          .logo {
            color: #4A90E2;
            margin: 0;
            font-size: 32px;
            font-weight: bold;
          }
          .content {
            text-align: center;
            line-height: 1.8;
          }
          .content h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .content p {
            margin-bottom: 20px;
            color: #555;
            font-size: 16px;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
            color: white !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            margin: 30px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 3px 6px rgba(74, 144, 226, 0.3);
            transition: all 0.3s ease;
          }
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(74, 144, 226, 0.4);
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
          .warning {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-left: 4px solid #ffc107;
            padding: 20px;
            border-radius: 6px;
            margin: 30px 0;
            color: #856404;
          }
          .warning strong {
            display: block;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .warning ul {
            margin: 0;
            padding-left: 20px;
          }
          .warning li {
            margin-bottom: 8px;
          }
          .link-fallback {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            border: 1px solid #dee2e6;
          }
          .link-fallback p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
          }
          .link-text {
            word-break: break-all;
            font-size: 12px;
            color: #888;
            background-color: #f1f3f4;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">🚛 TrucksBus</h1>
          </div>
          
          <div class="content">
            <h2>🔐 Şifre Sıfırlama Talebi</h2>
            <p><strong>Merhaba,</strong></p>
            <p>TrucksBus hesabınız için şifre sıfırlama talebinde bulundunuz. Güvenliğiniz için bu işlemi tamamlamak üzere aşağıdaki butona tıklayın:</p>
            
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetLink}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="10%" strokecolor="#357ABD" fillcolor="#4A90E2">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">🔑 Şifremi Şimdi Sıfırla</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
              <tr>
                <td style="border-radius: 8px; background-color: #4A90E2;">
                  <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 32px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; background-color: #4A90E2; border: 1px solid #357ABD;">🔑 Şifremi Şimdi Sıfırla</a>
                </td>
              </tr>
            </table>
            <!--<![endif]-->
            
            <div class="warning">
              <strong>⚠️ Güvenlik Uyarıları:</strong>
              <ul>
                <li><strong>Bu bağlantı sadece 1 saat süreyle geçerlidir</strong></li>
                <li>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin</li>
                <li>Şifrenizi asla kimseyle paylaşmayın</li>
                <li>Şüpheli aktivite fark ederseniz derhal bizimle iletişime geçin</li>
              </ul>
            </div>
            
            <div class="link-fallback">
              <p><strong>Buton çalışmıyor mu?</strong></p>
              <p>Aşağıdaki bağlantıyı tarayıcınıza kopyalayıp yapıştırın:</p>
              <div class="link-text">${resetLink}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>📧 Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.</p>
            <p><strong>🚛 TrucksBus Destek Ekibi</strong></p>
            <p>📞 Destek: destek@trucksbus.com.tr</p>
            <p>🌐 Website: <a href="https://trucksbus.com.tr" style="color: #4A90E2;">www.trucksbus.com.tr</a></p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              © 2025 TrucksBus. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
🚛 TrucksBus - Şifre Sıfırlama Talebi

Merhaba,

TrucksBus hesabınız için şifre sıfırlama talebinde bulundunuz.

Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
${resetLink}

⚠️ ÖNEMLI:
- Bu bağlantı sadece 1 saat süreyle geçerlidir
- Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelin
- Şüpheli aktivite fark ederseniz bizimle iletişime geçin

TrucksBus Destek Ekibi
📧 destek@trucksbus.com.tr
🌐 www.trucksbus.com.tr

© 2025 TrucksBus. Tüm hakları saklıdır.
    `;

    await this.sendEmail({
      to: email,
      subject: "🔐 TrucksBus - Şifre Sıfırlama Talebi (1 saat geçerli)",
      html: htmlTemplate,
      text: textContent,
    });
  }
}

export const emailService = new EmailService();
