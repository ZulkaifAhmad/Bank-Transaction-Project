import mongoose from "mongoose";
import Transaction from "./transaction.schema.js";

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

accountSchema.methods.getBalance = async function(){
    const accountId = this._id ;
    let credit = 0
    let debit = 0
    const getAllTransactions = await Transaction.find({
        $or : [
            {toAccount : accountId} ,
            {fromAccount : accountId}
        ] , 
        status : "COMPLETED"
    })
    if(getAllTransactions.length == 0) {
        return 0
    }
    for(let tx of getAllTransactions){
        if(tx.toAccount.equals(accountId)){
            credit += tx.amount
        }
        if(tx.fromAccount.equals(accountId)){
            debit += tx.amount
        }
    }

    console.log("credit" , credit)
    console.log("debit" , debit)

    return credit - debit
}

const Account = mongoose.model("accounts",accountSchema);

export default Account;