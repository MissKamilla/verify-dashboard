import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<string>('SMTP_PORT')),
      secure: this.configService.getOrThrow<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
  }
  async sendVerificationCode(to: string, code: string): Promise<void> {
    const fromEmail = this.configService.getOrThrow<string>('SMTP_FROM_EMAIL');
    const fromName = this.configService.getOrThrow<string>('SMTP_FROM_NAME');

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: 'Verify your email',
      text: `Your verification code is ${code}. It expires in 15 minutes.`,
      html: `
      <p>Your verification code is:</p>
      <p><strong>${code}</strong></p>
      <p>The code expires in 15 minutes.</p>
    `,
    });
  }

  async sendGallerySharedNotification(
    to: string,
    galleryTitle: string,
  ): Promise<void> {
    const fromEmail = this.configService.getOrThrow<string>('SMTP_FROM_EMAIL');
    const fromName = this.configService.getOrThrow<string>('SMTP_FROM_NAME');

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: 'A gallery was shared with you',
      text: `You now have access to the gallery "${galleryTitle}".`,
      html: `
      <p>A gallery was shared with you.</p>
      <p>You now have access to <strong>${galleryTitle}</strong>.</p>
    `,
    });
  }
}
