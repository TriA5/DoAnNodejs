var express = require("express");
var router = express.Router();
var CommentService = require(global.__basedir + "/apps/Services/CommentService");

// 1. Lấy danh sách comment của phim
router.get("/movie/:movieId", async function(req, res) {
    try {
        var service = await new CommentService().init();
        var comments = await service.getCommentsByMovie(req.params.movieId);
        res.json({ status: true, data: comments });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 2. Thêm comment mới (cần đăng nhập)
router.post("/create", async function(req, res) {
    try {
        if (!req.body.MovieId || !req.body.Content) {
            return res.status(400).json({ 
                status: false, 
                message: "Thiếu MovieId hoặc Content" 
            });
        }

        // Lấy userId từ token (đã verify ở AuthMiddleware)
        const userId = req.user._id;

        var service = await new CommentService().init();
        var result = await service.createComment(
            req.body.MovieId,
            userId,
            req.body.Content
        );

        res.json({ 
            status: true, 
            message: "Đã thêm bình luận", 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 3. Xóa comment (chỉ xóa được comment của mình)
router.delete("/delete/:id", async function(req, res) {
    try {
        const userId = req.user._id;

        var service = await new CommentService().init();
        var result = await service.deleteComment(req.params.id, userId);

        res.json({ 
            status: true, 
            message: "Đã xóa bình luận" 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
