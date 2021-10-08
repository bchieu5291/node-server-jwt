const jwt = require('jsonwebtoken')
const Role = require('../ultilities/role')

const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.sendStatus(401)
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decoded)

        if (!decoded.roles || decoded.roles !== Role.Admin) {
            return res.sendStatus(403)
        }

        next()
    } catch (error) {
        console.log(error)
        return res.sendStatus(403)
    }
}

module.exports = {
    verifyAdminToken,
}
