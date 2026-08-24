import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';

import { MAIL_JOBS, MAIL_QUEUE } from './mail.constants';
import type {
  GalleryInvitationEmailJobData,
  GallerySharedEmailJobData,
  VerificationEmailJobData,
} from './mail.types';

@Injectable()
export class MailQueueService {
  constructor(
    @InjectQueue(MAIL_QUEUE)
    private readonly mailQueue: Queue,
  ) {}

  async enqueueVerificationEmail(email: string, code: string): Promise<void> {
    const data: VerificationEmailJobData = {
      email,
      code,
    };

    await this.mailQueue.add(MAIL_JOBS.VERIFICATION, data);
  }

  async enqueueGalleryInvitation(
    email: string,
    galleryTitle: string,
    token: string,
  ): Promise<void> {
    const data: GalleryInvitationEmailJobData = {
      email,
      galleryTitle,
      token,
    };

    await this.mailQueue.add(MAIL_JOBS.GALLERY_INVITATION, data);
  }

  async enqueueGallerySharedNotification(
    email: string,
    galleryTitle: string,
  ): Promise<void> {
    const data: GallerySharedEmailJobData = {
      email,
      galleryTitle,
    };

    await this.mailQueue.add(MAIL_JOBS.GALLERY_SHARED, data);
  }
}
