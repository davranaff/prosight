import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'hh-pgsql-public.ebi.ac.uk',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'reader',
  password: process.env.DB_PASSWORD || 'NWDMCE5xdipIjRrp',
  database: process.env.DB_DATABASE || 'pfmegrnargs',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: { expiresIn: '24h' },
};
