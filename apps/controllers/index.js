var express = require("express");
var router = express.Router();
var Config = require(global.__basedir + "/Config/Setting.json");

var AuthMiddleware = require("../Middlewares/AuthMiddleware");
var UserController = require("./UserController"); 

// --- 1. ROUTER USER & AUTH ---
router.use("/profile", AuthMiddleware);
router.use("/", UserController);


// --- 2. ROUTER ADMIN ---
router.use("/admin", AuthMiddleware);
router.use("/admin/role", require("./admin/RoleController"));
router.use("/admin/category", require("./admin/CategoryController"));
router.use("/admin/movie", require("./admin/MovieController"));
router.use("/admin/episode", require("./admin/EpisodeController"));


// --- 3. CÁC TRANG GIAO DIỆN (FRONTEND) ---

router.get("/login-page", function(req, res){
    res.render("login");
});

// Trang Xem Phim (Giao diện)
router.get("/watch-movie", function(req, res){
    res.render("player", { token: null }); 
});


// Trang chủ
router.get("/", function(req, res){
    res.json({"message": "this is index page"});
});

module.exports = router;