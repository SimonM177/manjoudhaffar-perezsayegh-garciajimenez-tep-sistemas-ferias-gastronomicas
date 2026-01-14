export const ENV = {
  PORT: process.env.PORT ?? '3003',
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: process.env.DB_PORT ?? '5432',
  DB_USERNAME: process.env.DB_USERNAME ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
  DB_NAME: process.env.DB_NAME ?? 'orders_service',
  PRODUCTS_TCP_HOST: process.env.PRODUCTS_HOST ?? '127.0.0.1',
  PRODUCTS_TCP_PORT: +(process.env.PRODUCTS_PORT ?? 3003),
  STALLS_TCP_HOST: process.env.STALLS_HOST ?? '127.0.0.1',
  STALLS_TCP_PORT: +(process.env.STALLS_PORT ?? 3002),
  USERS_TCP_HOST: process.env.USERS_HOST ?? '127.0.0.1',
  USERS_TCP_PORT: +(process.env.USERS_PORT ?? 3001),
};