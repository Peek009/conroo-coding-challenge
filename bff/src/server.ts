import 'dotenv/config';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './logger.js';
import { createSseHub } from './sse/sseHub.js';
import { startUpstreamSseClient } from './sse/upstreamSseClient.js';

const hub = createSseHub();
const app = createApp(hub);

startUpstreamSseClient((update) => hub.broadcast(update));

app.listen(env.PORT, () => {
  logger.info(`bff listening on port ${env.PORT}`);
});
