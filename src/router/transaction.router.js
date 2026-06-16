import express from "express"
import {authSystemUser, authUser} from "../middleware/auth.middleware.js"
import {createTransaction , createInitialFunds} from "../controller/transaction.controller.js"

const TransactionRouter = express.Router();

TransactionRouter.post("/create-transaction", authUser , createTransaction);
TransactionRouter.post("/system/initial-funds" , authSystemUser , createInitialFunds)

export default TransactionRouter ;
