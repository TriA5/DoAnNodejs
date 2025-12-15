var ObjectId = require('mongodb').ObjectId;

class BookmarkRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async addBookmark(userId, movieId) {
        const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        const mId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
        
        // Check if exists
        const exists = await this.context.collection("bookmark").findOne({ UserId: uId, MovieId: mId });
        if (exists) return exists;

        return await this.context.collection("bookmark").insertOne({
            UserId: uId,
            MovieId: mId,
            CreatedTime: new Date()
        }, { session: this.session });
    }

    async removeBookmark(userId, movieId) {
        const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        const mId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
        
        return await this.context.collection("bookmark").deleteOne({ UserId: uId, MovieId: mId }, { session: this.session });
    }

    async checkBookmark(userId, movieId) {
        try {
            const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
            const mId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
            const result = await this.context.collection("bookmark").findOne({ UserId: uId, MovieId: mId });
            return !!result;
        } catch (error) { return false; }
    }

    async getBookmarksByUser(userId) {
        const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        return await this.context.collection("bookmark").aggregate([
            { $match: { UserId: uId } },
            { $sort: { CreatedTime: -1 } },
            {
                $lookup: {
                    from: "movie",
                    localField: "MovieId",
                    foreignField: "_id",
                    as: "MovieInfo"
                }
            },
            { $unwind: "$MovieInfo" },
            // Lookup category for movie info
            {
                $lookup: {
                    from: "category",
                    localField: "MovieInfo.CategoryId",
                    foreignField: "_id",
                    as: "MovieInfo.CategoryInfo"
                }
            },
            {
                $project: {
                    _id: "$MovieInfo._id",
                    Name: "$MovieInfo.Name",
                    OriginName: "$MovieInfo.OriginName",
                    Thumb: "$MovieInfo.Thumb",
                    Year: "$MovieInfo.Year",
                    View: "$MovieInfo.View",
                    CategoryInfo: "$MovieInfo.CategoryInfo",
                    BookmarkedTime: "$CreatedTime"
                }
            }
        ]).toArray();
    }
}
module.exports = BookmarkRepository;