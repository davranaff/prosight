import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { databaseConfig, jwtConfig } from './main.config';
import { LocusModule } from './locus/locus.module';
import { AuthModule } from './core/core.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    JwtModule.register(jwtConfig),
    RouterModule.register([
      {
        path: 'api/v1/',
        children: [
          {
            path: 'auth',
            module: AuthModule,
          },
          {
            path: 'locus',
            module: LocusModule,
          },
        ],
      },
    ]),
    AuthModule,
    LocusModule,
  ],
})
export class AppModule {}
