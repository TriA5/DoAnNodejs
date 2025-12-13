var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var MovieRepository = require(global.__basedir + "/apps/Repository/MovieRepository");
var Movie = require(global.__basedir + "/apps/Entity/Movie");
var toSlug = require(global.__basedir + "/apps/Utils/Slug"); 
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
            
            // --- 1. GÁN DỮ LIỆU TỪ FORM (Đảm bảo đủ các trường trong Entity) ---
            movie.Name = data.Name;
            movie.OriginName = data.OriginName || "";
            movie.Content = data.Content || "";
            movie.Type = data.Type || "single";     // Mặc định phim lẻ
            movie.Status = data.Status || "ongoing"; // Mặc định đang tiến hành
            movie.Thumb = data.Thumb || "";
            movie.Time = data.Time || "Đang cập nhật"; 
            
            // QUAN TRỌNG: Ép kiểu Năm về số nguyên
            movie.Year = data.Year ? parseInt(data.Year) : new Date().getFullYear();
            
            // --- 2. TỰ ĐỘNG XỬ LÝ ---
            // Tạo Slug
            movie.Slug = toSlug(data.Name) + "-" + Date.now(); 

            // Convert CategoryId sang ObjectId
            if(data.CategoryId) {
                movie.CategoryId = new ObjectId(data.CategoryId);
            }

            // --- 3. LƯU VÀO DB ---
            var result = await this.movieRepository.insertMovie(movie);
            
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            // Thêm dòng này để debug lỗi nếu có
            console.log("❌ Lỗi Service CreateMovie:", error); 
            throw error;
        } finally {
            await session.endSession();
        }
    }
    
    // Hàm xóa phim 
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