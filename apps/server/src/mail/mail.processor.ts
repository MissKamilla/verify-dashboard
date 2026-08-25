import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { MAIL_JOBS, MAIL_QUEUE } from './mail.constants';
import type {
  GalleryInvitationEmailJobData,
  GallerySharedEmailJobData,
  VerificationEmailJobData,
} from './mail.types';
import { MailService } from './mail.service';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case MAIL_JOBS.VERIFICATION: {
        const data = job.data as VerificationEmailJobData;

        await this.mailService.sendVerificationCode(data.email, data.code);
        return;
      }
      case MAIL_JOBS.GALLERY_INVITATION: {
        const data = job.data as GalleryInvitationEmailJobData;

        await this.mailService.sendGalleryInvitation(
          data.email,
          data.galleryTitle,
          data.token,
        );

        return;
      }
      case MAIL_JOBS.GALLERY_SHARED: {
        const data = job.data as GallerySharedEmailJobData;

        await this.mailService.sendGallerySharedNotification(
          data.email,
          data.galleryTitle,
        );

        return;
      }

      default:
        throw new Error(`Unknown mail job: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Mail job ${job.id} completed: ${job.name}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error): void {
    this.logger.error(
      `Mail job ${job?.id ?? 'unknown'} failed: ${job?.name ?? 'unknown'} ` +
        `(attempt ${job?.attemptsMade ?? 'unknown'}/${job?.opts.attempts ?? 'unknown'})`,
      error.stack,
    );
  }
}
