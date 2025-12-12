var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var RoleRepository = require(global.__basedir + "/apps/Repository/RoleRepository");

class RoleService {
    roleRepository;
    session;
    client;
    database;

    constructor() {
        // Constructor đồng bộ
    }

    async init() {
        this.client = await DatabaseConnection.getMongoClient();
        await this.client.connect();
        this.session = this.client.startSession();
        this.database = this.client.db(Config.mongodb.database);
        this.session.startTransaction();
        this.roleRepository = new RoleRepository(this.database, this.session);
        return this;
    }

    async insertRole(role) {
        try {
            var result = await this.roleRepository.insertRole(role);
            await this.session.commitTransaction();
            await this.session.endSession();
            await this.client.close();
            return result;
        } catch (error) {
            await this.session.abortTransaction();
            await this.session.endSession();
            await this.client.close();
            throw error;
        }
    }

    async getRoleList() {
        try {
            var result = await this.roleRepository.getRoles();
            await this.session.commitTransaction();
            await this.session.endSession();
            await this.client.close();
            return result;
        } catch (error) {
            await this.session.abortTransaction();
            await this.session.endSession();
            await this.client.close();
            throw error;
        }
    }

    async getRoleById(id) {
        try {
            var result = await this.roleRepository.getRoleById(id);
            await this.session.commitTransaction();
            await this.session.endSession();
            await this.client.close();
            return result;
        } catch (error) {
            await this.session.abortTransaction();
            await this.session.endSession();
            await this.client.close();
            throw error;
        }
    }

    async updateRole(id, data) {
        try {
            var result = await this.roleRepository.updateRole(id, data);
            await this.session.commitTransaction();
            await this.session.endSession();
            await this.client.close();
            return result;
        } catch (error) {
            await this.session.abortTransaction();
            await this.session.endSession();
            await this.client.close();
            throw error;
        }
    }

    async deleteRole(id) {
        try {
            var result = await this.roleRepository.deleteRole(id);
            await this.session.commitTransaction();
            await this.session.endSession();
            await this.client.close();
            return result;
        } catch (error) {
            await this.session.abortTransaction();
            await this.session.endSession();
            await this.client.close();
            throw error;
        }
    }
}

module.exports = RoleService;
