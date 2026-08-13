import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

type SendMailPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getFirstMockCallArg<T>(mock: jest.Mock): T {
  const [arg] = mock.mock.calls[0] as [T];

  return arg;
}

describe('MailService', () => {
  let sendMailMock: jest.Mock;

  let configServiceMock: {
    getOrThrow: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    sendMailMock = jest.fn().mockResolvedValue(undefined);

    (createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const config = new Map<string, string>([
      ['SMTP_HOST', 'smtp.test.local'],
      ['SMTP_PORT', '2525'],
      ['SMTP_SECURE', 'false'],
      ['SMTP_USER', 'smtp-user'],
      ['SMTP_PASSWORD', 'smtp-password'],
      ['SMTP_FROM_EMAIL', 'noreply@test.com'],
      ['SMTP_FROM_NAME', 'Verify Test'],
      ['FRONTEND_URL', 'https://app.test'],
    ]);

    configServiceMock = {
      getOrThrow: jest.fn((key: string) => {
        const value = config.get(key);

        if (!value) {
          throw new Error(`Missing config ${key}`);
        }

        return value;
      }),
    };
  });

  it('creates SMTP transporter from configuration', () => {
    new MailService(configServiceMock as unknown as ConfigService);

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.test.local',
      port: 2525,
      secure: false,
      auth: {
        user: 'smtp-user',
        pass: 'smtp-password',
      },
    });
  });

  it('sends verification code email', async () => {
    const mailService = new MailService(
      configServiceMock as unknown as ConfigService,
    );

    await mailService.sendVerificationCode('anna@test.com', '123456');

    const payload = getFirstMockCallArg<SendMailPayload>(sendMailMock);

    expect(payload).toMatchObject({
      from: '"Verify Test" <noreply@test.com>',
      to: 'anna@test.com',
      subject: 'Verify your email',
      text: 'Your verification code is 123456. It expires in 15 minutes.',
    });

    expect(payload.html).toContain('<strong>123456</strong>');
  });

  it('sends gallery invitation with frontend registration link', async () => {
    const mailService = new MailService(
      configServiceMock as unknown as ConfigService,
    );

    await mailService.sendGalleryInvitation(
      'invitee@test.com',
      'Nature',
      'invite-token',
    );

    const payload = getFirstMockCallArg<SendMailPayload>(sendMailMock);

    expect(payload).toMatchObject({
      from: '"Verify Test" <noreply@test.com>',
      to: 'invitee@test.com',
      subject: 'You have been invited to a gallery',
      text: 'You have been invited to "Nature". Register here: https://app.test/register?invite=invite-token',
    });

    expect(payload.html).toContain(
      'https://app.test/register?invite=invite-token',
    );
  });
});
