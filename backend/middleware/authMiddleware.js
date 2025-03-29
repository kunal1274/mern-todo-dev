
const {verifyToken}  = require("../utils/jwt");

const authMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;
    console.log(`AuthHeader : ${authHeader}`)

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).send({
            logType : "Error", // other types are info (green) or warning ( blue ) , error ( red )
            logColor : "Red",
            status : "Failed",
            msg : "No Token provided in the Authorization Header with Bearer .Please verify the header"
        })
    }

    const tokenExtracted = authHeader.split(' ')[1]; // 0 1 and taking the 1st index

    try{
        const decoded = verifyToken(tokenExtracted);
        req.user = decoded;
        next();

    }catch(err){
        return res.status(401).send({
            logType : "Error", // other types are info (green) or warning ( blue ) , error ( red )
            logColor : "Red",
            status : "Failed",
            msg : "Token is not valid"
        })

    }
}

module.exports = {authMiddleware};