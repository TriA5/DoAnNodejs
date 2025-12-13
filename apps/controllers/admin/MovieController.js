var express = require("express");
var router = express.Router();
var multer = require('multer');
var path = require('path');
var MovieService = require(global.__basedir + "/apps/Services/MovieService");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, global.__basedir + '/public/images/movies/') 
    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false);
    }
};


const upload = multer({ storage: storage, fileFilter: fileFilter });


router.get("/", async function(req, res) {
    try {
        var service = await new MovieService().init();
        var list = await service.getList();
        res.json({ status: true, data: list });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});


router.post("/create", upload.single('ThumbFile'), async function(req, res) {
    try {
        if(!req.body.Name || !req.body.CategoryId) {
            return res.status(400).json({ status: false, message: "Thiếu Tên phim hoặc Thể loại" });
        }


        if (req.file) {

            req.body.Thumb = `/static/images/movies/${req.file.filename}`;
        } else {
            req.body.Thumb = req.body.ThumbUrl || "";
        }

        var service = await new MovieService().init();
        var result = await service.createMovie(req.body);
        
        res.json({ status: true, message: "Thêm phim thành công", data: result });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Xóa phim
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