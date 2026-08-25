import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { createTransport } from 'nodemailer';

import { MAIL_QUEUE } from '../src/mail/mail.constants';
import { MailModule } from '../src/mail/mail.module';
import { MailProcessor } from '../src/mail/mail.processor';
import { MailQueueService } from '../src/mail/mail-queue.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

async function waitForExpectation(
  expectation: () => void,
  timeoutMs = 3000,
): Promise<void> {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      expectation();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  throw lastError;
}

describe('Mail queue integration', () => {
  const redisKeyPrefix = `verify-mail-test-${process.pid}-${Date.now()}`;

  let app: INestApplication;
  let mailQueue: Queue;
  let mailProcessor: MailProcessor;
  let mailQueueService: MailQueueService;
  let sendMailMock: jest.Mock;

  beforeAll(async () => {
    sendMailMock = jest.fn().mockResolvedValue(undefined);

    (createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        BullModule.forRoot({
          prefix: redisKeyPrefix,
          connection: {
            host: 'localhost',
            port: 6379,
            family: 0,
          },
        }),
        MailModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mailQueue = app.get<Queue>(getQueueToken(MAIL_QUEUE));
    mailProcessor = app.get(MailProcessor);
    mailQueueService = app.get(MailQueueService);

    await mailProcessor.worker.waitUntilReady();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    (createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    await mailQueue.drain(true);
    await mailQueue.clean(0, 1000, 'completed');
    await mailQueue.clean(0, 1000, 'failed');
  });

  afterAll(async () => {
    await mailQueue?.obliterate({ force: true });
    await app?.close();
  });

  it('processes verification email jobs through the real BullMQ queue', async () => {
    await mailQueueService.enqueueVerificationEmail('anna@test.com', '123456');

    await waitForExpectation(() => {
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'anna@test.com',
          subject: 'Verify your email',
          text: 'Your verification code is 123456. It expires in 15 minutes.',
        }),
      );
    });
  });
});
