import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter?: Transporter;
  private readonly mailTransport: string;

  constructor(private readonly configService: ConfigService) {
    this.mailTransport =
      this.configService.get<string>('MAIL_TRANSPORT') ?? 'smtp';

    if (this.mailTransport === 'smtp') {
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
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    await this.sendMail({
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
    await this.sendMail({
      to,
      subject: 'A gallery was shared with you',
      text: `You now have access to the gallery "${galleryTitle}".`,
      html: `
      <p>A gallery was shared with you.</p>
      <p>You now have access to <strong>${galleryTitle}</strong>.</p>
    `,
    });
  }

  async sendGalleryInvitation(
    to: string,
    galleryTitle: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const invitationUrl = `${frontendUrl}/register?invite=${token}`;

    await this.sendMail({
      to,
      subject: 'You have been invited to a gallery',
      text: `You have been invited to "${galleryTitle}". Register here: ${invitationUrl}`,
      html: `
      <p>You have been invited to <strong>${galleryTitle}</strong>.</p>
      <p>
        <a href="${invitationUrl}">Register and view gallery</a>
      </p>
      <p>This invitation expires in 7 days.</p>
    `,
    });
  }

  private async sendMail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    if (this.mailTransport === 'brevo-api') {
      await this.sendViaBrevoApi({
        to,
        subject,
        text,
        html,
      });

      return;
    }

    const fromEmail = this.configService.getOrThrow<string>('SMTP_FROM_EMAIL');

    const fromName = this.configService.getOrThrow<string>('SMTP_FROM_NAME');

    await this.transporter!.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
  }

  private async sendViaBrevoApi({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    const apiKey = this.configService.getOrThrow<string>('BREVO_API_KEY');

    const fromEmail = this.configService.getOrThrow<string>('SMTP_FROM_EMAIL');

    const fromName = this.configService.getOrThrow<string>('SMTP_FROM_NAME');

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          email: fromEmail,
          name: fromName,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`Brevo API error ${response.status}: ${error}`);
    }
  }
}
