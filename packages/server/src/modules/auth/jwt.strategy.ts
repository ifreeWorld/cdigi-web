import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AUTH_CONFIG } from '../../constant/app.config';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('cdigi_token'),
      secretOrKey: AUTH_CONFIG.jwtSecret,
    });
  }

  async validate(payload: Partial<UserEntity>) {
    return { userId: payload.id, username: payload.username };
  }
}
