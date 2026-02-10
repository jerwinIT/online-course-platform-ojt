import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("DIRECT_URL:", process.env.DIRECT_URL);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
    // shadowDatabaseUrl: env('DIRECT_URL'),
  },
})
        