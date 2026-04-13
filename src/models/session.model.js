import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    user : {  // reference to the user who owns this session
        type : mongoose.Schema.Types.ObjectId,
        ref : "users", // reference to the user collection
        required : [true, 'User reference is required']
    },
    refreshTokenHash : { // hash of the refresh token for security
        type : String,
        required : [true, 'Refresh token hash is required']
    },
    ip : {  // IP address of the client for security and logging purposes
        type :String,
        required : [true, "IP address is required"]
    },
    userAgent : {  // user agent string of the client for device identification
        type :String,
        required : [true, "User agent is required"]
    },
    revoked : {  // flag to indicate if the session has been revoked, useful for logout and security measures
        type :Boolean,
        default : false
    }

}, {
    timeStamps : true  // automatically add createdAt and updatedAt fields to the schema for tracking session creation and updates
})

const sessionModel = mongoose.model("sessions", sessionSchema);

export default sessionModel;