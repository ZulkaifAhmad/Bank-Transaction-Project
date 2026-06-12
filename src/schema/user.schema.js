import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : [true , "username is required"] ,
        unique : [true , "username must be unique"] ,
        trim : true ,
        minlength : 5
    }  , 
    email : {
        type : String , 
        required : [true , "email is required"] ,
        unique : [true , "email must be unique"] ,
        match : /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }  , 
    password : {
        minlength : 6 ,
        require : true , 
        type : String ,
    }
}, {timestamps : true});

userSchema.pre("save" , async function (){
    if(!this.isModified("password")){
        return ;
    }
    const hashed = await bcrypt.hash(this.password , 10);
    this.password = hashed;
    return ;
})

userSchema.methods.comparePassword = async function(inputPassword){
    return await bcrypt.compare(inputPassword , this.password) 
}

const User = mongoose.model("users" , userSchema);

export default User;
