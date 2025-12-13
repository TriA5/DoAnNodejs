var jwt = require("jsonwebtoken");
var Config = require(global.__basedir + "/Config/Setting.json");

const verifyAdmin = (req, res, next) => {
    // Lấy token từ cookie hoặc header
    let token = req.cookies?.user_token || 
                req.headers["x-access-token"] || 
                req.headers["authorization"];

    if (!token) {
        // Nếu không có token, render trang yêu cầu đăng nhập với script redirect
        return res.send(`
            <html>
            <head><title>Yêu cầu đăng nhập</title></head>
            <body>
                <h2>🔒 Vui lòng đăng nhập</h2>
                <p>Đang chuyển hướng đến trang đăng nhập...</p>
                <script>
                    // Thử lấy token từ localStorage
                    const token = localStorage.getItem('user_token');
                    if (token) {
                        // Nếu có token, reload với cookie hoặc header
                        document.cookie = "user_token=" + token + "; path=/";
                        window.location.reload();
                    } else {
                        // Không có token, chuyển về login
                        setTimeout(() => {
                            window.location.href = "/login-page";
                        }, 1500);
                    }
                </script>
            </body>
            </html>
        `);
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    try {
        const decoded = jwt.verify(token, Config.jwt_secret || "SecretKey123");
        
        // Kiểm tra xem user có phải Admin không
        if (!decoded.isAdmin) {
            return res.send(`
                <html>
                <head><title>Không có quyền</title></head>
                <body>
                    <h2>🚫 Không có quyền truy cập</h2>
                    <p>Bạn không có quyền Admin để truy cập trang này!</p>
                    <p>Đang chuyển về trang xem phim...</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = "/watch-movie";
                        }, 2000);
                    </script>
                </body>
                </html>
            `);
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.send(`
            <html>
            <head><title>Token không hợp lệ</title></head>
            <body>
                <h2>⚠️ Phiên đăng nhập hết hạn</h2>
                <p>Vui lòng đăng nhập lại!</p>
                <script>
                    localStorage.removeItem('user_token');
                    document.cookie = "user_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    setTimeout(() => {
                        window.location.href = "/login-page";
                    }, 2000);
                </script>
            </body>
            </html>
        `);
    }
};

module.exports = verifyAdmin;
