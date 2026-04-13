import userModel from '../models/usermodel.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import sessionModel from '../models/session.model.js';
import { sendEmail} from '../services/email.service.js';
import otpModel from '../models/otp.model.js';
import { generateOtp, getOtpHtml } from "../utils/utils.js"


export async function register(req, res) {
    const {username, email, password} = req.body;
    const isAlreadyRegistered = await userModel.findOne({
        
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

    const otp = generateOtp();
    const otpText = `Your OTP for email verification is ${otp}`;
    const html = getOtpHtml(otp);

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await otpModel.create({
        email,
        user : user._id,
        otpHash
    })

    await sendEmail(email, "OTP Verification", otpText, html)

    
    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            verified : user.verified
        },
        

    });

}

export async function login(req, res) {
    const {email, password} = req.body;
    
    const user = await userModel.findOne({email});

    if(!user) {
        return res.status(401).json({
            message : "Invalid email or password"
        }
    )}
    if(!user.verified) {
        return res.status(401).json({
            message : "Email not verified"
        })
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const isPasswordValid = hashedPassword === user.password;

    if(!isPasswordValid) {
        return res.status(401).json({
            message : "Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id : user._id
    }, config.JWT_SECRET,
        {
            expiresIn : "7d"
        }
    )

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex'); //update(refreshToken) means that the refresh token string is being passed as input to the hashing function. The createHash('sha256') method initializes a new hash object using the SHA-256 algorithm, and the update() method is used to feed the refresh token string into the hash object. Finally, the digest('hex') method computes the hash and returns it as a hexadecimal string, which is stored in the variable refreshTokenHash for secure storage in the database.
    
    const session  = await sessionModel.create({
        user : user._id,
        refreshTokenHash,
        ip : req.ip, // This line captures the IP address of the client making the login request. The req.ip property is provided by Express.js and contains the IP address of the client, which can be useful for security monitoring, logging, and detecting suspicious login activity.
        userAgent : req.headers['user-agent']
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId : session._id
    },
    config.JWT_SECRET,
        {
            expiresIn : '15m'
        }
    )
    res.cookie('refreshToken', refreshToken, {
        httpOnly : true,
        secure : true,
        sameSite : 'strict',
        maxAge : 7*24*60*60*1000 // 7 days in milliseconds
    })

    res.status(200).json({
        message : "Logged in successfully",
        accessToken,
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
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

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) {
        return res.status(401).json({
            message : 'No refresh token provided'
        })
    }



    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked : false
    });

    if(!session) {
        return res.status(401).json({
            message : 'Invalid refresh token'
        });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    const accessToken = jwt.sign({
        id: decoded.id
    },
    config.JWT_SECRET,
    {
        expiresIn : '15m'
    }
    )

    const newRefreshToken = jwt.sign({
        id : decoded.id
    }, config.JWT_SECRET, 
        {
            expiresIn : "7d"
        }
    )

    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save(); 

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly : true,
        secure : true,
        sameSite : "strict",
        maxAge : 7*24*60*60*1000
    })
    res.status(200).json({
        message : 'Access token refreshed successfully',
        accessToken

    })
    
}

export async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) {
        return res.status(401).json({
            message : "Refresh token not found",
        })
    }

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');  // This line creates a hash of the refresh token using the SHA-256 algorithm. Hashing the refresh token before storing it in the database adds an extra layer of security, as it prevents the actual token from being stored in plain text, reducing the risk of token theft and misuse.
    
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked : false
    })

    if(!session) {
        return res.status(400).json({
            message : "Invalid refresh token"
        })
    }

    session.revoked = true;
    await session.save();  // This line saves the updated session document to the database, ensuring that the revoked status is persisted and can be checked in future requests to prevent unauthorized access using the same refresh token.
    res.clearCookie("refreshToken")  // This line clears the refresh token cookie from the client's browser, effectively logging the user out by removing the token that would be used for refreshing access tokens in future requests.

    res.status(200).json({
        message : "Logged out successfully"
    })



}

export async function logoutAll (req, res) {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken) {
        return res.status(401).json({
            message : "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    await sessionModel.updateMany({
        user : decoded.id,
        revoked : false
    
    }, {
        revoked : true
    });

    res.clearCookie("refreshToken");

    return res.status(200).json({
        message : "Logged out from all devices successfully"
    });
}

export async function verifyEmail(req, res) {
    const {otp, email} = req.body;
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    })

    if(!otpDoc) {
        return res.status(200).json({
            message : "Invalid Otp"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user, {
        verified : true
    }, {
        new : true
    });

    await otpModel.deleteMany({
        user : otpDoc.user
    })

    return res.status(200).json({
        message : "Email verified successfully",
        user : {
            username : user.username,
            email : user.email,
            verified : user.verified
        }
    });
}