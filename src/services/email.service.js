import nodemailer from 'nodemailer';
import config from '../config/config.js';

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

export const sendEmail = async (to, subject, text, html) => {
  try {
    const safeText = (text || '').trim();
    const safeHtml = (html || '').trim();

    const finalText = safeText || 'Please check this email in an HTML-capable client.';
    const finalHtml = safeHtml || `<p>${finalText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;

    const info = await transporter.sendMail({
      from: `"AUTH-MJ" <${config.GOOGLE_USER}>`,
      to,
      subject,
      text: finalText,
      html: finalHtml,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Accepted recipients:', info.accepted);
    console.log('Body lengths (text/html):', finalText.length, finalHtml.length);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

