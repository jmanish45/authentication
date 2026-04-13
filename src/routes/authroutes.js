import {Router} from 'express';
import * as authController from "../controllers/authcontrollers.js" // Importing all functions from authcontrollers.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import userModel from '../models/usermodel.js';





const authRouter = Router();

authRouter.post('/register', authController.register); 

authRouter.post('/login', authController.login);

authRouter.get('/get-me', authController.getMe);

authRouter.get('/refresh-token', authController.refreshToken);  // This route is used to refresh the access token using the refresh token stored in the cookie. When a client makes a request to this endpoint, the server will verify the refresh token and, if valid, generate a new access token for the client. This allows the client to maintain an authenticated session without requiring the user to log in again, as long as the refresh token is still valid.

authRouter.get('/logout', authController.logout);

authRouter.get('/logout-all', authController.logoutAll);

authRouter.post('/verify-email', authController.verifyEmail);


export default authRouter ; 

