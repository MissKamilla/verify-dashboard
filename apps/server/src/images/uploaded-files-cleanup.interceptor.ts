import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, from, mergeMap, Observable, throwError } from 'rxjs';

import { removeUploadedFiles } from './images-storage.utils';

type RequestWithFiles = {
  files?: Express.Multer.File[];
};

@Injectable()
export class UploadedFilesCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithFiles>();

    return next
      .handle()
      .pipe(
        catchError((error: unknown) =>
          from(removeUploadedFiles(request.files ?? [])).pipe(
            mergeMap(() => throwError(() => error)),
          ),
        ),
      );
  }
}
