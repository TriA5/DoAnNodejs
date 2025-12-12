class HistoryRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async saveHistory(history) {
        return await this.context
            .collection("history")
            .updateOne(
                { UserId: history.UserId, MovieId: history.MovieId },
                { $set: history },
                { upsert: true, session: this.session }
            );
    }

    async getHistory(userId) {
        return await this.context
            .collection("history")
            .find({ UserId: userId })
            .toArray();
    }
}

module.exports = HistoryRepository;
