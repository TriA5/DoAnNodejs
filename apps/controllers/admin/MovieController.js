var express = require("express");
var router = express.Router();
var MovieService = require(global.__basedir + "/apps/Services/MovieService");

// Lấy danh sách phim
router.get("/", async function(req, res) {
    try {
        var service = await new MovieService().init();
        var list = await service.getList();
        res.json({ status: true, data: list });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Thêm phim mới
router.post("/create", async function(req, res) {
    try {
        if(!req.body.Name || !req.body.CategoryId) {
            return res.status(400).json({ status: false, message: "Thiếu Tên phim hoặc Thể loại" });
        }

        var service = await new MovieService().init();
        var result = await service.createMovie(req.body);
        
        res.json({ status: true, message: "Thêm phim thành công", data: result });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

router.delete("/delete/:id", async function(req, res) {
    try {
        var service = await new MovieService().init();
        var result = await service.deleteMovie(req.params.id);
        res.json({ status: true, message: "Xóa thành công", data: result });
    } catch (error) {
         res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;