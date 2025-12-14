var ObjectId = require('mongodb').ObjectId;

class CommentRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertComment(comment) {
        return await this.context
            .collection("comment")
            .insertOne(comment, { session: this.session });
    }

    async getCommentsByMovie(movieId) {
        const mId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
        
        return await this.context
            .collection("comment")
            .aggregate([
                { $match: { MovieId: mId } },
                {
                    $lookup: {
                        from: "user",
                        localField: "UserId",
                        foreignField: "_id",
                        as: "UserInfo"
                    }
                },
                { $sort: { CreatedAt: -1 } },
                {
                    $project: {
                        Content: 1,
                        CreatedAt: 1,
                        MovieId: 1,
                        UserId: 1,
                        "UserInfo.Username": 1,
                        "UserInfo.Email": 1,
                        "UserInfo.Avatar": 1
                    }
                }
            ])
            .toArray();
    }

    async deleteComment(id, userId) {
        const commentId = typeof id === 'string' ? new ObjectId(id) : id;
        const uid = typeof userId === 'string' ? new ObjectId(userId) : userId;
        
        return await this.context
            .collection("comment")
            .deleteOne({ _id: commentId, UserId: uid }, { session: this.session });
    }
}

module.exports = CommentRepository;
