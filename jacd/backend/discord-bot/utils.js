const jwt = require("jsonwebtoken");
const jwt_secret = "this is a secret secret";

module.exports = {
    decodeToken: function (token) {
        return jwt.verify(token, jwt_secret);
    },
    verifyToken: function (token, uid) {
        const data = jwt.verify(token, jwt_secret);
        if (data.uid != uid) return false;
        else return true;
    },
}
