import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Queue } from 'bullmq';

import { MAIL_JOBS, MAIL_QUEUE } from './mail.constants';
import type {
  GalleryInvitationEmailJobData,
  GallerySharedEmailJobData,
  VerificationEmailJobData,
} from './mail.types';

@Injectable()
export class MailQueueService {
  private readonly logger = new Logger(MailQueueService.name);

  constructor(
    @InjectQueue(MAIL_QUEUE)
    private readonly mailQueue: Queue,
  ) {}

  async enqueueVerificationEmail(email: string, code: string): Promise<void> {
    await this.runQueueOperation('enqueue verification email', async () => {
      const data: VerificationEmailJobData = {
        email,
        code,
      };

      await this.mailQueue.add(MAIL_JOBS.VERIFICATION, data);
    });
  }

  async enqueueGalleryInvitation(
    email: string,
    galleryTitle: string,
    token: string,
  ): Promise<void> {
    await this.runQueueOperation('enqueue gallery invitation', async () => {
      const data: GalleryInvitationEmailJobData = {
        email,
        galleryTitle,
        token,
      };

      await this.mailQueue.add(MAIL_JOBS.GALLERY_INVITATION, data);
    });
  }

  async enqueueGallerySharedNotification(
    email: string,
    galleryTitle: string,
  ): Promise<void> {
    await this.runQueueOperation('enqueue gallery notification', async () => {
      const data: GallerySharedEmailJobData = {
        email,
        galleryTitle,
      };

      await this.mailQueue.add(MAIL_JOBS.GALLERY_SHARED, data);
    });
  }

  private async runQueueOperation(
    action: string,
    operation: () => Promise<void>,
  ): Promise<void> {
    try {
      await operation();
    } catch (error) {
      this.logger.error(
        `Failed to ${action}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new ServiceUnavailableException('Email queue is unavailable');
    }
  }
}
