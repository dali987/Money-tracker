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

        
        const accounts = await Account.find({ user: req.user._id})

        res.status(200).json({ success: true, data: accounts });
    }
    catch (error){
        console.error("An error occurred while getting user accounts: ", error)
        next(error)
    
    }
}

export const getAccount = async (req, res, next) =>{
    try{

        const { id: accountId } = req.params

        const account = await Account.findById(accountId)

        if (account.user._id.toString() !== req.user.id.toString()) {
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