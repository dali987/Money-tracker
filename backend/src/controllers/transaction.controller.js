import Transaction from "../models/transaction.model.js"

export const createTransaction = async (req, res, next) =>{
    try{

        const transaction = Transaction.create({
            ...req.body,
        })

        res.status(201).json({ success: true, data: { transaction } });
    }
    catch (error){
        console.error("An error occurred while creating a transaction: ", error)
        next(error)
    }
}


export const getUserTransactions = async (req, res, next) =>{
    try{
        if(req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }
        
        const transactions = await Transaction.find({ user: req.user.id})

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

