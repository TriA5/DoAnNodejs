var express = require("express");
var router = express.Router();
var UserService = require(global.__basedir + "/apps/Services/UserService");
var RoleService = require(global.__basedir + "/apps/Services/RoleService");

// List Users
router.get("/", async function(req, res) {
    try {
        var service = await new UserService().init();
        var users = await service.getListUsers();
        res.render("admin/user_list", { users: users, page: 'users' });
    } catch (error) {
        res.render("admin/user_list", { users: [], error: error.message, page: 'users' });
    }
});

// Edit User Page
router.get("/edit/:id", async function(req, res) {
    try {
        var userService = await new UserService().init();
        var roleService = await new RoleService().init();
        
        var user = await userService.getUserDetail(req.params.id);
        var roles = await roleService.getRoleList();
        
        res.render("admin/user_edit", { user: user, roles: roles, page: 'users' });
    } catch (error) {
        console.log(error);
        res.redirect("/admin/user");
    }
});

// Update User
router.post("/update", async function(req, res) {
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
        res.redirect("/admin/user");
    } catch (error) {
        console.log(error);
        res.redirect("/admin/user/edit/" + req.body.id);
    }
});

// Delete User
router.post("/delete", async function(req, res) {
    try {
        var service = await new UserService().init();
        await service.deleteUser(req.body.id);
        res.json({ status: true });
    } catch (error) {
        res.json({ status: false, message: error.message });
    }
});

module.exports = router;