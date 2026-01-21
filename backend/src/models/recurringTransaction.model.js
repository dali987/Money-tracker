import mongoose from 'mongoose';

const recurringTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer'],
        required: true,
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
        required: true,
    },
    period: {
        type: Number,
        default: 1,
        // e.g., every 1 month, every 2 weeks. Combined with frequency.
        // For simplicity in V1, let's stick to simple "frequency" string enum or similar.
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    nextRunDate: {
        type: Date,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        default: '',
        maxlength: 200,
    },
    tags: {
        type: [{ type: String, maxlength: 20 }],
        default: [],
    },
    lastRunDate: {
        type: Date,
    },
});

recurringTransactionSchema.pre('validate', function (next) {
    if (!this.fromAccount && !this.toAccount) {
        return next(
            new Error('Recurring Transaction must have either from account or to account.'),
        );
    }

    // Set nextRunDate if not set (though controller should handle this)
    if (!this.nextRunDate) {
        this.nextRunDate = this.startDate;
    }
    next();
});

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);

export default RecurringTransaction;
