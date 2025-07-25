import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './core.service';
import { AuthController } from './core.controller';
import { JwtStrategy } from '../core/jwt.strategy';
import { jwtConfig } from '../main.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register(jwtConfig),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
