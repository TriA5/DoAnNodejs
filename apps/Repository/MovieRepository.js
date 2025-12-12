class MovieRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertMovie(movie) {
        return await this.context
            .collection("movie")
            .insertOne(movie, { session: this.session });
    }

    async getMovies() {
        return await this.context.collection("movie").find().toArray();
    }

    async getMovieById(id) {
        return await this.context.collection("movie").findOne({ _id: id });
    }

    async updateMovie(id, data) {
        return await this.context
            .collection("movie")
            .updateOne({ _id: id }, { $set: data }, { session: this.session });
    }

    async deleteMovie(id) {
        return await this.context
            .collection("movie")
            .deleteOne({ _id: id }, { session: this.session });
    }
}

module.exports = MovieRepository;
