
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

export const getTags = async (req, res, next) =>{
    try{
        if (!req.user) res.status(401).json({message: "Unauthorized"})
        res.status(200).json({ success: true, data: req.user.tags})
    }  
    catch (error) {
        console.error("An error occurred while getting tags: ", error)
        next(error)
    }
}

export const addTag = async (req, res, next) =>{
    try{
        if (!req.user) res.status(401).json({message: "Unauthorized"})

        const { tag } = req.body

        if (!tag) res.status(400).json({message: "Tag is required"})

        req.user.tags.push(tag)
        await req.user.save()

        res.status(200).json({ success: true, data: req.user.tags})
    }  
    catch (error) {
        console.error("An error occurred while adding tag: ", error)
        next(error)
    }
}

export const deleteTag = async (req, res, next) =>{
    try{
        if (!req.user) res.status(401).json({message: "Unauthorized"})

        const { tag } = req.body

        if (!tag) return res.status(400).json({message: "Tag is required"})

        req.user.tags.pull(tag)
        await req.user.save()

        res.status(200).json({ success: true, data: req.user.tags})
    }  
    catch (error) {
        console.error("An error occurred while deleting tag: ", error)
        next(error)
    }
}