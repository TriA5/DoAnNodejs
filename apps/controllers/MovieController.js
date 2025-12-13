var express = require("express");
var router = express.Router();
var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var MovieRepository = require(global.__basedir + "/apps/Repository/MovieRepository");
var EpisodeRepository = require(global.__basedir + "/apps/Repository/EpisodeRepository");
var ObjectId = require('mongodb').ObjectId;

// 1. Lấy danh sách phim (cho user)
router.get("/list", async function(req, res) {
    try {
        var client = await DatabaseConnection.getMongoClient();
        var database = client.db(Config.mongodb.database);
        var repo = new MovieRepository(database);

        var movies = await repo.getList();
        res.json({ status: true, data: movies });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 2. Lấy chi tiết phim + danh sách tập
router.get("/detail/:id", async function(req, res) {
    try {
        var client = await DatabaseConnection.getMongoClient();
        var database = client.db(Config.mongodb.database);
        var movieRepo = new MovieRepository(database);
        var episodeRepo = new EpisodeRepository(database);

        var movie = await movieRepo.getMovieById(req.params.id);
        if (!movie) {
            return res.status(404).json({ status: false, message: "Không tìm thấy phim" });
        }

        var episodes = await episodeRepo.getEpisodesByMovie(req.params.id);
        
        res.json({ 
            status: true, 
            data: { 
                movie: movie, 
                episodes: episodes 
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// 3. Tăng lượt xem
router.post("/view/:id", async function(req, res) {
    try {
        var client = await DatabaseConnection.getMongoClient();
        var database = client.db(Config.mongodb.database);
        
        const objectId = typeof req.params.id === 'string' ? new ObjectId(req.params.id) : req.params.id;
        await database.collection("movie").updateOne(
            { _id: objectId },
            { $inc: { View: 1 } }
        );
        
        res.json({ status: true, message: "Đã tăng view" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
