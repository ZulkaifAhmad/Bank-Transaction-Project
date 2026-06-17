import mongoose from "mongoose";

const blockListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: [true, "token must be unique"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true },
);

blockListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });

const BlockListToken = mongoose.model("blocklisttoken" , blockListSchema);

export default BlockListToken ;
