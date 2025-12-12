var ObjectId = require('mongodb').ObjectId;

class EpisodeRepository {
    context;
    session;
    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertEpisode(ep) {
        return await this.context.collection("episode").insertOne(ep, { session: this.session });
    }

    async getEpisodesByMovie(movieId) {
        const mId = typeof movieId === 'string' ? new ObjectId(movieId) : movieId;
        return await this.context.collection("episode").find({ MovieId: mId }).toArray();
    }
}
module.exports = EpisodeRepository;