var express = require("express");
var router = express.Router();

var AuthMiddleware = require("../Middlewares/AuthMiddleware");
var UserController = require("./UserController"); 

router.use("/profile", AuthMiddleware);



router.use("/", UserController);





router.use("/admin", AuthMiddleware);
router.use("/admin/role", require("./admin/RoleController"));
router.use("/admin/category", require("./admin/CategoryController"));
router.use("/admin/movie", require("./admin/MovieController"));
router.use("/admin/episode", require("./admin/EpisodeController"));

// Route test player
router.get("/test-player", function(req, res){
    // Render file player.ejs vừa tạo
    res.render("player"); 
});

// Trang chủ
router.get("/", function(req, res){
    res.json({"message": "this is index page"});
});

module.exports = router;