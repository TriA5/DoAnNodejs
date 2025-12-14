var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var CommentRepository = require(global.__basedir + "/apps/Repository/CommentRepository");
var Comment = require(global.__basedir + "/apps/Entity/Comment");
var ObjectId = require('mongodb').ObjectId;

class CommentService {
    client;
    database;
    commentRepository;

    constructor() { }

    async init() {
        this.client = await DatabaseConnection.getMongoClient();
        this.database = this.client.db(Config.mongodb.database);
        return this;
    }

    // Lấy danh sách comment của phim
    async getCommentsByMovie(movieId) {
        this.commentRepository = new CommentRepository(this.database, null);
        return await this.commentRepository.getCommentsByMovie(movieId);
    }

    // Thêm comment mới
    async createComment(movieId, userId, content) {
        const session = this.client.startSession();
        try {
            session.startTransaction();
            this.commentRepository = new CommentRepository(this.database, session);

            var comment = new Comment();
            comment.MovieId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
            comment.UserId = typeof userId === 'string' ? new ObjectId(userId) : userId;
            comment.Content = content;

            var result = await this.commentRepository.insertComment(comment);

            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    // Xóa comment
    async deleteComment(commentId, userId) {
        const session = this.client.startSession();
        try {
            session.startTransaction();
            this.commentRepository = new CommentRepository(this.database, session);

            var result = await this.commentRepository.deleteComment(commentId, userId);

            if (result.deletedCount === 0) {
                throw new Error("Không tìm thấy comment hoặc bạn không có quyền xóa!");
            }

            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    // Đếm số comment
    async countComments(movieId) {
        this.commentRepository = new CommentRepository(this.database, null);
        return await this.commentRepository.countCommentsByMovie(movieId);
    }
}

module.exports = CommentService;
