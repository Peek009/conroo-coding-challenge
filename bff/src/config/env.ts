import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  EXTERNAL_API_BASE_URL: z.string().url().default('https://test.test.run.app'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
})

export const env = envSchema.parse(process.env)
