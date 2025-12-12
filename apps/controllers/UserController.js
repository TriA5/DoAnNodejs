var express = require("express");
var router = express.Router();
var UserService = require(global.__basedir + "/apps/Services/UserService");

router.post("/register", async function(req, res) {
    try {
        if (!req.body.Email || !req.body.Password) {
            return res.status(400).json({ status: false, message: "Vui lòng nhập Email và Password" });
        }

        var userService = await new UserService().init();
        var result = await userService.registerUser(req.body);
        
        res.json({ 
            status: true, 
            message: "Đăng ký thành công", 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


router.post("/login", async function(req, res) {
    try {
        var userService = await new UserService().init();
        var result = await userService.loginUser(req.body.Email, req.body.Password);
        
        res.json({ 
            status: true, 
            message: "Đăng nhập thành công", 
            data: result 
        });
    } catch (error) {
        res.status(401).json({ status: false, message: error.message });
    }
});

router.get("/profile/:id", async function(req, res) {
    try {
        var userService = await new UserService().init();
        var user = await userService.getUserProfile(req.params.id);
        res.json({ status: true, data: user });
    } catch (error) {
         res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;