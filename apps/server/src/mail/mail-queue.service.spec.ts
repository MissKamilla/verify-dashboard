import { Logger, ServiceUnavailableException } from '@nestjs/common';
import type { Queue } from 'bullmq';

import { MAIL_JOBS } from './mail.constants';
import { MailQueueService } from './mail-queue.service';

describe('MailQueueService', () => {
  let queueMock: {
    add: jest.Mock;
  };

  let mailQueueService: MailQueueService;

  beforeEach(() => {
    queueMock = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    mailQueueService = new MailQueueService(queueMock as unknown as Queue);
  });

  it('enqueues verification email job', async () => {
    await mailQueueService.enqueueVerificationEmail('anna@test.com', '123456');

    expect(queueMock.add).toHaveBeenCalledWith(MAIL_JOBS.VERIFICATION, {
      email: 'anna@test.com',
      code: '123456',
    });
  });

  it('enqueues gallery invitation email job', async () => {
    await mailQueueService.enqueueGalleryInvitation(
      'invitee@test.com',
      'Nature',
      'invite-token',
    );

    expect(queueMock.add).toHaveBeenCalledWith(MAIL_JOBS.GALLERY_INVITATION, {
      email: 'invitee@test.com',
      galleryTitle: 'Nature',
      token: 'invite-token',
    });
  });

  it('enqueues gallery shared notification job', async () => {
    await mailQueueService.enqueueGallerySharedNotification(
      'editor@test.com',
      'Nature',
    );

    expect(queueMock.add).toHaveBeenCalledWith(MAIL_JOBS.GALLERY_SHARED, {
      email: 'editor@test.com',
      galleryTitle: 'Nature',
    });
  });

  it('throws service unavailable exception when queue add fails', async () => {
    const loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    queueMock.add.mockRejectedValue(new Error('Redis is down'));

    await expect(
      mailQueueService.enqueueGallerySharedNotification(
        'editor@test.com',
        'Nature',
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Failed to enqueue gallery notification',
      expect.any(String),
    );

    loggerErrorSpy.mockRestore();
  });
});
