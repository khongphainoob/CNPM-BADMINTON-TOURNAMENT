import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './modules/auth/auth.routes.js';
import peopleRoutes from './modules/people/people.routes.js';
import tournamentRoutes from './modules/tournament/tournament.routes.js';
import competitionRoutes from './modules/competition/competition.routes.js';
import participationRoutes from './modules/participation/participation.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import reportingRoutes from './modules/reporting/reporting.routes.js';
import { notFound, errorHandler } from './middleware/error.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'badminton-tournament-api' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportingRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
