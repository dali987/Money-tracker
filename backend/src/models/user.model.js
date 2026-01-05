import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        currencies: {
            type: Array,
            default: ['EUR'],
        },
        baseCurrency: {
            type: String,
            default: 'USD',
        },
        groups: {
            type: [{ type: String, maxlength: 20 }],
            default: ['Cash', 'Bank', 'Credit'],
        },
        tags: {
            type: [{ type: String, maxlength: 20 }],
            default: [
                'Groceries',
                'Restaurant',
                'Rent',
                'Tax',
                'Health',
                'Clothes',
                'Transport',
                'Entertainment',
                'Salary',
                'Random',
                'Stationery',
                'Utilities',
                'Others',
            ],
        },

        profilePic: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
