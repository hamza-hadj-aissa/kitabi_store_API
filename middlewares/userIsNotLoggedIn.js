const userIsNotLoggedIn = (req, res, next) => {
    let refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "user is already logged in"
        });
    }
}

module.exports = userIsNotLoggedIn;