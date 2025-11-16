
export const getUser = async (req, res, next) =>{
    try{

        if (!req.user) res.status(401).json({message: "Unauthorized"})
        res.status(200).json({ success: true, data: req.user})
    }  
    catch (error) {
        console.error("An error occurred while getting user: ", error)
        next(error)
    }
}