import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { AUTH_CONFIG } from '../../constant/app.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: AUTH_CONFIG.jwtSecret,
      signOptions: { expiresIn: `${24 * 7}h` }, // 7天后过期
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
