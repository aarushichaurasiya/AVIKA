require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

async function start() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`Avika API running on port ${env.port} [${env.nodeEnv}]`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
}

start();
