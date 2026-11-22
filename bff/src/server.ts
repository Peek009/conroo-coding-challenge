import 'dotenv/config'

import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './logger.js'

const app = createApp()

app.listen(env.PORT, () => {
  logger.info(`bff listening on port ${env.PORT}`)
})
