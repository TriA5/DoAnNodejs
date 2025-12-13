var express = require("express");
var router = express.Router();
var multer = require('multer');
var path = require('path');
var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var TranscodeService = require(global.__basedir + "/apps/Services/TranscodeService");
var EpisodeRepository = require(global.__basedir + "/apps/Repository/EpisodeRepository");
var Episode = require(global.__basedir + "/apps/Entity/Episode");
var ObjectId = require('mongodb').ObjectId;

// 1. Cấu hình Multer (Nơi lưu file tạm khi mới upload lên)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, global.__basedir + '/public/videos/temp/') 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// 1. Lấy danh sách tập theo MovieId
router.get("/list/:movieId", async function(req, res) {
    try {
        var client = await DatabaseConnection.getMongoClient();
        var database = client.db(Config.mongodb.database);
        var repo = new EpisodeRepository(database);

        var episodes = await repo.getEpisodesByMovie(req.params.movieId);
        res.json({ status: true, data: episodes });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 2. Xóa tập phim
router.delete("/delete/:id", async function(req, res) {
    try {
        var client = await DatabaseConnection.getMongoClient();
        var database = client.db(Config.mongodb.database);
        var repo = new EpisodeRepository(database);

        await repo.deleteEpisode(req.params.id);
        res.json({ status: true, message: "Đã xóa tập phim" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 3. Upload và convert video
router.post("/create", upload.single('video'), async function(req, res) {
    try {
        if(!req.file) return res.status(400).json({message: "Chưa chọn file video!"});
        if(!req.body.MovieId) return res.status(400).json({message: "Thiếu MovieId"});


        const inputPath = req.file.path;
        const fileName = req.file.filename.split('.')[0]; 

        const outputDir = path.join(global.__basedir, 'public', 'videos', 'streams', fileName);

        console.log("⏳ Đang xử lý video...");
        var transcoder = new TranscodeService();
        await transcoder.transcodeToHLS(inputPath, outputDir, fileName);

        // --- LƯU VÀO DB ---
        var client = await DatabaseConnection.getMongoClient();
        var database = client.db(Config.mongodb.database);
        var repo = new EpisodeRepository(database);

        var ep = new Episode();
        ep.Name = req.body.Name || "Tập phim mới";
        ep.MovieId = new ObjectId(req.body.MovieId);

        ep.Path = `/static/videos/streams/${fileName}/playlist.m3u8`;

        await repo.insertEpisode(ep);

        res.json({ 
            status: true, 
            message: "Upload và Convert thành công!", 
            data: ep 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;