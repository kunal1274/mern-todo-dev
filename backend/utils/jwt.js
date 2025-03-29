const jwt = require(`jsonwebtoken`);

const generateToken = (user) => {
    const signedToken = jwt.sign({id : user._id},process.env.JWT_SECRET,{expiresIn : '1h'});
    
    return signedToken;
}

const verifyToken = (token) => {
    const tokenFlag = jwt.verify(token,process.env.JWT_SECRET);

    return tokenFlag;
}

module.exports = {generateToken,verifyToken}