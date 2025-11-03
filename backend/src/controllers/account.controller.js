import Account from "../models/account.model.js";

export const createAccount = async (req, res, next) =>{
    try{

        const account = Account.create({
            ...req.body,
        })

        res.status(201).json({ success: true, data: { account } });
    }
    catch (error){
        console.error("An error occurred while creating an account: ", error)
        next(error)
    }
}

export const getUserAccounts = async (req, res, next) =>{
    try{
        if(req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }
        
        const accounts = await Transaction.find({ user: req.user.id})

        res.status(200).json({ success: true, data: accounts });
    }
    catch (error){
        console.error("An error occurred while getting user accounts: ", error)
        next(error)
    
    }
}

export const getAccount = async (req, res, next) =>{
    try{
        if(req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const { accountId } = req.body

        const account = await Account.findById(accountId)

        if (transaction.user._id.toString() !== req.user.id.toString()) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        res.status(200).json({ success: true, data: account })
    }
    catch (error){
        console.error("An error occurred while getting the account: ", error)
        next(error)
    }
}