var jwt = require("jsonwebtoken");
var Config = require(global.__basedir + "/Config/Setting.json");

const verifyToken = (req, res, next) => {

    let token =
        req.body?.token || 
        req.query?.token || 
        req.cookies?.user_token ||  // Thêm cookie support
        req.headers["x-access-token"] || 
        req.headers["authorization"] ||
        req.headers["Authorization"];  // Thêm Authorization với chữ A hoa

    if (!token) {
        return res.status(403).json({ 
            status: false, 
            message: "Bạn cần đăng nhập để thực hiện chức năng này (Missing Token)" 
        });
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    try {
        const decoded = jwt.verify(token, Config.jwt_secret || "SecretKey123");
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(401).json({ 
            status: false, 
            message: "Token không hợp lệ hoặc đã hết hạn!" 
        });
    }
};

module.exports = verifyToken;