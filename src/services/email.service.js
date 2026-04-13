import nodemailer from 'nodemailer';
import config from '../config.js';

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        type : 'OAuth2',
        user : config.GOOGLE_USER,
        clientId : config.GOOGLE_CLIENT_ID,
        clientSecret : config.GOOGLE_CLIENT_SECRET,
        refreshToken : config.GOOGLE_REFRESH_TOKEN
        
    }
})

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

