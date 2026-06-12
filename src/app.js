import express from "express";
import router from "./router/auth.router.js";
import { accountRouter } from "./router/account.router.js";
import cookieParser from "cookie-parser";   

const app = express();

app.use(express.json());
app.use(express.Router());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/account", accountRouter);

export default app;
