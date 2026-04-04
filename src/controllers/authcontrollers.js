import userModel from '../models/usermodel.js';
import crypto from 'crypto';


export async function register(req, res) {
    const {username, email, password} = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        //
        $or : [  
            {username},
            {email}
        ]
    })
    //409 => Conflict
    if(isAlreadyRegistered) {
        return res.status(409).json({
            message:"Username or email already exists"
        })
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    //explain crypto working : The crypto module is used to hash the password before storing it in the database for security purposes.
    //sha256 is a hashing algorithm that generates a fixed-size string of characters (a hash) from the input data (the password).

    const user = await userModel.create({
        username,
        email,
        password : hashedPassword
    })

    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}