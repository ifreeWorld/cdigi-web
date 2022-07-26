import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'cdigi',
      signOptions: { expiresIn: `${24 * 7}h` }, // 7天后过期
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
