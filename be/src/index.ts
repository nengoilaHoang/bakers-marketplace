import express, { Request, Response} from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 4000;

app.use(helmet());

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
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express!!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});