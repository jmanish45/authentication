import dotenv from 'dotenv'

dotenv.config() // Load environment variables from .env file
if(!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
    //why throw new Error : To ensure that the application fails fast if the required database URI is not provided, preventing runtime errors.
}
const config = {
    MONGO_URI: process.env.MONGO_URI

}  // You can add more configuration variables as needed, such as PORT, JWT_SECRET, etc.

export default config