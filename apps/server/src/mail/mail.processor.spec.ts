import type { Job } from 'bullmq';

import { MAIL_JOBS } from './mail.constants';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

describe('MailProcessor', () => {
  let mailServiceMock: {
    sendVerificationCode: jest.Mock;
    sendPasswordReset: jest.Mock;
    sendGalleryInvitation: jest.Mock;
    sendGallerySharedNotification: jest.Mock;
  };

  let mailProcessor: MailProcessor;

  beforeEach(() => {
    mailServiceMock = {
      sendVerificationCode: jest.fn().mockResolvedValue(undefined),
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
      sendGalleryInvitation: jest.fn().mockResolvedValue(undefined),
      sendGallerySharedNotification: jest.fn().mockResolvedValue(undefined),
    };

    mailProcessor = new MailProcessor(
      mailServiceMock as unknown as MailService,
    );
  });

  it('sends verification email jobs through MailService', async () => {
    await mailProcessor.process({
      name: MAIL_JOBS.VERIFICATION,
      data: {
        email: 'anna@test.com',
        code: '123456',
      },
    } as Job);

    expect(mailServiceMock.sendVerificationCode).toHaveBeenCalledWith(
      'anna@test.com',
      '123456',
    );
  });

  it('sends gallery invitation email jobs through MailService', async () => {
    await mailProcessor.process({
      name: MAIL_JOBS.GALLERY_INVITATION,
      data: {
        email: 'invitee@test.com',
        galleryTitle: 'Nature',
        token: 'invite-token',
      },
    } as Job);

    expect(mailServiceMock.sendGalleryInvitation).toHaveBeenCalledWith(
      'invitee@test.com',
      'Nature',
      'invite-token',
    );
  });

  it('sends password reset email jobs through MailService', async () => {
    await mailProcessor.process({
      name: MAIL_JOBS.PASSWORD_RESET,
      data: {
        email: 'anna@test.com',
        token: 'reset-token',
      },
    } as Job);

    expect(mailServiceMock.sendPasswordReset).toHaveBeenCalledWith(
      'anna@test.com',
      'reset-token',
    );
  });

  it('sends gallery shared notification jobs through MailService', async () => {
    await mailProcessor.process({
      name: MAIL_JOBS.GALLERY_SHARED,
      data: {
        email: 'editor@test.com',
        galleryTitle: 'Nature',
      },
    } as Job);

    expect(mailServiceMock.sendGallerySharedNotification).toHaveBeenCalledWith(
      'editor@test.com',
      'Nature',
    );
  });

  it('throws when job name is unknown', async () => {
    await expect(
      mailProcessor.process({
        name: 'unknown-mail-job',
        data: {},
      } as Job),
    ).rejects.toThrow('Unknown mail job: unknown-mail-job');
  });
});
