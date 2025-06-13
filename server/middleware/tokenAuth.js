import jwt from "jsonwebtoken"

async function tokenAuth(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Token not found",
                error: true,
                success: false
            })
        }

        const verifiedToken = jwt.verify(token, "mysecretcode");
        
        if (!verifiedToken) {
            return res.status(401).json({
                message: "Incorrect token data",
                error: true,
                success: false
            })
        } else {
            req.userData = { userId: verifiedToken.userId, email: verifiedToken.email }
            next();
        }

    } catch (err) {
        return res.status(500).json({
            message: err,
            type: "Internal Server Error",
            error: true,
            success: false,
        })
    }
}

export default tokenAuth