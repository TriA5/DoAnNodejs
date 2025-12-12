class EpisodeRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertEpisode(ep) {
        return await this.context
            .collection("episode")
            .insertOne(ep, { session: this.session });
    }

    async getEpisodesByMovie(movieId) {
        return await this.context
            .collection("episode")
            .find({ MovieId: movieId })
            .toArray();
    }

    async updateEpisode(id, data) {
        return await this.context
            .collection("episode")
            .updateOne({ _id: id }, { $set: data }, { session: this.session });
    }

    async deleteEpisode(id) {
        return await this.context
            .collection("episode")
            .deleteOne({ _id: id }, { session: this.session });
    }
}

module.exports = EpisodeRepository;
