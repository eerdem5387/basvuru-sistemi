import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local first, then .env
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL", { optional: false }),
  },
});

