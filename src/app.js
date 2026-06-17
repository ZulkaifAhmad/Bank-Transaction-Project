import express from "express";
import router from "./router/auth.router.js";
import { accountRouter } from "./router/account.router.js";
import cookieParser from "cookie-parser";   
import TransactionRouter from "./router/transaction.router.js";

const app = express();

app.use(express.json());
app.use(express.Router());
app.use(cookieParser());

app.use("/",(req , res) => {
    res.status(200).json({
        "message" : "Ledger Entry System is Running..."
    })
})

app.use("/api/auth", router);
app.use("/api/account", accountRouter);
app.use("/api/transaction", TransactionRouter);

export default app;
