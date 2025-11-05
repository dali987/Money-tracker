import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["expense", "transfer", "income"],
    },
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "USD",
    },
    note: {
        type: String,
        default: ""
    },
    tags: {
        type: [{ type: String }],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
})

transactionSchema.pre("validate", function (next) {
  if (!this.fromAccount && !this.toAccount) {
    return next(new Error("Transaction must have either from account  or to account."));
  }
  next();
});

transactionSchema.pre("save", function (next) {
  if (this.fromAccount && this.toAccount) this.type = "transfer";
  else if (this.fromAccount) this.type = "expense";
  else if (this.toAccount) this.type = "income";
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema)

export default Transaction