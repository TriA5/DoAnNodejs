var ObjectId = require('mongodb').ObjectId;

class MovieRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertMovie(movie) {
        return await this.context.collection("movie").insertOne(movie, { session: this.session });
    }

    async getList(limit = 20, skip = 0) {
        // Join với bảng Category để lấy tên thể loại luôn
        return await this.context.collection("movie").aggregate([
            { $sort: { CreatedTime: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "category",       // Tên bảng Category
                    localField: "CategoryId", // Trường liên kết bên Movie
                    foreignField: "_id",      // Trường liên kết bên Category
                    as: "CategoryInfo"        // Tên field mới chứa kết quả
                }
            }
        ]).toArray();
    }

    async getMovieById(id) {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.context.collection("movie").findOne({ _id: objectId });
        } catch (error) { return null; }
    }

    async deleteMovie(id) {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.context.collection("movie").deleteOne({ _id: objectId }, { session: this.session });
        } catch (error) { return null; }
    }
}
module.exports = MovieRepository;