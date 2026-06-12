import Account from "../schema/account.schema.js";
import express from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { CreateAccount } from "../controller/account.controller.js";

const accountRouter = express.Router();

accountRouter.post("/create", authUser, CreateAccount);

export { accountRouter };
