var ObjectId = require('mongodb').ObjectId;

class RatingRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async addRating(rating) {
        // Upsert: Nếu user đã đánh giá phim này rồi thì cập nhật, chưa thì thêm mới
        return await this.context.collection("rating").updateOne(
            { UserId: rating.UserId, MovieId: rating.MovieId },
            { $set: { Value: rating.Value, CreatedTime: rating.CreatedTime } },
            { upsert: true, session: this.session }
        );
    }

    async getRatingByUserAndMovie(userId, movieId) {
        try {
            const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
            const mId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
            return await this.context.collection("rating").findOne({ UserId: uId, MovieId: mId });
        } catch (error) { return null; }
    }

    async getAverageRating(movieId) {
        try {
            const mId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
            const result = await this.context.collection("rating").aggregate([
                { $match: { MovieId: mId } },
                { $group: { _id: "$MovieId", average: { $avg: "$Value" }, count: { $sum: 1 } } }
            ]).toArray();
            
            if (result.length > 0) {
                return { average: result[0].average, count: result[0].count };
            }
            return { average: 0, count: 0 };
        } catch (error) { return { average: 0, count: 0 }; }
    }
}
module.exports = RatingRepository;