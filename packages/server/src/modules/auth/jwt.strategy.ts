import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AUTH_CONFIG } from '../../constant/app.config';
import { JwtDto } from './dto/jwt.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('cdigi_token'),
      secretOrKey: AUTH_CONFIG.jwtSecret,
    });
  }

  async validate(payload: JwtDto) {
    const user = await this.usersService.findOne({
      username: payload.username,
      id: payload.id,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
