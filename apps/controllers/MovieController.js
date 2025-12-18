var express = require("express");
var router = express.Router();
var DatabaseConnection = require(global.__basedir + "/apps/Database/Database");
var Config = require(global.__basedir + "/Config/Setting.json");
var MovieRepository = require(global.__basedir +
  "/apps/Repository/MovieRepository");
var EpisodeRepository = require(global.__basedir +
  "/apps/Repository/EpisodeRepository");
var RatingRepository = require(global.__basedir +
  "/apps/Repository/RatingRepository");
var BookmarkRepository = require(global.__basedir +
  "/apps/Repository/BookmarkRepository");
var Rating = require(global.__basedir + "/apps/Entity/Rating");
var ObjectId = require("mongodb").ObjectId;

// 1. Lấy danh sách phim (cho user)
router.get("/list", async function (req, res) {
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
router.get("/detail/:id", async function (req, res) {
  try {
    var client = await DatabaseConnection.getMongoClient();
    var database = client.db(Config.mongodb.database);
    var movieRepo = new MovieRepository(database);
    var episodeRepo = new EpisodeRepository(database);
    var ratingRepo = new RatingRepository(database);
    var bookmarkRepo = new BookmarkRepository(database);

    var movie = await movieRepo.getMovieById(req.params.id);
    if (!movie) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy phim" });
    }

    var episodes = await episodeRepo.getEpisodesByMovie(req.params.id);

    // Get Rating Info
    var ratingInfo = await ratingRepo.getAverageRating(req.params.id);
    var userRating = null;
    var isBookmarked = false;

    if (req.user && req.user._id) {
      userRating = await ratingRepo.getRatingByUserAndMovie(
        req.user._id,
        req.params.id
      );
      isBookmarked = await bookmarkRepo.checkBookmark(
        req.user._id,
        req.params.id
      );
    }

    res.json({
      status: true,
      data: {
        movie: movie,
        episodes: episodes,
        rating: ratingInfo,
        userRating: userRating ? userRating.Value : 0,
        isBookmarked: isBookmarked,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// 4. Đánh giá phim
router.post("/rate", async function (req, res) {
  try {
    var client = await DatabaseConnection.getMongoClient();
    var database = client.db(Config.mongodb.database);
    var ratingRepo = new RatingRepository(database);

    var rating = new Rating();
    rating.UserId = new ObjectId(req.user._id);
    rating.MovieId = new ObjectId(req.body.movieId);
    rating.Value = parseInt(req.body.value);

    if (rating.Value < 1 || rating.Value > 5) {
      return res
        .status(400)
        .json({ status: false, message: "Điểm đánh giá không hợp lệ" });
    }

    await ratingRepo.addRating(rating);

    // Return new average
    var newRatingInfo = await ratingRepo.getAverageRating(req.body.movieId);

    res.json({ status: true, data: newRatingInfo });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// 3. Tăng lượt xem
router.post("/view/:id", async function (req, res) {
  try {
    var client = await DatabaseConnection.getMongoClient();
    var database = client.db(Config.mongodb.database);

    const objectId =
      typeof req.params.id === "string"
        ? new ObjectId(req.params.id)
        : req.params.id;
    await database
      .collection("movie")
      .updateOne({ _id: objectId }, { $inc: { View: 1 } });

    res.json({ status: true, message: "Đã tăng view" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// 5. Toggle Bookmark
router.post("/bookmark", async function (req, res) {
  try {
    var client = await DatabaseConnection.getMongoClient();
    var database = client.db(Config.mongodb.database);
    var bookmarkRepo = new BookmarkRepository(database);

    var userId = req.user._id;
    var movieId = req.body.movieId;

    var isBookmarked = await bookmarkRepo.checkBookmark(userId, movieId);

    if (isBookmarked) {
      await bookmarkRepo.removeBookmark(userId, movieId);
      res.json({
        status: true,
        isBookmarked: false,
        message: "Đã xóa khỏi danh sách yêu thích",
      });
    } else {
      await bookmarkRepo.addBookmark(userId, movieId);
      res.json({
        status: true,
        isBookmarked: true,
        message: "Đã thêm vào danh sách yêu thích",
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// 6. Get Favorite Movies
router.get("/favorites", async function (req, res) {
  try {
    var client = await DatabaseConnection.getMongoClient();
    var database = client.db(Config.mongodb.database);
    var bookmarkRepo = new BookmarkRepository(database);

    var movies = await bookmarkRepo.getBookmarksByUser(req.user._id);
    res.json({ status: true, data: movies });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// 7. Cập nhật tiến trình xem
router.post("/update-progress", async function (req, res) {
  try {
    var client = await DatabaseConnection.getMongoClient();
    var database = client.db(Config.mongodb.database);
    var HistoryRepository = require(global.__basedir +
      "/apps/Repository/HistoryRepository");
    var historyRepo = new HistoryRepository(database);

    var userId = new ObjectId(req.user._id);
    var movieId = new ObjectId(req.body.movieId);
    var episode = req.body.episode;
    var currentTime = parseFloat(req.body.currentTime);
    var duration = parseFloat(req.body.duration);

    // Nếu đã xem trên 95% thì xóa tiến trình
    if (duration > 0 && currentTime / duration > 0.95) {
      await historyRepo.clearProgress(userId, movieId, episode);
      res.json({ status: true, message: "Đã xem xong", completed: true });
    } else {
      await historyRepo.updateProgress(
        userId,
        movieId,
        episode,
        currentTime,
        duration
      );
      res.json({ status: true, message: "Đã lưu tiến trình" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// 8. Lấy tiến trình xem
router.get("/get-progress/:movieId/:episode", async function (req, res) {
  try {
    var client = await DatabaseConnection.getMongoClient();
    var database = client.db(Config.mongodb.database);
    var HistoryRepository = require(global.__basedir +
      "/apps/Repository/HistoryRepository");
    var historyRepo = new HistoryRepository(database);

    var userId = new ObjectId(req.user._id);
    var movieId = new ObjectId(req.params.movieId);
    var episode = req.params.episode;

    var progress = await historyRepo.getProgress(userId, movieId, episode);

    if (progress && progress.CurrentTime > 0) {
      res.json({
        status: true,
        data: {
          currentTime: progress.CurrentTime,
          duration: progress.Duration,
          lastWatched: progress.LastWatched,
        },
      });
    } else {
      res.json({ status: true, data: null });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
