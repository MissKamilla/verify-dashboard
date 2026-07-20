import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import type { JwtPayload } from '../types/jwt-payload.type';

type RequestWithUser = Request & {
  user?: JwtPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const payload: unknown = await this.jwtService.verifyAsync(token);
      request.user = this.toJwtPayload(payload);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }

  private toJwtPayload(payload: unknown): JwtPayload {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('sub' in payload) ||
      !('email' in payload)
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    const sub = Number(payload.sub);

    if (!Number.isInteger(sub) || typeof payload.email !== 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      sub,
      email: payload.email,
    };
  }
}
