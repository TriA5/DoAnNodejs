var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var CategoryRepository = require(global.__basedir + "/apps/Repository/CategoryRepository");
var Category = require(global.__basedir + "/apps/Entity/Category");

class CategoryService {
    client;
    database;
    categoryRepository;

    constructor() { }

    async init() {
        this.client = await DatabaseConnection.getMongoClient();
        this.database = this.client.db(Config.mongodb.database);
        return this;
    }

    // Lấy danh sách (Không cần Transaction)
    async getList() {
        this.categoryRepository = new CategoryRepository(this.database, null);
        return await this.categoryRepository.getCategories();
    }

    // Thêm mới (Cần Transaction)
    async createCategory(name, description) {
        const session = this.client.startSession();
        try {
            session.startTransaction();
            this.categoryRepository = new CategoryRepository(this.database, session);
            
            var category = new Category(name, description);
            var result = await this.categoryRepository.insertCategory(category);
            
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    // Cập nhật (Cần Transaction)
    async updateCategory(id, name, description) {
        const session = this.client.startSession();
        try {
            session.startTransaction();
            this.categoryRepository = new CategoryRepository(this.database, session);
            
            var updateData = {
                Name: name,
                Description: description
            };
            var result = await this.categoryRepository.updateCategory(id, updateData);
            
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    // Xóa (Cần Transaction)
    async deleteCategory(id) {
        const session = this.client.startSession();
        try {
            session.startTransaction();
            this.categoryRepository = new CategoryRepository(this.database, session);
            
            var result = await this.categoryRepository.deleteCategory(id);
            
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
module.exports = CategoryService;