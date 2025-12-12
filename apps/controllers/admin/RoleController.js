var express = require("express");
var router = express.Router();
var RoleService = require(global.__basedir + "/apps/Services/RoleService");
var ObjectId = require('mongodb').ObjectId;
var Role = require(global.__basedir + "/apps/Entity/Role");

// Lấy danh sách tất cả roles
router.get("/role-list", async function(req, res) {
    try {
        var roleService = await new RoleService().init();
        var roles = await roleService.getRoleList();
        res.json({ status: true, data: roles });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Lấy role theo ID
router.get("/role/:id", async function(req, res) {
    try {
        var roleService = await new RoleService().init();
        var role = await roleService.getRoleById(req.params.id);
        if (role) {
            res.json({ status: true, data: role });
        } else {
            res.status(404).json({ status: false, message: "Role not found" });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Thêm role mới
router.post("/insert-role", async function(req, res) {
    try {
        var roleService = await new RoleService().init();
        var role = new Role();
        role.Name = req.body.Name;
        role.Description = req.body.Description;
        var result = await roleService.insertRole(role);
        res.json({ 
            status: true, 
            message: "Role created successfully",
            data: result 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Cập nhật role
router.put("/update-role/:id", async function(req, res) {
    try {
        var roleService = await new RoleService().init();
        var updateData = {
            Name: req.body.Name,
            Description: req.body.Description
        };
        var result = await roleService.updateRole(req.params.id, updateData);
        res.json({ 
            status: true, 
            message: "Role updated successfully",
            data: result 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Xóa role
router.delete("/delete-role/:id", async function(req, res) {
    try {
        var roleService = await new RoleService().init();
        var result = await roleService.deleteRole(req.params.id);
        res.json({ 
            status: true, 
            message: "Role deleted successfully",
            data: result 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Render trang quản lý roles (nếu cần)
router.get("/", function(req, res) {
    res.render("admin/roleManage.ejs");
});

module.exports = router;
