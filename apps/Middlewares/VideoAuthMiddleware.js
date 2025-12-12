var jwt = require("jsonwebtoken");
var Config = require(global.__basedir + "/Config/Setting.json");

const VideoAuthMiddleware = (req, res, next) => {
    let token = req.query.token;

    if (!token && req.headers.cookie) {
        const match = req.headers.cookie.match(/video_token=([^;]+)/);
        if (match) {
            token = match[1];
        }
    }

    if (!token) {
        return res.status(403).send("Forbidden: Missing Video Token");
    }

    try {
        const decoded = jwt.verify(token, Config.jwt_secret || "SecretKey123");
        req.user = decoded;

        res.setHeader('Set-Cookie', `video_token=${token}; Path=/; HttpOnly=true`);

        next(); 
    } catch (err) {
        return res.status(403).send("Forbidden: Invalid or Expired Token");
    }
};

module.exports = VideoAuthMiddleware;