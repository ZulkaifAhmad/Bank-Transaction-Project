import Account from "../schema/account.schema.js";
import express from "express";
import { authUser } from "../middleware/auth.middleware.js";
import {
  CreateAccount,
  getAccountBalance,
  GetAllAcounts,
} from "../controller/account.controller.js";

const accountRouter = express.Router();

accountRouter.post("/create", authUser, CreateAccount);
accountRouter.post("/get-balance/:id", authUser, getAccountBalance);
accountRouter.post("/get-accounts", authUser, GetAllAcounts);

export { accountRouter };
