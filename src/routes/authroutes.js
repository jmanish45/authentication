import {Router} from 'express';
import * as authController from "../controllers/authcontrollers.js" // Importing all functions from authcontrollers.js
import jwt from 'jsonwebtoken';



const authRouter = Router();

authRouter.post('/register', authController.register); 

export default authRouter ; 

