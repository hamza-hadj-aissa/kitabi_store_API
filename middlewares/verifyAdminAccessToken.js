const verifyAdminAccessToken = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    require('dotenv').config({
        path: '../.env'
    });
    // get the accessToken from the headers
    let accessToken = req.headers?.authorization;

    if (!accessToken) {
        return res.sendStatus(401);
    }

    accessToken = accessToken.split(' ')[1];
    // verify the accessToken
    jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
        if (!err) {
            if (decoded.role === 'admin') {
                // valid accessToken
                let user = {
                    id: decoded.id,
                    role: decoded.role,
                };
                req.user = user;
                next();
            } else {
                return res.sendStatus(403);
            }
        } else {
            // invalid accessToken
            return res.sendStatus(401);
        }
    })
}

module.exports = verifyAdminAccessToken;