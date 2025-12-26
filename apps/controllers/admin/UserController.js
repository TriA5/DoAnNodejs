var express = require("express");
var router = express.Router();
var UserService = require(global.__basedir + "/apps/Services/UserService");
var RoleService = require(global.__basedir + "/apps/Services/RoleService");

// Render User List Page (View)
router.get("/", async function(req, res) {
    res.render("admin/user_list", { page: 'users' });
});

// Render Edit User Page (View)
router.get("/edit/:id", async function(req, res) {
    res.render("admin/user_edit", { userId: req.params.id, page: 'users' });
});

// API: Get List Users
router.get("/api/list", async function(req, res) {
    try {
        var service = await new UserService().init();
        var users = await service.getListUsers();
        res.json({ status: true, data: users });
    } catch (error) {
        res.json({ status: false, message: error.message });
    }
});

// API: Get User Detail
router.get("/api/detail/:id", async function(req, res) {
    try {
        var userService = await new UserService().init();
        var user = await userService.getUserDetail(req.params.id);
        res.json({ status: true, data: user });
    } catch (error) {
        res.json({ status: false, message: error.message });
    }
});

// API: Get All Roles
router.get("/api/roles", async function(req, res) {
    try {
        var roleService = await new RoleService().init();
        var roles = await roleService.getRoleList();
        res.json({ status: true, data: roles });
    } catch (error) {
        res.json({ status: false, message: error.message });
    }
});

// API: Update User
router.post("/api/update", async function(req, res) {
    try {
        var service = await new UserService().init();
        var id = req.body.id;
        var data = {
            Username: req.body.Username,
            Email: req.body.Email,
            RoleIds: req.body.RoleIds // Expecting array of role IDs
        };
        
        // Handle RoleIds if it comes as a single string or undefined
        if (!data.RoleIds) {
            data.RoleIds = [];
        } else if (!Array.isArray(data.RoleIds)) {
            data.RoleIds = [data.RoleIds];
        }

        await service.updateUserAdmin(id, data);
        res.json({ status: true, message: "Cập nhật thành công!" });
    } catch (error) {
        res.json({ status: false, message: error.message });
    }
});

// API: Delete User
router.post("/api/delete", async function(req, res) {
    try {
        var service = await new UserService().init();
        await service.deleteUser(req.body.id);
        res.json({ status: true, message: "Xóa thành công!" });
    } catch (error) {
        res.json({ status: false, message: error.message });
    }
});

module.exports = router;