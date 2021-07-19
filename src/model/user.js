const mongoose = require('mongoose')
const validator = require('validator')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const Task = require('./task');

const userschema = new mongoose.Schema({
    name: {
        type: String,
        trim : true,
        required : true
    },
    email : {
        type : String,
        trim : true,
        unique : true,
        lowercase : true,
        required : true,
        validate : (value)=> {
            if(!validator.isEmail(value))
               throw new Error("Email is invalid")
        }
    },
    password : {
        type: String,
        required : true,
        minlength : 7,
        trim : true,
        validate : (value) => {
            if(value.includes("password")){
                throw new Error("Can not contains Password")
            }
        }

    },

    age : {
        type : Number,
        default: 0,
        validate(val){
            if(val<0){
                throw new Error("age can't be negative")
            }
        }
    },

    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
}, {
    timestamps: true
}) 

userschema.virtual('tasks' , {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

userschema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userschema.methods.generateAuthToken  = async function () {
    const user = this 
    var token = await jwt.sign({ _id : user._id.toString() }, process.env.JWT_SECRET);
   
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userschema.statics.findOneByCredentials = async (email, password)=>{
   
    const user = await User.findOne({email})
    if(!user){
        throw new Error("invalid email")
    }

    const ismatch = await bcrypt.compare(password, user.password)

    if(!ismatch){
        throw new Error("invalid password")
    }
    
    return user
}

userschema.pre("save", async function(next) {
   const user = this

   if(user.isModified('password')){
       const hashpassword = await bcrypt.hash(user.password , 8)
       user.password = hashpassword
   }

   next()
})

userschema.pre("remove", async function(next) {
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
 })

const User = mongoose.model("Users", userschema )

module.exports = User