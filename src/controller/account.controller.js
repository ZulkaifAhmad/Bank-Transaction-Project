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

export { CreateAccount };
