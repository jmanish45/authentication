import express from 'express';
import morgan from 'morgan'; // For logging HTTP requests
import authRouter from './routes/authroutes.js';



const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRouter);

export default app;
