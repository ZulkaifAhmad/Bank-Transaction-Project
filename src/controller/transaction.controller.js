import mongoose from "mongoose";
import Account from "../schema/account.schema.js";
import Transaction from "../schema/transaction.schema.js";
import Ledger from "../schema/ledger.schema.js";
import { SendTransactionEmail } from "../services/email.service.js";

async function createTransaction(req, res) {
  try {
    const { fromAccount, toAccount, status, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !status || !amount || !idempotencyKey) {
      return res.status(400).json({
        message:
          "fromAccount , toAccount , transactionStatus , Amount , idempotencyKey is required",
      });
    }

    const checkFromAccount = await Account.findOne({ _id: fromAccount });
    const checkToAccount = await Account.findOne({ _id: toAccount });

    if (!checkFromAccount) {
      return res.status(400).json({
        message: "From-Account not found",
      });
    }
    if (!checkToAccount) {
      return res.status(400).json({
        message: "To-Account not found",
      });
    }
    if (
      checkToAccount.status !== "ACTIVE" ||
      checkFromAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({
        message: "ToAccount or FromAccount must be active",
      });
    }

    const doesTransactionAlreadyExists = await Transaction.findOne({
      idempotencyKey,
    });

    if (doesTransactionAlreadyExists) {
      if (doesTransactionAlreadyExists.status == "COMPLETED") {
        return res.status(200).json({
          message: "Transaction Completed Already",
          AboutTransaction: doesTransactionAlreadyExists,
        });
      } else if (doesTransactionAlreadyExists.status == "PENDING") {
        return res.status(200).json({
          message: "Transaction is in Pending state!",
          AboutTransaction: doesTransactionAlreadyExists,
        });
      } else if (doesTransactionAlreadyExists.status == "FAILED") {
        return res.status(400).json({
          message: "Your Transaction is Failed please try again",
        });
      } else if (doesTransactionAlreadyExists.status == "REVERSED") {
        return res.status(300).json({
          message: "Your Transaction has been reversed",
        });
      }
    }

    const getUserBalance = await checkFromAccount.getBalance();

    if (getUserBalance < amount) {
      return res.status(400).json({
        message: `insufficent Balance for this transaction. Current Balance : ${getUserBalance} , requested Amount : ${amount}`,
      });
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const [transactionDoc] = await Transaction.create(
        [
          {
            fromAccount,
            toAccount,
            status: "PENDING",
            amount,
            idempotencyKey,
          },
        ],
        { session },
      );

      await Ledger.create(
        [
          {
            account: toAccount,
            amount,
            transaction: transactionDoc._id,
            type: "CREDIT",
          },
          {
            account: fromAccount,
            amount,
            transaction: transactionDoc._id,
            type: "DEBIT",
          },
        ],
        { session, ordered: true },
      );

      await Transaction.updateOne(
        { _id: transactionDoc._id },
        { status: "COMPLETED" },
        { session },
      );

      await session.commitTransaction();
      const sendTransactionEmail = await SendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        "success",
        toAccount,
      );
      console.log(sendTransactionEmail);
      res.status(201).json({
        message: "transaction completed successfully",
        "transaction Details": transactionDoc,
      });
    } catch (error) {
      await session.abortTransaction();
      await SendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        "failed",
        null,
        "Insufficient balance",
      );
      console.log(error);
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || error,
    });
  }
}

async function createInitialFunds(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.json({
      message: "toAccount , amount and idempotencykey not found",
    });
  }

  const findToAccount = await Account.findOne({ _id: toAccount });

  if (!findToAccount || findToAccount.status !== "ACTIVE") {
    return res.status(403).json({
      message: "Your Account not active || Invalid toAccount",
    });
  }

  const findFromAccount = await Account.findOne({
    user: req.user.id,
  });

  if (!findFromAccount) {
    console.log(findFromAccount);
    return res.status(404).json({
      message: "fromAccount or SystemUser Account not found",
    });
  }

  const existing = await Transaction.findOne({ idempotencyKey });
  if (existing) {
    return res.status(400).json({
      message: "Duplicate transaction request",
    });
  }

  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const [newTransaction] = await Transaction.create(
      [
        {
          fromAccount: findFromAccount._id,
          amount,
          status: "PENDING",
          toAccount,
          idempotencyKey,
        },
      ],
      { session },
    );

    const newLedger = await Ledger.create(
      [
        {
          account: toAccount,
          amount,
          transaction: newTransaction._id,
          type: "CREDIT",
        },
        {
          account: findFromAccount._id,
          amount,
          transaction: newTransaction._id,
          type: "DEBIT",
        },
      ],
      { session, ordered: true },
    );

    await Transaction.updateOne(
      { _id: newTransaction._id },
      { status: "COMPLETED" },
      { session },
    );

    await session.commitTransaction();

    res.status(201).json({
      message: "Transaction from systemAccount to userAccount has done",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: error,
    });
  } finally {
    await session.endSession();
  }
}

export { createTransaction, createInitialFunds };
