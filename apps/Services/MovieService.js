var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var MovieRepository = require(global.__basedir + "/apps/Repository/MovieRepository");
var Movie = require(global.__basedir + "/apps/Entity/Movie");
var toSlug = require(global.__basedir + "/apps/Utils/Slug"); // Import hàm tạo slug
var ObjectId = require('mongodb').ObjectId;

class MovieService {
    client;
    database;
    movieRepository;

    constructor() { }

    async init() {
        this.client = await DatabaseConnection.getMongoClient();
        this.database = this.client.db(Config.mongodb.database);
        return this;
    }

    async getList() {
        this.movieRepository = new MovieRepository(this.database, null);
        return await this.movieRepository.getList();
    }

    async createMovie(data) {
        const session = this.client.startSession();
        try {
            session.startTransaction();
            this.movieRepository = new MovieRepository(this.database, session);
            
            var movie = new Movie();
            movie.Name = data.Name;
            movie.OriginName = data.OriginName || "";
            movie.Content = data.Content || "";
            movie.Type = data.Type || "single"; // Mặc định là phim lẻ
            movie.Status = data.Status || "ongoing";
            movie.Thumb = data.Thumb || "";
            movie.Time = data.Time || "";
            movie.Year = data.Year || new Date().getFullYear();
            
            // 1. Tự động tạo Slug từ tên phim
            // VD: "Người Nhện" -> "nguoi-nhen"
            movie.Slug = toSlug(data.Name) + "-" + Date.now(); // Thêm time để tránh trùng

            // 2. Convert CategoryId sang ObjectId
            if(data.CategoryId) {
                movie.CategoryId = new ObjectId(data.CategoryId);
            }

            var result = await this.movieRepository.insertMovie(movie);
            
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
    
    // Hàm xóa phim (Sẽ cần xóa cả các tập phim đi kèm - làm sau)
    async deleteMovie(id) {
         const session = this.client.startSession();
         try {
             session.startTransaction();
             this.movieRepository = new MovieRepository(this.database, session);
             var result = await this.movieRepository.deleteMovie(id);
             await session.commitTransaction();
             return result;
         } catch(e) {
             await session.abortTransaction(); throw e;
         } finally {
             await session.endSession();
         }
    }
}
module.exports = MovieService;