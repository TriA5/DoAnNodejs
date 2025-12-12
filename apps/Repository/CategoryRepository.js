var ObjectId = require('mongodb').ObjectId;

class CategoryRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    // Thêm mới
    async insertCategory(category) {
        return await this.context
            .collection("category")
            .insertOne(category, { session: this.session });
    }

    // Lấy danh sách
    async getCategories() {
        return await this.context
            .collection("category")
            .find()
            .toArray();
    }

    // Lấy chi tiết 1 cái
    async getCategoryById(id) {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.context.collection("category").findOne({ _id: objectId });
        } catch (error) { return null; }
    }

    // Cập nhật
    async updateCategory(id, data) {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.context
                .collection("category")
                .updateOne({ _id: objectId }, { $set: data }, { session: this.session });
        } catch (error) { throw error; }
    }

    // Xóa
    async deleteCategory(id) {
        try {
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            return await this.context
                .collection("category")
                .deleteOne({ _id: objectId }, { session: this.session });
        } catch (error) { throw error; }
    }
}
module.exports = CategoryRepository;