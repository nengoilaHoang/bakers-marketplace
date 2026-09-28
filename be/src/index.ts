import express, { Request, Response} from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.route.js';
import { errorMiddleware } from '#/middlewares/error.middleware.js';
import { connectRedis, disconnectRedis } from './redis.js';
import authenMailService from '#/services/authen-mail.service.js';

const app = express();
const PORT = 4000;

app.use(helmet());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const limit=ratelimit({
  windowMs:60*1000,
  max:200,
  message:"You are performing actions too quickly; please slow down."
});
app.use("/", limit);

morgan.token('time',()=>{
  const now = new Date();
  return now.toTimeString().split(' ')[0];
})
app.use(morgan('[RES] :time | :method | :url | :status | :response-time ms'))

import db from "#/db/index.js"
app.get('/health', async (req: Request, res: Response) => {
  const checkHealth: boolean = await db.checkConnection();
  if (checkHealth) {
    return res.status(200).json({
      status: 'UP',
      message: 'Kết nối Database thành công!!'
    });
  } else {
    return res.status(503).json({
      status: 'DOWN',
      message: 'Mất kết nối tới Database!'
    });
  }
});

app.set('json replacer', (key: string, value: unknown) => {
	if (value instanceof Map) {
		return Array.from(value.entries());
	}
	return value;
})

app.use("/api",router);

app.use(errorMiddleware);

async function bootstrap(): Promise<void> {
  try {
    await connectRedis();

    if (process.env.NODE_ENV !== 'production') {
      const testRecipient = process.env.AUTH_MAIL_TEST_TO?.trim()
        || process.env.EMAIL_USERNAME?.trim();

      if (testRecipient) {
        const verificationSent = await authenMailService.sendVerificationEmail(
          testRecipient,
          '',
          'Test User',
        );
        const resetPasswordSent = await authenMailService.sendResetPasswordEmail(
          testRecipient,
          '',
          'Test User',
        );

        console.log('Authentication email tests:', {
          verificationSent,
          resetPasswordSent,
        });
      } else {
        console.warn(
          'Authentication email tests skipped: AUTH_MAIL_TEST_TO is not configured',
        );
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/health`);
    });

    const shutdown = async () => {
      server.close(async () => {
        await disconnectRedis();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

void bootstrap();

