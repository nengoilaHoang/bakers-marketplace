import express, { Request, Response} from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.route.js';

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

app.use("/api",router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/health`);
});
