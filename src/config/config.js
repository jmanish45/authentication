import dotenv from 'dotenv'

dotenv.config() // Load environment variables from .env file
if(!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
    //why throw new Error : To ensure that the application fails fast if the required database URI is not provided, preventing runtime errors.
}

if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');

}

if(!process.env.GOOGLE_CLIENT_IF) {
    throw new Error('GOOGLE_CLIENT_IF is not defined in environment variables');

}

if(!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not defined in environment variables');

}

if(!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not defined in environment variables');

}

if(!process.env.GOOGLE_USER) {
    throw new Error('GOOGLE_USER is not defined in environment variables');

}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET

}  // You can add more configuration variables as needed, such as PORT, JWT_SECRET, etc.
//201 : Created - The request has been fulfilled and has resulted in one or more new resources being created. This is typically used in response to a POST request that creates a new resource on the server.


export default config