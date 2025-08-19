import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// import routes
import registrationRoutes from './routes/registrationRoutes.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN, // misal: http://localhost:3000
    credentials: true,
  })
);

// ✅ mount routes
app.use('/api/registrations', registrationRoutes);

const port = Number(process.env.PORT || 5000);
app.listen(port, () =>
  console.log(`Backend listening on http://localhost:${port}`)
);
