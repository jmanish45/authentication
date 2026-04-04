import userModel from '../models/usermodel.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';


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

    const token = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
        token
    });

}

export async function getMe(req, res ) {
    const token = req.headers.authorization?.split(' ')[1]; //  Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET)

    const user = await userModel.findById(decoded.id)

    res.status(200).json({
        message: 'User details fetched successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}