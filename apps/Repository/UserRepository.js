class UserRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertUser(user) {
        return await this.context
            .collection("user")
            .insertOne(user, { session: this.session });
    }

    async getUserById(id) {
        return await this.context.collection("user").findOne({ _id: id });
    }

    async updateUser(id, data) {
        return await this.context
            .collection("user")
            .updateOne({ _id: id }, { $set: data }, { session: this.session });
    }
}

module.exports = UserRepository;
