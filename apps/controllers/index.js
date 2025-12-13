var express = require("express");
var router = express.Router();
var Config = require(global.__basedir + "/Config/Setting.json");

var AuthMiddleware = require("../Middlewares/AuthMiddleware");
var AdminMiddleware = require("../Middlewares/AdminMiddleware");
var UserController = require("./UserController"); 

// --- 1. ROUTER USER & AUTH ---
router.use("/profile", AuthMiddleware);
router.use("/", UserController);


// --- 2. ROUTER MOVIE (USER) ---
router.use("/movie", AuthMiddleware, require("./MovieController"));

// --- 3. ROUTER ADMIN ---
router.use("/admin", AuthMiddleware);
router.use("/admin/role", require("./admin/RoleController"));
router.use("/admin/category", require("./admin/CategoryController"));
router.use("/admin/movie", require("./admin/MovieController"));
router.use("/admin/episode", require("./admin/EpisodeController"));


// --- 4. CÁC TRANG GIAO DIỆN (FRONTEND) ---

router.get("/login-page", function(req, res){
    res.render("login");
});

// === TRANG NGƯỜI DÙNG ===
// Trang danh sách phim
router.get("/movies", AuthMiddleware, function(req, res){
    res.render("movies");
});

// Trang chi tiết phim
router.get("/movie/:id", AuthMiddleware, function(req, res){
    res.render("movie_detail");
});

// Trang xem phim
router.get("/player", AuthMiddleware, function(req, res){
    res.render("player");
});

// Legacy route
router.get("/watch-movie", function(req, res){
    res.redirect("/movies");
});

// ⚠️ BẢO VỆ TRANG ADMIN UI - CHỈ ADMIN MỚI VÀO ĐƯỢC
router.get("/admin-ui/movies", AdminMiddleware, function(req, res){
    // Truyền biến page: 'movies' xuống view
    res.render("admin/movie_list", { page: "movies" }); 
});

// Trang thêm phim
router.get("/admin-ui/movies/create", AdminMiddleware, function(req, res){
    res.render("admin/movie_add", { page: "movies" }); 
});
// Trang quản lý thể loại
router.get("/admin-ui/categories", function(req, res){
    res.render("admin/category_list", { page: "categories" }); 
});

router.get("/admin-ui/categories/create", function(req, res){
    res.render("admin/category_add", { page: "categories" }); 
});

// Trang quản lý tập phim
router.get("/admin-ui/episodes", AdminMiddleware, function(req, res){
    res.render("admin/episode_list", { page: "episodes" }); 
});

router.get("/admin-ui/episodes/upload", AdminMiddleware, function(req, res){
    res.render("admin/episode_upload", { page: "episodes" }); 
});


// Trang chủ
router.get("/", function(req, res){
    res.json({"message": "this is index page"});
});

module.exports = router;