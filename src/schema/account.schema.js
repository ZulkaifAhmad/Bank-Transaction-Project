import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true ,
        index : true
    } ,
    status : {
        type : String ,
        enum : {
            values : ["ACTIVE","FROZEN","CLOSED"] 
        } ,
        default : "ACTIVE"
    } , 
    currency : {
        type : String ,
        required : true ,
        default : "INR"
    }
},{timestamps : true});


accountSchema.index({user : 1 , status : 1})

const Account = mongoose.model("accounts",accountSchema);

export default Account;