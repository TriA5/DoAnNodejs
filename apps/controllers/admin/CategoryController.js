var express = require("express");
var router = express.Router();
var CategoryService = require(global.__basedir + "/apps/Services/CategoryService");

// 1. Xem danh sách
router.get("/", async function(req, res) {
    try {
        var service = await new CategoryService().init();
        var list = await service.getList();
        res.json({ status: true, data: list });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 2. Thêm mới
router.post("/create", async function(req, res) {
    try {
        if(!req.body.Name) {
            return res.status(400).json({ status: false, message: "Tên thể loại không được trống" });
        }

        var service = await new CategoryService().init();
        var result = await service.createCategory(req.body.Name, req.body.Description);
        
        res.json({ status: true, message: "Tạo thành công", data: result });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 3. Xóa
router.delete("/delete/:id", async function(req, res) {
    try {
        var service = await new CategoryService().init();
        var result = await service.deleteCategory(req.params.id);
        res.json({ status: true, message: "Xóa thành công", data: result });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;