import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
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
    note: {
        type: String,
        default: '',
        maxlength: 200,
    },
    tags: {
        type: [{ type: String, maxlength: 20 }],
        default: [],
    },

    date: {
        type: Date,
        default: Date.now,
    },
});

transactionSchema.pre('validate', function (next) {
    if (!this.fromAccount && !this.toAccount) {
        return next(new Error('Transaction must have either from account  or to account.'));
    }
    next();
});

// ============================================================================
// DATABASE INDEXES
// ============================================================================
// Indexes speed up queries by creating sorted data structures for quick lookups.
// Without indexes, MongoDB must scan every document (O(n)).
// With indexes, it performs binary search (O(log n)).
//
// Trade-off: Indexes speed up reads but slightly slow down writes (must update index).
// Only add indexes for fields you frequently query/filter/sort by.
// ============================================================================

// Primary lookup pattern: Find transactions by account, sorted by date (most common)
// Used by: getTransactionWithFilter, getTransactionChartData, getNetWorthChartData
transactionSchema.index({ fromAccount: 1, date: -1 });
transactionSchema.index({ toAccount: 1, date: -1 });

// Date-only index for time-range queries and sorting
// Used by: Paginated queries with date sorting, chart aggregations
transactionSchema.index({ date: -1 });

// Type + date for filtered queries (e.g., "all expenses this month")
// Used by: Chart data grouping by type
transactionSchema.index({ type: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
