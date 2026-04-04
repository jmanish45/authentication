import {Router} from 'express';
import * as authController from "../controllers/authcontrollers.js" // Importing all functions from authcontrollers.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import userModel from '../models/usermodel.js';





const authRouter = Router();

authRouter.post('/register', authController.register); 

authRouter.post('/get-me', authController.getMe);




export default authRouter ; 

