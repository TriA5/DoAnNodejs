var express = require("express");
var app = express();
global.__basedir = __dirname;

// 1. Cấu hình đọc dữ liệu (Chỉ cần dùng express native là đủ, bỏ body-parser thừa)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Import Middleware bảo vệ video
var VideoAuthMiddleware = require(__dirname + "/apps/Middlewares/VideoAuthMiddleware");

// 3. CẤU HÌNH FILE TĨNH (STATIC) - THỨ TỰ RẤT QUAN TRỌNG!

// A. BẢO MẬT: Thư mục chứa video stream PHẢI đi qua Middleware trước
// Nếu ai đó truy cập /static/videos/streams/... -> Phải có Token mới được tải
app.use("/static/videos/streams", VideoAuthMiddleware, express.static(__dirname + "/public/videos/streams"));

// B. CÔNG KHAI: Các file tĩnh khác (CSS, JS, Poster ảnh...) thì thả cửa
app.use("/static", express.static(__dirname + "/public"));


// 4. Import Controller & View Engine
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");

var controller = require(__dirname + "/apps/controllers");
app.use(controller);

var server = app.listen(3000, function(){
   console.log("Server is running at http://localhost:3000");
});