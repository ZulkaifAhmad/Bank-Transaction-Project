import mongoose, { mongo } from "mongoose";

const transactionSchema =  new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId ,
        required : [true , "transaction must be associated with fromId"],
        unique : true ,
        ref : "accounts",
        index : 1
    } ,
    toAccount : {
        type : mongoose.Schema.Types.ObjectId ,
        required : [true , "transaction must be associated with fromId"],
        unique : true ,
        ref : "accounts",
        index : true
    } , 
    status : {
        type : String , 
        enum : {
            values : ["PENDING" , "COMPLETED" , "FAILED" , "REVERSED"]
        } , 
        default : "PENDING"
    } , 
    amount : {
        type : Number ,
        required : [true , "Amount is requierd for creating transcation"],
        min : 0
    } , 
    idempotencyKey : {
        type : String , 
        required : true , 
        unique : true ,
        index : true
    }
},{timestamps : true})

transactionSchema.index({fromAccount : 1 , idempotencyKey : 1 , toAccount : 1})

const Transaction = mongoose.model("transactions",transactionSchema);

export default Transaction;