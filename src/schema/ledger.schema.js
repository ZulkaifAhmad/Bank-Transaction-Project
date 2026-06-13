import mongoose, { mongo } from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
      required: [true, "Account must be associated with ledger"],
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: [true, "amount is required for creating ledger account"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transactions",
      required: [true, "transaction must be associated with ledger"],
      immutable: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ["DEBIT", "CREDIT"],
        message: "Type can be either Debit or credit",
      },
      required: [true, "Ledger type is required"],
      immutable: true,
    },
  },
  { timestamps: true },
);

ledgerSchema.index({ account: 1, transaction: 1 });
function ledgerCanNotBeModified() {
  throw new Error("Ledger can not be modified , deleted or updated");
}

ledgerSchema.pre("deleteMany", ledgerCanNotBeModified);
ledgerSchema.pre("deleteOne", ledgerCanNotBeModified);
ledgerSchema.pre("findOneAndDelete", ledgerCanNotBeModified);
ledgerSchema.pre("findOneAndUpdate", ledgerCanNotBeModified);
ledgerSchema.pre("findOneAndReplace", ledgerCanNotBeModified);
ledgerSchema.pre("updateMany", ledgerCanNotBeModified);
ledgerSchema.pre("updateOne", ledgerCanNotBeModified);
ledgerSchema.pre("remove", ledgerCanNotBeModified);

const Ledger = mongoose.model("ledger", ledgerSchema);

export default Ledger;
