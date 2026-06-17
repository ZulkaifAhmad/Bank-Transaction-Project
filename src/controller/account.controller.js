import Account from "../schema/account.schema.js";

async function CreateAccount(req, res) {
  try {
    const userId = req.user.id;

    const account = await Account.create({ user: userId });

    res.status(201).json({
      message: "account created",
      account: account,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: error,
    });
  }
}

async function GetAllAcounts(req, res) {
  try {
    const getAccounts = await Account.find().populate("user", "name");
    res.status(200).json({
      message: "Successfully Get All Accounts",
      accounts: getAccounts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
      ErrorMessage: error.message,
    });
  }
}

async function getAccountBalance(req, res) {
  try {
    const userId = req.params.id;

    const account = await Account.findOne({ _id: userId });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const balance = await account.getBalance(); 

    console.log(balance);

    res.status(200).json({
      message: "User Balance Fetched",
      balance: balance
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message || error,
    });
  }
}

export { CreateAccount , getAccountBalance , GetAllAcounts };
