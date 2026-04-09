import express from 'express';
import morgan from 'morgan'; // For logging HTTP requests
import authRouter from './routes/authroutes.js';
import cookieParser  from 'cookie-parser';


const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());  // Middleware to parse cookies from incoming requests
//Parse means -> It takes the raw cookie header from the incoming HTTP request and converts it into a more usable format (like an object) that can be easily accessed in your route handlers. This allows you to read and manipulate cookies in your application.
app.use('/api/auth', authRouter);

export default app;
