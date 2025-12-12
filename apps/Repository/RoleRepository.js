var ObjectId = require('mongodb').ObjectId;

class RoleRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async insertRole(role) {
        return await this.context
            .collection("role")
            .insertOne(role, { session: this.session });
    }

    async getRoles() {
        return await this.context.collection("role").find().toArray();
    }

    async getRoleById(id) {
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        return await this.context.collection("role").findOne({ _id: objectId });
    }

    async updateRole(id, data) {
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        return await this.context
            .collection("role")
            .updateOne({ _id: objectId }, { $set: data }, { session: this.session });
    }

    async deleteRole(id) {
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        return await this.context
            .collection("role")
            .deleteOne({ _id: objectId }, { session: this.session });
    }
}

module.exports = RoleRepository;
