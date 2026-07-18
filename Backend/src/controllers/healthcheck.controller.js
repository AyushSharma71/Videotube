

const healthcheck = async(req,res) =>{
    return res.status(200).json({
        message:"everthing fine"
    })
}

export {healthcheck}