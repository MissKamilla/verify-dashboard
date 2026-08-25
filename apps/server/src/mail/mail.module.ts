import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { MAIL_QUEUE } from './mail.constants';
import { MailProcessor } from './mail.processor';
import { MailQueueService } from './mail-queue.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MAIL_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
  ],
  providers: [MailService, MailQueueService, MailProcessor],
  exports: [MailQueueService],
})
export class MailModule {}
