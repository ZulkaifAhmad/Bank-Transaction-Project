import Account from "../schema/account.schema.js";
import Transaction from "../schema/transaction.schema.js";

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
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || error,
    });
  }
}

export { createTransaction };
