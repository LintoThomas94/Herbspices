const mongoose = require("mongoose");
const {Schema}=mongoose;

const userSchema = new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
       type:String,
        required:false,
        unique:false,
        sparse:true,
        default:null 
    },
    googleId:{
        type:String,
    },
    password:{
        type:String,
        required:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    cart:[{
type:Schema.Types.ObjectId,
ref:"Cart",
    }],
    wallet:{
        type:Number,
        default:0,
    },
    wishlist:[{
       type:Schema.Types.ObjectId,
ref:"wishlist", 
    }],
    orderHistory:[{
        type:Schema.Types.ObjectId,
ref:"order", 
    }],
    createdOn:{
        type:Date,
        default:Date.now,
    },
    referalcode:{
        type:String, 
        // required:true
    },
    redeemed:{
        type:Boolean,
        // required:false
    },
    redeemedUsers:[{
        type:Schema.Types.ObjectId,
ref:"user", 
// required:true
    }],
    searchHistory: [{
        category:{
type:Schema.Types.ObjectId,
ref:"Category", 
        },
        brand:{
            type:String,
        },
        searchOn:{
            type:Date,
            default:Date.now,
        }
    }]
})
const User = mongoose.model("User",userSchema);

module.exports = User;