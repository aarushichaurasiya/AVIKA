const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const routes = require('./routes');
const { webhook } = require('./routes/paymentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

app.set('trust proxy', 1); // needed for correct client IPs behind Render/Heroku-style proxies

app.use(helmet());
app.use(
  cors({
    origin: [env.frontendUrl, env.adminUrl],
    credentials: true
  })
);
app.use(compression());

// Stripe webhook needs the RAW body to verify its signature, so this is
// registered before express.json() and is exempt from it.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhook);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize()); // strips $ and . from req.body/query/params to block NoSQL injection

app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
}

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
