import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js"
import Account from "../models/account.model.js";

export const createTransaction = async (req, res, next) =>{
    const session = await mongoose.startSession()
    session.startTransaction()

    try{

        const transaction = await Transaction.create({
            ...req.body,
        })

        const { amount, toAccount, fromAccount, type } = req.body

        
        const actions =  {
            income: async () => await Account.findByIdAndUpdate(toAccount, { $inc: { balance: amount} }, { session }),
            expense: async () => await Account.findByIdAndUpdate(fromAccount, { $inc: { balance: -amount} }, { session }), 
            transfer: async () => {
                await Account.findByIdAndUpdate(toAccount, { $inc: { balance: amount} }, { session })
                await Account.findByIdAndUpdate(fromAccount, { $inc: { balance: -amount} }, { session })
            }
        }

        await actions[type]()


        await session.commitTransaction()

        res.status(201).json({ success: true, data: { transaction } });
    }
    catch (error){
        console.error("An error occurred while creating a transaction: ", error)
        await session.abortTransaction()
        next(error)
    }
    finally{
        session.endSession()
    }
}


export const getUserTransactions = async (req, res, next) =>{
    try{

        const { id: accountId } = req.params


        const transactions = await Transaction.find({
            $or: [
                { toAccount: accountId},
                { fromAccount: accountId}
            ]
        })

        res.status(200).json({ success: true, data: transactions });
    }
    catch (error){
        console.error("An error occurred while getting user transactions: ", error)
        next(error)
    
    }
}



export const getTransaction = async (req, res, next) =>{
    try{
        if(req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const { transactionId } = req.body

        const transaction = await Transaction.findById(transactionId)

        if (transaction.user._id.toString() !== req.user.id.toString()) {
            const error = new Error('You are not the owner of this transaction');
            error.status = 401;
            throw error;
        }

        res.status(200).json({ success: true, data: transaction })
    }
    catch (error){
        console.error("An error occurred while getting the transaction: ", error)
        next(error)
    }
}
