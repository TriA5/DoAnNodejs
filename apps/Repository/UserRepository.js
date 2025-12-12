var ObjectId = require('mongodb').ObjectId;

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

    async getUserByEmail(email) {
        return await this.context
            .collection("user")
            .findOne({ Email: email }); 
    }

    async getUserById(id) {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.context.collection("user").findOne({ _id: objectId });
        } catch (error) {
            return null;
        }
    }

    async updateUser(id, data) {
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        return await this.context
            .collection("user")
            .updateOne({ _id: objectId }, { $set: data }, { session: this.session });
    }
}

module.exports = UserRepository;