import express from "express"
import {authUser} from "../middleware/auth.middleware.js"
import {createTransaction} from "../controller/transaction.controller.js"

const TransactionRouter = express.Router();

TransactionRouter.post("/create-transaction", authUser , createTransaction);

export default TransactionRouter ;
