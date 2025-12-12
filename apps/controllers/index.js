var express = require("express");
var router = express.Router();

var AuthMiddleware = require("../Middlewares/AuthMiddleware");
var UserController = require("./UserController"); 

router.use("/profile", AuthMiddleware);



router.use("/", UserController);





router.use("/admin", AuthMiddleware);
router.use("/admin/role", require("./admin/RoleController"));


// Trang chủ
router.get("/", function(req, res){
    res.json({"message": "this is index page"});
});

module.exports = router;