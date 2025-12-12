var express = require("express");
var router = express.Router();
// router.use("/admin", require(__dirname + "/admin/admincontroller"));
// router.use("/about", require(__dirname + "/aboutcontroller"));
router.use("/admin/role", require(__dirname + "/admin/RoleController"));
router.get("/", function(req,res){
    res.json({"message": "this is index page"});
});

module.exports = router;