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
        return await this.context
            .collection("comment")
            .find({ MovieId: movieId })
            .toArray();
    }

    async deleteComment(id) {
        return await this.context
            .collection("comment")
            .deleteOne({ _id: id }, { session: this.session });
    }
}

module.exports = CommentRepository;
