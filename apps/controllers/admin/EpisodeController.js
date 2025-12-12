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
        // Lưu tạm vào thư mục 'uploads/temp'
        cb(null, global.__basedir + '/public/videos/temp/') 
    },
    filename: function (req, file, cb) {
        // Đặt tên file: timestamp-tenfile
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });


// 2. API Upload và Convert
// upload.single('video') nghĩa là trên Postman phải gửi field tên là 'video'
router.post("/create", upload.single('video'), async function(req, res) {
    try {
        if(!req.file) return res.status(400).json({message: "Chưa chọn file video!"});
        if(!req.body.MovieId) return res.status(400).json({message: "Thiếu MovieId"});

        // Lấy thông tin file vừa upload xong
        const inputPath = req.file.path;
        const fileName = req.file.filename.split('.')[0]; // Tên file không đuôi
        
        // Thư mục chứa video HLS sau khi cắt: public/videos/streams/<tên_file>
        const outputDir = path.join(global.__basedir, 'public', 'videos', 'streams', fileName);

        // --- BẮT ĐẦU CONVERT (Nặng) ---
        // Lưu ý: Với phim dài, không nên await ở đây mà nên dùng Queue (như BullMQ).
        // Nhưng với đồ án môn học, ta await luôn cho dễ demo.
        
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
        
        // Lưu đường dẫn file .m3u8 để sau này player gọi
        // Đường dẫn dạng: /static/videos/streams/..../playlist.m3u8
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